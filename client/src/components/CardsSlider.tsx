"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LiquidImageReveal from "@/components/LiquidImageReveal";

interface CardData {
    id: number;
    title: string;
    description: string;
    category: string;
    image: string;
}

const cards: CardData[] = [
    {
        id: 1,
        title: "Wizard King",
        description:
            "Master of the arcane arts and ruler of the deep forest regions. His power is ancient and absolute.",
        category: "Legendary",
        image: "https://ui.dimaac.com/roiin.png",
    },
    {
        id: 2,
        title: "Mace Witch",
        description:
            "A perfect blend of martial prowess and mystical charm. Her mace strikes with the force of destiny.",
        category: "Epic",
        image: "https://ui.dimaac.com/daisy.png",
    },
    {
        id: 3,
        title: "Emily",
        description:
            "The guardian of the green heart. She speaks to the elements and commands the wild spirits.",
        category: "Rare",
        image: "https://ui.dimaac.com/_next/image?url=%2Femily0.png&w=1080&q=75",
    },
    {
        id: 4,
        title: "Lylia",
        description:
            "A mystical weaver of shadows and star magic. Her presence fills the battlefield with cosmic energy.",
        category: "Mythic",
        image: "https://ui.dimaac.com/lylia.png",
    },
    {
        id: 5,
        title: "Lance",
        description:
            "The lightning vanguard. Armed with a photon spear, he pierces through any defense with blinding speed.",
        category: "Elite",
        image: "https://ui.dimaac.com/_next/image?url=%2Flance0.png&w=1080&q=75",
    },
    {
        id: 6,
        title: "Renei",
        description:
            "A master of balanced combat and tactical precision. Her blades are an extension of her very soul.",
        category: "Advanced",
        image: "https://ui.dimaac.com/_next/image?url=%2Frenei0.png&w=1080&q=75",
    },
    {
        id: 7,
        title: "Linda",
        description:
            "The serene guardian of the silver light. Her shield protects the innocent and reflects all evil.",
        category: "Protector",
        image: "https://ui.dimaac.com/_next/image?url=%2Flinda0.png&w=1080&q=75",
    },
];

export function CardsSlider() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const x = useMotionValue(0);

    useEffect(() => {
        if (containerRef.current) {
            setWidth(
                containerRef.current.scrollWidth - containerRef.current.offsetWidth
            );
        }
    }, []);

    const scrollTo = (direction: "left" | "right") => {
        const currentX = x.get();
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const scrollAmount = containerWidth * 0.8; // Scroll 80% of container width

        let newX =
            direction === "left" ? currentX + scrollAmount : currentX - scrollAmount;

        // Clamp values
        newX = Math.max(Math.min(newX, 0), -width);

        animate(x, newX, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 1,
        });
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto p-8 relative group/slider">
            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => scrollTo("left")}
                    className="h-12 w-12 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center hover:bg-black hover:scale-110 transition-all active:scale-95 text-white"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => scrollTo("right")}
                    className="h-12 w-12 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center hover:bg-black hover:scale-110 transition-all active:scale-95 text-white"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <motion.div
                ref={containerRef}
                className="cursor-grab active:cursor-grabbing overflow-hidden px-4 py-8 -mx-4 -my-8"
                whileTap={{ cursor: "grabbing" }}
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    dragElastic={0.1}
                    style={{ x }}
                    className="flex gap-8"
                >
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            className="min-w-[340px] max-w-[340px] h-[480px]"
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                        >
                            <Card className="group relative h-full overflow-hidden rounded-[2.5rem] border-white/5 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5">
                                {/* Character Image background reveal */}
                                <div className="absolute inset-0 z-10">
                                    <LiquidImageReveal
                                        src={card.image}
                                        alt={card.title}
                                        width={340}
                                        height={480}
                                        duration={2.5}
                                        delay={0}
                                        turbulenceFrequency={0.02}
                                        displacementScale={80}
                                        className="w-full h-full"
                                    />
                                </div>

                                {/* Text Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 z-20 p-8 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end">
                                    <div className="space-y-1">
                                        <Badge
                                            variant="outline"
                                            className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 text-white/50 mb-2 w-fit"
                                        >
                                            {card.category}
                                        </Badge>
                                        <h3 className="text-2xl font-black leading-tight tracking-tighter text-white italic uppercase">
                                            {card.title}
                                        </h3>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
