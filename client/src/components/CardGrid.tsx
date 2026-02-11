import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCards, claimCard } from "@/services/cardService";
import { getMe } from "@/services/userService";
import { type Card } from "@/types/card";

const MAX_CLAIMS = 3;
const CLAIM_WINDOW_MS = 2 * 60 * 1000;
const COOLDOWN_FALLBACK_MS = 10 * 1000;

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object") {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;

    const maybeResponse = (err as { response?: unknown }).response;
    if (maybeResponse && typeof maybeResponse === "object") {
      const data = (maybeResponse as { data?: unknown }).data;
      if (data && typeof data === "object") {
        const msg = (data as { message?: unknown }).message;
        if (typeof msg === "string") return msg;
      }
    }
  }
  return "Request failed";
};

const parseWaitSeconds = (message: string): number | null => {
  const match = message.match(/Wait (\d+) seconds/i);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isNaN(seconds) ? null : seconds;
};

const InfoTip: React.FC<{ text: string }> = ({ text }) => (
  <span className="group relative inline-flex">
    <span className="text-[10px] border border-amber-300/40 rounded-full px-1.5 py-0.5">
      i
    </span>
    <span className="absolute left-0 top-5 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded border border-white/10 w-56">
      {text}
    </span>
  </span>
);

const CardGrid: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [claimHistory, setClaimHistory] = useState<number[]>([]);
  const [now, setNow] = useState(Date.now());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [cooldownTooltip, setCooldownTooltip] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setClaimHistory((prev) => prev.filter((t) => now - t < CLAIM_WINDOW_MS));
    if (cooldownUntil && now >= cooldownUntil) setCooldownUntil(null);
    if (rateLimitUntil && now >= rateLimitUntil) setRateLimitUntil(null);
  }, [now, cooldownUntil, rateLimitUntil]);

  const fetchCards = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) return;
      const me = await getMe(token);
      setCurrentUserId(me._id);
      if (me.cooldownUntil) {
        const ts = new Date(me.cooldownUntil).getTime();
        if (ts > Date.now()) setCooldownUntil(ts);
      }
      const data = await getCards(token);
      setCards(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }, []);

  const refreshUserCooldown = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const me = await getMe(token);
      if (me.cooldownUntil) {
        const ts = new Date(me.cooldownUntil).getTime();
        setCooldownUntil(ts > Date.now() ? ts : null);
      } else {
        setCooldownUntil(null);
      }
    } catch {
      // no-op: keep current cooldownUntil if refresh fails
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const remainingAttempts = useMemo(() => {
    return Math.max(0, MAX_CLAIMS - claimHistory.length);
  }, [claimHistory.length]);

  const resetInSeconds = useMemo(() => {
    if (claimHistory.length === 0) return 0;
    const oldest = Math.min(...claimHistory);
    return Math.max(0, Math.ceil((oldest + CLAIM_WINDOW_MS - now) / 1000));
  }, [claimHistory, now]);

  const cooldownRemaining = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  }, [cooldownUntil, now]);

  const rateLimitRemaining = useMemo(() => {
    if (!rateLimitUntil) return 0;
    return Math.max(0, Math.ceil((rateLimitUntil - now) / 1000));
  }, [rateLimitUntil, now]);

  const isCardExpired = useCallback(
    (card: Card) =>
      !!card.expiresAt && new Date(card.expiresAt).getTime() <= now,
    [now]
  );

  const isCardActive = useCallback(
    (card: Card) =>
      !!card.expiresAt && new Date(card.expiresAt).getTime() > now,
    [now]
  );

  const isCardAvailable = useCallback(
    (card: Card) => !card.ownerId || isCardExpired(card),
    [isCardExpired]
  );

  const activeMyCardsCount = useMemo(() => {
    if (!currentUserId) return 0;
    return cards.filter(
      (c) => c.ownerId === currentUserId && isCardActive(c)
    ).length;
  }, [cards, currentUserId, isCardActive]);

  const isGlobalDisabled =
    loadingId !== null || cooldownRemaining > 0 || rateLimitRemaining > 0;

  const handleClaim = useCallback(
    async (cardId: string) => {
      if (inFlightRef.current) return;
      if (cooldownRemaining > 0) {
        setCooldownTooltip(
          "You are in cooldown. Please wait until timer ends."
        );
        return;
      }
      if (rateLimitRemaining > 0) {
        setError(`Rate limit reached. Try again in ${rateLimitRemaining}s.`);
        return;
      }
      if (activeMyCardsCount >= 2) {
        setError("You already have maximum active cards.");
        return;
      }
      if (remainingAttempts <= 0) {
        setError("Rate limit exceeded. Please wait for reset.");
        return;
      }

      try {
        inFlightRef.current = true;
        setError(null);
        setCooldownTooltip(null);
        setLoadingId(cardId);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required.");
          return;
        }

        const card = cards.find((c) => c._id === cardId);
        if (card && !isCardAvailable(card)) {
          setError("This card is already claimed.");
          return;
        }

        const updated = await claimCard(cardId, token);
        setCards((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        await refreshUserCooldown();
        setClaimHistory((prev) => [...prev, Date.now()]);
      } catch (err: unknown) {
        const message = getErrorMessage(err);

        if (message.includes("Cooldown")) {
          const seconds = parseWaitSeconds(message);
          setCooldownUntil(
            Date.now() + (seconds ? seconds * 1000 : COOLDOWN_FALLBACK_MS)
          );
        }

        if (message.includes("Rate limit")) {
          setRateLimitUntil(Date.now() + CLAIM_WINDOW_MS);
        }

        if (
          message.includes("already taken") ||
          message.includes("claimed by someone else")
        ) {
          fetchCards();
        }

        setError(message);
      } finally {
        setLoadingId(null);
        inFlightRef.current = false;
      }
    },
    [
      cards,
      isCardAvailable,
      cooldownRemaining,
      rateLimitRemaining,
      activeMyCardsCount,
      remainingAttempts,
      fetchCards,
      refreshUserCooldown,
    ]
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-2">
        <div className="text-white text-sm font-semibold">
          Total Cards: {cards.length}
        </div>
        <div className="text-xs text-zinc-400">
          Remaining Attempts: {remainingAttempts}{" "}
          {resetInSeconds > 0 && `(Reset in ${resetInSeconds}s)`}
        </div>
        <div className="text-xs text-zinc-400">
          Active Cards: {activeMyCardsCount} / 2
        </div>
        {cooldownRemaining > 0 && (
          <div className="text-xs text-amber-300 font-semibold flex items-center gap-2">
            Cooldown active – {cooldownRemaining}s remaining
            <InfoTip text="Cooldown means you must wait before claiming another card. It starts after each successful claim." />
          </div>
        )}
        {rateLimitRemaining > 0 && (
          <div className="text-xs text-amber-300 font-semibold flex items-center gap-2">
            Rate limit reached. Try again in {rateLimitRemaining}s.
            <InfoTip text="You can only claim a limited number of cards within a fixed time window." />
          </div>
        )}
        {activeMyCardsCount >= 2 && (
          <div className="text-xs text-amber-300 font-semibold flex items-center gap-2">
            You already have maximum active cards.
            <InfoTip text="Active cards are cards you currently own. They expire after their duration ends." />
          </div>
        )}
        {cooldownTooltip && (
          <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
            {cooldownTooltip}
          </div>
        )}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {cards.map((card) => {
          const isActive = isCardActive(card);
          const isMine = currentUserId && card.ownerId === currentUserId;
          const isExpired = isCardExpired(card);
          const isAvailable = isCardAvailable(card);
          const isLoading = loadingId === card._id;
          const isDisabled = isGlobalDisabled && !isLoading;

          return (
            <div
              key={card._id}
              className="border border-white/10 rounded-lg p-3 bg-zinc-900/50 text-white"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {card.name}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Status:{" "}
                {isAvailable
                  ? "Available"
                  : isMine
                  ? "Active (Yours)"
                  : "Occupied"}
              </div>

              <div className="mt-3">
                {isAvailable ? (
                  <button
                    className="text-xs px-3 py-1 rounded bg-white text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled || isLoading}
                    onClick={() => handleClaim(card._id)}
                  >
                    {isLoading ? "Claiming..." : "Claim"}
                  </button>
                ) : (
                  <div className="text-xs text-zinc-400">
                    {isMine && isActive && card.expiresAt
                      ? `Expires in ${Math.max(
                          0,
                          Math.ceil(
                            (new Date(card.expiresAt).getTime() - now) / 1000
                          )
                        )}s`
                      : isExpired
                      ? "Available"
                      : "Occupied"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardGrid;
