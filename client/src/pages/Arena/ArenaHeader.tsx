import { Shield, Terminal } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ArenaHeaderProps {
    activeMyCardsCount: number;
    maxActiveCards: number;
}

export const ArenaHeader = ({ activeMyCardsCount, maxActiveCards }: ArenaHeaderProps) => {
    return (
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                        <Terminal size={18} className="text-emerald-500" />
                    </div>
                    <span className="font-bold tracking-tight text-lg">
                        Arena <span className="text-zinc-500 text-sm font-normal ml-2">v2.0.4</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
                                <Shield size={12} />
                                <span>{activeMyCardsCount}/{maxActiveCards} ACTIVE</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Active Territories</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
};
