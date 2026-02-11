"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Bot,
    X,
    Send,
    MessageCircle,
    Loader2,
    User,
    ChevronDown,
    RefreshCw,
    ExternalLink,
    MessageCircleMore
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Namaste! I am Tauji, your Agrio India guide. How can I help you regarding our products or crop care today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.sendAiChatMessage({
                message: input,
                session_id: sessionId,
                channel: "web",
                language: "en" // Could be dynamic based on site lang
            });

            if (response.success && response.data) {
                setSessionId(response.data.session_id);
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: response.data.reply,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-white/50 shadow-inner">
                                    <Image
                                        src="/tau-avatar.png"
                                        alt="Tau Ji"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Ask Tau (AI Support)</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] text-green-50 opacity-90">Online & Ready</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/10"
                                onClick={() => setIsOpen(false)}
                            >
                                <ChevronDown className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "flex gap-2 max-w-[85%]",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden",
                                            msg.role === "user" ? "bg-green-100 text-green-600" : "bg-white border text-indigo-600"
                                        )}>
                                            {msg.role === "user" ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Image
                                                    src="/tau-avatar.png"
                                                    alt="Tau Ji"
                                                    width={32}
                                                    height={32}
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm shadow-sm",
                                            msg.role === "user"
                                                ? "bg-green-600 text-white rounded-tr-none"
                                                : "bg-white text-gray-800 border rounded-tl-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 max-w-[85%]">
                                        <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                                            <Image
                                                src="/tau-avatar.png"
                                                alt="Tau Ji"
                                                width={32}
                                                height={32}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="bg-white border p-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-2 text-gray-400">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Thinking...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <Input
                                    placeholder="Type your question..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-green-500"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-full bg-green-600 hover:bg-green-700 shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                Powered by Agrio AI • Gemini-1.5-Flash
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
            >
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-green-600 text-green-700 font-bold flex items-center gap-2"
                    >
                        <span className="animate-bounce">👋</span>
                        Ask Tau
                    </motion.div>
                )}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-16 w-16 rounded-full shadow-2xl transition-all duration-500 p-0 overflow-hidden border-2 border-white",
                        isOpen
                            ? "bg-white text-gray-600 hover:bg-gray-100 rotate-90"
                            : "bg-green-600 text-white hover:shadow-green-500/50"
                    )}
                >
                    {isOpen ? (
                        <X className="h-8 w-8" />
                    ) : (
                        <div className="relative h-full w-full">
                            <Image
                                src="/tau-avatar.png"
                                alt="Ask Tau"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
