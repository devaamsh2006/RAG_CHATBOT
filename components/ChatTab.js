"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Trash2, FileText, Sparkles, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatTab({ files }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content:
                "Hello! I've analyzed your uploaded documents. Ask me anything about them.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const [chats, setChats] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [currentChatId, setCurrentChatId] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setIsLoadingChats(true);
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const data = await res.json();
                setChats(data);
                if (data.length > 0 && !currentChatId) {
                    selectChat(data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setIsLoadingChats(false);
        }
    };

    const createNewChat = async () => {
        try {
            const res = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'New Chat' }) // Default title, will be updated
            });
            if (res.ok) {
                const newChat = await res.json();
                setChats([newChat, ...chats]);
                setCurrentChatId(newChat.id);
                setMessages([{
                    id: Date.now(),
                    role: "assistant",
                    content: "Hello! I've analyzed your uploaded documents. Ask me anything about them.",
                }]);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    const selectChat = async (chatId) => {
        setCurrentChatId(chatId);
        try {
            const res = await fetch(`/api/history/${chatId}`);
            if (res.ok) {
                const msgs = await res.json();
                if (msgs.length > 0) {
                    setMessages(msgs);
                } else {
                    setMessages([{
                        id: Date.now(),
                        role: "assistant",
                        content: "Hello! I've analyzed your uploaded documents. Ask me anything about them.",
                    }]);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const deleteChat = async (e, chatId) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/history/${chatId}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedChats = chats.filter(c => c.id !== chatId);
                setChats(updatedChats);

                if (currentChatId === chatId) {
                    if (updatedChats.length > 0) {
                        selectChat(updatedChats[0].id);
                    } else {
                        setCurrentChatId(null);
                        setMessages([{
                            id: Date.now(),
                            role: "assistant",
                            content: "Select a chat or start a new one.",
                        }]);
                    }
                }
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    messages: messages,
                    chatId: currentChatId
                }),
            });

            if (!response.ok) throw new Error("Chat failed");

            const data = await response.json();

            // Update chat title if returned
            if (data.chatTitle) {
                setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title: data.chatTitle } : c));
            }

            const aiMsg = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    data.content ||
                    data.message?.content ||
                    "I'm sorry, I couldn't generate a response.",
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[calc(100vh-12rem)] justify-center gap-6"
        >

            {/* Left Side - Chat History Sidebar */}
            <div className="w-64 glass-panel rounded-2xl p-4 flex flex-col gap-4 hidden md:flex">
                <button
                    onClick={createNewChat}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] text-white font-semibold shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Chat
                </button>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {isLoadingChats ? (
                        // Loading Skeleton
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/5 animate-pulse flex items-center justify-between">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-4 h-4 rounded bg-white/10 shrink-0" />
                                    <div className="h-4 bg-white/10 rounded w-2/3" />
                                </div>
                            </div>
                        ))
                    ) : chats.length === 0 ? (
                        <div className="text-slate-500 text-center p-4 text-sm mt-10">
                            <p>No recent chats.</p>
                            <p className="text-xs mt-2 opacity-50">Start a new chat to save your history.</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => selectChat(chat.id)}
                                className={cn(
                                    "p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group",
                                    currentChatId === chat.id
                                        ? "bg-white/10 border border-white/20"
                                        : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className={cn(
                                        "w-4 h-4 shrink-0",
                                        currentChatId === chat.id ? "text-[var(--neon-blue)]" : "text-slate-400"
                                    )} />
                                    <span className={cn(
                                        "text-sm truncate",
                                        currentChatId === chat.id ? "text-white" : "text-slate-400"
                                    )}>
                                        {chat.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => deleteChat(e, chat.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side - Chat */}
            <div className="flex-1 w-full flex flex-col glass-panel rounded-2xl overflow-hidden relative">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--neon-purple)]" />
                        <span className="font-semibold">AI Assistant</span>
                    </div>
                    <button
                        onClick={() => setMessages([])}
                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-3 max-w-[80%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === "user"
                                        ? "bg-[var(--neon-purple)]"
                                        : "bg-[var(--neon-blue)]"
                                )}
                            >
                                {msg.role === "user" ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-black" />
                                )}
                            </div>

                            {/* Markdown Message */}
                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm leading-relaxed prose prose-invert prose-p:mt-0 prose-p:mb-2",
                                    msg.role === "user"
                                        ? "bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 text-white rounded-tr-none"
                                        : "bg-white/10 border border-white/10 text-slate-200 rounded-tl-none"
                                )}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 max-w-[80%]"
                        >
                            <div className="w-8 h-8 rounded-full bg-[var(--neon-blue)] flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-black" />
                            </div>
                            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                <span className="w-2 h-2 bg-[var(--neon-blue)] rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-[var(--neon-blue)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-[var(--neon-blue)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-xl">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--neon-blue)]/50 focus:ring-1 focus:ring-[var(--neon-blue)]/50 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--neon-blue)] rounded-lg text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
