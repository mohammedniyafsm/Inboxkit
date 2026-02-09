"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface StepCardProps {
    step: string;
    title: string;
    description: string;
    footerLabel: string;
    footerValue: string;
    image?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function StepCard({
    step,
    title,
    description,
    footerLabel,
    footerValue,
    image = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80",
    icon,
    className,
}: StepCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn("w-full max-w-[400px]", className)}
        >
            <Card className="group relative h-[500px] overflow-hidden rounded-[2.5rem] border-white/10 bg-zinc-950/80 backdrop-blur-2xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                    <motion.img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute top-6 left-6">
                        <Badge
                            variant="secondary"
                            className="bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 text-white"
                        >
                            {step}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col h-[calc(100%-16rem)] justify-between">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black leading-tight tracking-tighter text-white italic transition-colors group-hover:text-zinc-300 uppercase">
                            {title}
                        </h3>
                        <p className="line-clamp-4 text-sm text-zinc-300 leading-relaxed font-semibold">
                            {description}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-1.5 shadow-sm">
                                {footerLabel}
                            </span>
                            <span className="text-sm font-bold text-white italic tracking-tighter">
                                {footerValue}
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-inner">
                            {icon || <Activity className="h-5 w-5" />}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
