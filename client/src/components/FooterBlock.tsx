"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowUp,
    Github,
    Linkedin,
    Mail,
    Twitter,
    Globe,
} from "lucide-react";

const footerLinks = [
    {
        title: "Product",
        links: ["Features", "Pricing", "Documentation", "API Reference"],
    },
    {
        title: "Company",
        links: ["About Us", "Careers", "Blog", "Press Kit"],
    },
    {
        title: "Resources",
        links: ["Community", "Help Center", "Partners", "Status"],
    },
    {
        title: "Legal",
        links: ["Privacy", "Terms", "Cookie Policy", "Licenses"],
    },
];

const socialLinks = [
    { icon: Globe, label: "Website", href: "https://www.niyaf.xyz/" },
    { icon: Github, label: "GitHub", href: "https://github.com/mohammedniyafsm" },
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export function FooterBlock() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const shouldReduceMotion = useReducedMotion();

    return (
        <footer
            aria-labelledby="footer-heading"
            className="relative w-full overflow-hidden border-t border-white/5 bg-black/90 backdrop-blur-xl"
        >
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <motion.div
                    className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/5 blur-[160px]"
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : { opacity: [0.1, 0.3, 0.1], scale: [0.9, 1.05, 0.95] }
                    }
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : { duration: 12, repeat: Infinity, ease: "easeInOut" }
                    }
                />
                <motion.div
                    className="absolute -bottom-36 right-0 h-96 w-96 rounded-full bg-zinc-500/5 blur-[200px]"
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : { opacity: [0.1, 0.25, 0.1], rotate: [0, 25, 0] }
                    }
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : { duration: 16, repeat: Infinity, ease: "linear" }
                    }
                />
            </div>
            <h2 id="footer-heading" className="sr-only">
                Site footer
            </h2>

            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
                    {/* Brand & Newsletter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <motion.div
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="mb-6 inline-flex items-center gap-3"
                        >
                            <div className="text-xl font-black italic tracking-tighter text-white uppercase bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                                InboxKit
                            </div>
                            <Badge
                                variant="outline"
                                className="text-[10px] uppercase tracking-widest border-white/10 text-zinc-500"
                            >
                                Since 2024
                            </Badge>
                        </motion.div>
                        <p className="mb-6 max-w-md text-sm text-zinc-400 font-medium">
                            Building amazing high-fidelity experiences with modern technologies. Join our journey to create better digital arenas.
                        </p>

                        {/* Newsletter */}
                        <div className="mb-8">
                            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/50">
                                Subscribe to our newsletter
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-10 rounded-xl border-white/10 bg-white/5 text-sm placeholder:text-zinc-600 focus-visible:ring-white/20"
                                />
                                <Button
                                    size="sm"
                                    className="h-10 rounded-xl bg-white text-black font-black uppercase tracking-widest px-4 hover:bg-zinc-200"
                                    aria-label="Subscribe"
                                >
                                    <Mail className="h-4 w-4" aria-hidden />
                                </Button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 text-sm text-zinc-500">
                            <motion.div
                                whileHover={shouldReduceMotion ? undefined : { x: 5 }}
                                className="flex items-center gap-3"
                            >
                                <Globe className="h-4 w-4" aria-hidden />
                                <a href="https://www.niyaf.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.niyaf.xyz</a>
                            </motion.div>
                            <motion.div
                                whileHover={shouldReduceMotion ? undefined : { x: 5 }}
                                className="flex items-center gap-3"
                            >
                                <Mail className="h-4 w-4" aria-hidden />
                                <span>hello@niyaf.xyz</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Footer Links */}
                    {footerLinks.map((section, sectionIndex) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                        >
                            <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-white">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link, linkIndex) => (
                                    <motion.li
                                        key={link}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: linkIndex * 0.05 }}
                                    >
                                        <a
                                            href="#"
                                            className="text-sm text-zinc-500 transition-colors hover:text-white"
                                        >
                                            {link}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="my-12 h-px bg-white/5"
                />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Social Links */}
                    <div className="flex gap-3">
                        {socialLinks.map((social, index) => (
                            <motion.div
                                key={social.label}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    delay: 0.6 + index * 0.05,
                                }}
                            >
                                <Button
                                    asChild
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 rounded-xl border border-white/5 bg-white/5 text-zinc-500 transition-all hover:bg-white hover:text-black"
                                    aria-label={social.label}
                                >
                                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                                        <social.icon className="h-4 w-4" aria-hidden />
                                    </a>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Copyright & Developed By */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col items-center md:items-end gap-1.5 text-xs font-medium text-zinc-600 uppercase tracking-widest"
                    >
                        <p className="flex items-center gap-2">
                            Developed by
                            <a
                                href="https://github.com/mohammedniyafsm"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:underline underline-offset-4"
                            >
                                Niyaf
                            </a>
                        </p>
                        <div className="flex items-center gap-2">
                            <span>© 2024 InboxKit. All rights reserved.</span>
                            <Badge variant="outline" className="text-[9px] border-white/10 text-zinc-700">
                                v1.2.0
                            </Badge>
                        </div>
                    </motion.div>

                    {/* Scroll to Top */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                    >
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all"
                            onClick={scrollToTop}
                        >
                            <motion.div
                                animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                transition={
                                    shouldReduceMotion
                                        ? undefined
                                        : { repeat: Infinity, duration: 1.5 }
                                }
                            >
                                <ArrowUp className="h-4 w-4" aria-hidden />
                            </motion.div>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </footer>
    );
}
