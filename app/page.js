"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import UploadTab from "@/components/UploadTab";
import ChatTab from "@/components/ChatTab";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);

  return (
    <main className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-purple)] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Glass RAG
          </h1>
          <p className="text-slate-400">Intelligent Document Analysis</p>
        </header>

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeTab === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <UploadTab files={files} setFiles={setFiles} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ChatTab files={files.filter(f => f.status === 'success')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
