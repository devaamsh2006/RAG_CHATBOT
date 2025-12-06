"use client";

import { motion } from "framer-motion";
import { Upload, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar({ activeTab, setActiveTab }) {
    const tabs = [
        { id: "upload", label: "Upload Documents", icon: Upload },
        { id: "chat", label: "AI Chat", icon: MessageSquare },
    ];

    return (
        <nav className="w-full max-w-md mx-auto mb-8">
            <div className="glass-panel rounded-full p-1 flex items-center justify-between relative">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full text-sm font-medium transition-colors duration-300 z-10",
                            activeTab === tab.id ? "text-white" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute inset-0 bg-white/10 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.3)] backdrop-blur-md border border-white/10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
