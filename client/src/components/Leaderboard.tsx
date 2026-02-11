import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
    _id: string;
    username: string;
    totalPoints: number;
}

interface LeaderboardProps {
    users: LeaderboardUser[];
    currentUserId: string | null;
}

export default function Leaderboard({ users, currentUserId }: LeaderboardProps) {
    return (
        <div className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">
                        Global Ranking
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Live</span>
                </div>
            </div>

            <div className="p-2">
                <div className="grid grid-cols-12 text-[10px] uppercase font-black text-zinc-500 px-4 py-2">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-6">Operative</div>
                    <div className="col-span-4 text-right">Score</div>
                </div>

                <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                        {users.map((user, index) => {
                            const isMe = user._id === currentUserId;
                            const isTop3 = index < 3;

                            // Display Logic:
                            // 1. Always show Top 4 (indexes 0, 1, 2, 3)
                            // 2. If Current User is NOT in Top 4, show them as well

                            const showUser = index < 4 || isMe;

                            if (!showUser) return null;

                            // If this is the current user and they are NOT in the top 4, add a visual separator/break before them if needed
                            // (Though map handling makes "before" tricky, we can just render. The separation can be visual styling or a conditional divider)
                            const isFloatingUser = index >= 4 && isMe;

                            return (
                                <motion.div
                                    layoutId={user._id}
                                    key={user._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl border ${isMe
                                        ? "bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                        : "bg-transparent border-transparent hover:bg-white/5"
                                        } ${isFloatingUser ? "mt-4 border-t border-white/10 relative" : ""}`}
                                >
                                    <div className="col-span-2 flex items-center gap-2">
                                        {isFloatingUser && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-black text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                                                Your Rank
                                            </div>
                                        )}
                                        <span className={`font-mono text-sm font-bold ${index === 0 ? "text-amber-400" :
                                            index === 1 ? "text-zinc-300" :
                                                index === 2 ? "text-amber-700" :
                                                    "text-zinc-500"
                                            }`}>
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <div className="col-span-6 flex items-center gap-2">
                                        {isTop3 && (
                                            <Medal className={`h-3 w-3 ${index === 0 ? "text-amber-400" :
                                                index === 1 ? "text-zinc-300" :
                                                    "text-amber-700"
                                                }`} />
                                        )}
                                        <span className={`text-xs font-bold truncate ${isMe ? "text-white" : "text-zinc-300"
                                            }`}>
                                            {user.username}
                                        </span>
                                        {isMe && (
                                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-[9px] h-4 px-1 py-0 pointer-events-none border-emerald-500/20">You</Badge>
                                        )}
                                    </div>

                                    <div className="col-span-4 text-right font-mono text-sm font-bold text-white flex items-center justify-end gap-2">
                                        {user.totalPoints.toLocaleString()}
                                        <TrendingUp className="h-3 w-3 text-emerald-500 opacity-50" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
