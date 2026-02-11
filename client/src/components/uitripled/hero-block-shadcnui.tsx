"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { RainbowButton } from "../ui/rainbow-button";
import DarkVeil from "../DarkVeil";

export function HeroBlock() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-32">
      <div className="absolute inset-0 z-0">
        <DarkVeil />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6 text-6xl font-black italic tracking-tighter text-white md:text-8xl drop-shadow-2xl"
          >
            Card Hunt
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mb-12 max-w-3xl text-2xl font-bold italic text-gray-200 md:text-3xl"
          >
            Real-Time Card Capture. Built for Speed.
            <br />
            <span className="mt-8 block text-xs font-normal text-gray-400 not-italic md:text-sm">
              A shared multiplayer board where hidden cards are revealed and claimed live.
              <br />
              Every action is synchronized instantly across all players.
            </span>
            {/* <span className="mt-4 block text-xs font-normal text-gray-400 not-italic md:text-sm">
              Click fast. Secure your cards.
              <br />
              If you hesitate, someone else will take it.
            </span> */}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/arena">
              <RainbowButton size="sm" className="h-10 bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] px-8 text-xl font-bold text-black">
                Lets Start
              </RainbowButton>
            </Link>
          </motion.div>


        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1, duration: 0.6 },
          y: { delay: 1.5, duration: 1.5, repeat: Infinity },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
      >
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
