import React from "react";
import { type Card } from "@/types/card";
import { Timer, CheckCircle2, Crosshair, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface CardTileProps {
  card: Card;
  onClick: () => void;
  isClaimed: boolean;
  isMyActive: boolean;
  disabled?: boolean;
  layoutId?: string;
  loading?: boolean;
  ownerUsername?: string;
}

const activeBorderColors = {
  normal: "border-gray-400/50",
  rare: "border-purple-500",
  trap: "border-red-500",
};

const activeBgColors = {
  normal: "bg-zinc-900",
  rare: "bg-purple-900/20",
  trap: "bg-red-900/20",
};

const CardTile: React.FC<CardTileProps> = ({
  card,
  onClick,
  isClaimed,
  isMyActive,
  disabled,
  layoutId,
  loading,
  ownerUsername
}) => {
  // Mystery/Occupied cards have uniform styling
  const borderClass = isMyActive
    ? activeBorderColors[card.type as keyof typeof activeBorderColors]
    : isClaimed ? "border-red-900/30 hover:border-red-900/50" : "border-white/10 hover:border-white/30";

  const bgClass = isMyActive
    ? activeBgColors[card.type as keyof typeof activeBgColors]
    : isClaimed ? "bg-red-950/20" : "bg-zinc-900/40";

  return (
    <motion.div
      layoutId={layoutId}
      className={`relative aspect-square rounded-xl border-2 transition-all duration-300 overflow-hidden group backdrop-blur-sm cursor-pointer
      ${borderClass} 
      ${bgClass}
      ${isClaimed && !isMyActive ? "opacity-50 grayscale" : "hover:scale-[1.02] hover:shadow-lg"}
      ${isMyActive ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : ""}
      ${disabled && !isClaimed ? "cursor-not-allowed opacity-70" : ""}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center relative">

        {/* MY ACTIVE CARD: Reveal Everything */}
        {isMyActive && (
          <>
            {/* Full Background Image */}
            <div className="absolute inset-0 z-0">
              {card.image && (
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-between w-full h-full p-2">
              <div className="w-full flex justify-end">
                <div className="text-emerald-400 drop-shadow-lg">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              <div className="w-full text-center">
                <div className="text-white font-black text-sm mb-0.5 truncate w-full px-1 drop-shadow-md uppercase italic tracking-tight">
                  {card.name}
                </div>
                <div className="text-[10px] text-zinc-300 uppercase tracking-wider mb-2 drop-shadow-md font-medium">
                  {card.type}
                </div>

                <div className="w-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 backdrop-blur-md shadow-lg">
                  <Timer size={10} />
                  Active
                </div>
              </div>
            </div>
          </>
        )}

        {/* BLOCKED (Not Mine) */}
        {isClaimed && !isMyActive && (
          <div className="flex flex-col items-center">
            <Lock size={24} className="text-red-500/80 mb-2" />
            <div className="text-red-500 font-black text-xs uppercase tracking-widest animate-pulse">LOCKED</div>
            {ownerUsername && (
              <div className="text-red-400/60 text-[10px] mt-1 font-mono">
                by {ownerUsername}
              </div>
            )}
          </div>
        )}

        {/* UNCLAIMED: Mystery */}
        {!isClaimed && !isMyActive && (
          <>
            <div className="text-zinc-700 mb-2 group-hover:text-emerald-500 transition-colors duration-300">
              <Crosshair size={24} />
            </div>
            <div className="text-zinc-600 group-hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest transition-colors duration-300">
              SEIZE SECTOR
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CardTile;
