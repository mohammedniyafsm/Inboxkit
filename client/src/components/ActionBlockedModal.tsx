import React, { useEffect, useState } from "react";
import { X, AlertOctagon, Clock, ShieldAlert, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionBlockedModalProps {
    isOpen: boolean;
    type: "cooldown" | "limit" | "rate_limit" | "occupied" | null;
    message?: string;
    cooldownEndsAt?: number | null;
    onClose: () => void;
}

const ActionBlockedModal: React.FC<ActionBlockedModalProps> = ({
    isOpen,
    type,
    message,
    cooldownEndsAt,
    onClose,
}) => {
    const [timeLeft, setTimeLeft] = useState(0);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Timer for cooldown
    useEffect(() => {
        if (isOpen && type === 'cooldown' && cooldownEndsAt) {
            const updateTimer = () => {
                const diff = Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));
                setTimeLeft(diff);
                if (diff <= 0) {
                    // Optionally auto-close or just show 0
                }
            };
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, type, cooldownEndsAt]);

    const getContent = () => {
        switch (type) {
            case "cooldown":
                return {
                    icon: <Clock className="w-12 h-12 text-amber-400" />,
                    title: "Cooldown Active",
                    defaultMsg: "You must wait before claiming another territory.",
                    borderColor: "border-amber-500/50",
                    glowColor: "shadow-[0_0_50px_rgba(251,191,36,0.2)]",
                    btnColor: "bg-amber-500 hover:bg-amber-600",
                };
            case "limit":
                return {
                    icon: <ShieldAlert className="w-12 h-12 text-red-400" />,
                    title: "Limit Reached",
                    defaultMsg: "You have reached the maximum active cards limit.",
                    borderColor: "border-red-500/50",
                    glowColor: "shadow-[0_0_50px_rgba(248,113,113,0.2)]",
                    btnColor: "bg-red-500 hover:bg-red-600",
                };
            case "rate_limit":
                return {
                    icon: <AlertOctagon className="w-12 h-12 text-blue-400" />,
                    title: "Rate Limit Exceeded",
                    defaultMsg: "You are performing actions too quickly.",
                    borderColor: "border-blue-500/50",
                    glowColor: "shadow-[0_0_50px_rgba(96,165,250,0.2)]",
                    btnColor: "bg-blue-500 hover:bg-blue-600",
                };
            case "occupied":
                return {
                    icon: <Lock className="w-12 h-12 text-zinc-500" />,
                    title: "Sector Occupied",
                    defaultMsg: "This territory is already controlled by another operative.",
                    borderColor: "border-zinc-500/50",
                    glowColor: "shadow-[0_0_50px_rgba(113,113,122,0.2)]",
                    btnColor: "bg-zinc-600 hover:bg-zinc-700",
                };
            default:
                return {
                    icon: <AlertOctagon className="w-12 h-12 text-zinc-400" />,
                    title: "Action Blocked",
                    defaultMsg: "This action is currently unavailable.",
                    borderColor: "border-zinc-500/50",
                    glowColor: "shadow-[0_0_50px_rgba(113,113,122,0.2)]",
                    btnColor: "bg-zinc-600 hover:bg-zinc-700",
                };
        }
    };


    const content = getContent();

    // Override message for timer
    let displayMessage = message || content.defaultMsg;
    if (type === 'cooldown' && cooldownEndsAt && timeLeft > 0) {
        displayMessage = `Operational cooling active. Systems ready in ${timeLeft}s.`;
    } else if (type === 'cooldown' && cooldownEndsAt && timeLeft <= 0) {
        displayMessage = "Systems ready. Re-initiating uplink..."; // Or just let it close
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-md bg-zinc-900 border-2 rounded-2xl p-6 md:p-8 text-center ${content.borderColor} ${content.glowColor}`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-zinc-900/50 rounded-full border border-white/5">
                                {content.icon}
                            </div>

                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                {content.title}
                            </h2>

                            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[80%]">
                                {displayMessage}
                            </p>

                            <button
                                onClick={onClose}
                                className={`mt-6 px-12 py-3 rounded-xl text-white font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 shadow-xl border border-white/10 active:scale-95 hover:brightness-110 ${content.btnColor}`}
                            >
                                Acknowledge Directive
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ActionBlockedModal;
