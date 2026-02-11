import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface GlassAuthCardProps {
    mode: "login" | "signup";
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    className?: string;
}

export function GlassAuthCard({
    mode,
    onSubmit,
    isLoading = false,
    className,
}: GlassAuthCardProps) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("w-full max-w-[400px]", className)}
        >
            <Card className="group relative overflow-hidden rounded-2xl border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {mode === "login"
                                ? "Enter your credentials to access the arena"
                                : "Join the battle and claim your territory"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "signup" && (
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-white/80">Username</Label>
                                <div className="relative group/input">
                                    <Input
                                        id="username"
                                        placeholder="PlayerOne"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/20 backdrop-blur-sm focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
                                        required
                                    />
                                    <User className="absolute left-3 top-2.5 h-4 w-4 z-10 text-white/70 group-focus-within/input:text-primary transition-colors" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white/80">Email</Label>
                            <div className="relative group/input">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="warrior@arena.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/20 backdrop-blur-sm focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
                                    required
                                />
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 z-10 text-white/70 group-focus-within/input:text-primary transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/80">Password</Label>
                            <div className="relative group/input">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/20 backdrop-blur-sm focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
                                    required
                                />
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 z-10 text-white/70 group-focus-within/input:text-primary transition-colors" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 h-10 font-semibold"
                        >
                            {isLoading ? (
                                "Loading..."
                            ) : (
                                <span className="flex items-center gap-2">
                                    {mode === "login" ? "Enter Arena" : "Join Now"}
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        {mode === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="font-medium text-primary hover:text-primary/80 hover:underline transition-all"
                                >
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-primary hover:text-primary/80 hover:underline transition-all"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Decorative background glow */}
            <div className="absolute -z-10 inset-0 bg-primary/20 blur-[100px] opacity-20 pointer-events-none rounded-full transform translate-y-10" />
        </motion.div>
    );
}
