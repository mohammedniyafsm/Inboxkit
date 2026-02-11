"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card as UiCard } from "@/components/ui/card";
import { type Card } from "@/types/card";

interface CardItemProps {
  card: Card;
  layoutId: string;
  onClick: () => void;
  revealed?: boolean;
}

export default function CardItem({ card, layoutId, onClick, revealed }: CardItemProps) {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      className="aspect-square"
    >
      <UiCard
        className={`
          h-full w-full cursor-pointer border-white/5 transition-all duration-300
          bg-zinc-900/40 hover:bg-zinc-800/60
          rounded-lg flex items-center justify-center relative group overflow-hidden
        `}
      >
        {revealed && card.image ? (
          <>
            <img
              src={card.image}
              alt={card.name}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </>
        ) : (
          <>
            <div className="text-2xl font-black text-white/10 select-none">?</div>
            <Sparkles className="absolute top-1 right-1 h-2 w-2 text-white/20 animate-pulse" />
          </>
        )}
      </UiCard>
    </motion.div>
  );
}
