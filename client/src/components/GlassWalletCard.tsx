"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Wallet,
} from "lucide-react";

interface GlassWalletCardProps {
    balance?: string;
    currency?: string;
    address?: string;
    trend?: string;
    trendUp?: boolean;
    cardHolder?: string;
    className?: string;
    title?: string;
    description?: string;
}

const defaultWallet = {
    balance: "12,345.67",
    currency: "ETH",
    address: "0x71C...9A23",
    trend: "+5.2%",
    trendUp: true,
    cardHolder: "Alex Morgan",
    expiry: "12/28",
};

export function GlassWalletCard({
    balance = defaultWallet.balance,
    currency = defaultWallet.currency,
    address = defaultWallet.address,
    trend = defaultWallet.trend,
    trendUp = defaultWallet.trendUp,
    cardHolder = defaultWallet.cardHolder,
    className,
    title,
    description,
}: GlassWalletCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("w-full max-w-[400px]", className)}
        >
            <Card className="group relative h-64 overflow-hidden rounded-2xl border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-white/5">
                {/* Abstract Background Shapes */}
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:bg-white/10" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:bg-white/10" />

                <div className="relative flex h-full flex-col justify-between p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                    {title || "Total Balance"}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-xl font-bold tracking-tight text-white italic">
                                        {balance}
                                    </h3>
                                    <span className="text-[10px] font-medium text-white/40">
                                        {currency}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {trend && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "border-white/10 bg-white/5 backdrop-blur-sm text-[10px]",
                                    trendUp ? "text-green-400" : "text-red-400"
                                )}
                            >
                                <TrendingUp className="mr-1 h-3 w-3" />
                                {trend}
                            </Badge>
                        )}
                    </div>

                    {/* Description / Content */}
                    <div className="mt-4 flex-grow">
                        <p className="text-sm text-white/60 leading-relaxed font-light italic">
                            {description}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase italic tracking-tighter">
                                {cardHolder}
                            </span>
                            <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[9px] text-white/60 backdrop-blur-sm border border-white/5">
                                {address}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
