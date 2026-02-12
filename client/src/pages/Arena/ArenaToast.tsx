import { motion } from "framer-motion";
import { Info, X, Shield, Zap, AlertTriangle } from "lucide-react";

interface ArenaToastProps {
    message: string;
    subMessage?: string;
    type?: "info" | "directive" | "warning" | "success";
    onClose: () => void;
}

export const ArenaToast = ({ message, subMessage, type = "info", onClose }: ArenaToastProps) => {
    const config = {
        info: {
            icon: <Info size={18} className="text-blue-400" />,
            borderColor: "border-blue-500/30",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
            titleColor: "text-blue-400"
        },
        directive: {
            icon: <Shield size={18} className="text-emerald-400" />,
            borderColor: "border-emerald-500/30",
            glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
            titleColor: "text-emerald-400"
        },
        warning: {
            icon: <AlertTriangle size={18} className="text-amber-400" />,
            borderColor: "border-amber-500/30",
            glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
            titleColor: "text-amber-400"
        },
        success: {
            icon: <Zap size={18} className="text-emerald-400" />,
            borderColor: "border-emerald-500/30",
            glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
            titleColor: "text-emerald-400"
        }
    };

    const s = config[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-20 right-8 z-[200] bg-zinc-900 border ${s.borderColor} text-white px-4 py-3 rounded-xl ${s.glow} flex items-start gap-3 backdrop-blur-md max-w-sm`}
        >
            <div className="mt-0.5">{s.icon}</div>
            <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-black italic uppercase tracking-tight ${s.titleColor}`}>
                    {message}
                </span>
                {subMessage && (
                    <span className="text-[11px] text-zinc-400 font-medium leading-tight">
                        {subMessage}
                    </span>
                )}
            </div>
            <button
                onClick={onClose}
                className="ml-auto text-zinc-500 hover:text-white transition-colors p-1"
                aria-label="Close"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};
