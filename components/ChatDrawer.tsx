"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Clock,
  Store,
  User,
  CheckCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface MessageItem {
  id: string;
  orderId?: string | null;
  storeId?: string | null;
  userId?: string | null;
  senderRole: "CITIZEN" | "STORE" | "ADMIN";
  senderName: string;
  text: string;
  createdAt: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
  storeName?: string;
  orderId?: string;
  orderNumber?: string;
  currentRole?: "CITIZEN" | "STORE";
}

export function ChatDrawer({
  isOpen,
  onClose,
  storeId,
  storeName = "Pharmacy",
  orderId,
  orderNumber,
  currentRole = "CITIZEN",
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply suggestions for citizens
  const quickReplies = [
    "Is this still in stock?",
    "Is the generic version available?",
    "What time will it be ready?",
    "Can I pick this up in 1 hour?",
  ];

  // Fetch messages from /api/messages
  const fetchMessages = async (isFirst = false) => {
    if (!isOpen) return;
    if (!orderId && !storeId) return;

    try {
      const url = orderId
        ? `/api/messages?orderId=${encodeURIComponent(orderId)}`
        : `/api/messages?storeId=${encodeURIComponent(storeId || "")}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.warn("Messages polling error:", err);
    } finally {
      if (isFirst) setLoadingInitial(false);
    }
  };

  // Polling every 3 seconds while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    setLoadingInitial(true);
    fetchMessages(true);

    const intervalId = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, orderId, storeId]);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: MessageItem = {
      id: tempId,
      orderId: orderId || null,
      storeId: storeId || null,
      senderRole: currentRole,
      senderName: currentRole === "CITIZEN" ? "You" : storeName,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          storeId,
          senderRole: currentRole,
          text: trimmed,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-health-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-health-700/80 border border-health-500/50 flex items-center justify-center shrink-0">
              {currentRole === "STORE" ? (
                <User className="w-5 h-5 text-health-200" />
              ) : (
                <Store className="w-5 h-5 text-health-200" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-snug">
                {currentRole === "STORE"
                  ? "Chat with Customer"
                  : storeName}
              </h3>
              <p className="text-xs text-health-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {orderNumber ? `Order #${orderNumber}` : "Direct Pharmacy Thread"} &bull; Live 3s Sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {loadingInitial ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-health-600" />
              <span className="text-xs">Connecting to pharmacist thread...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-700 text-sm">No messages yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ask about stock availability, generic alternatives, or pickup confirmation.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (currentRole === "CITIZEN" && msg.senderRole === "CITIZEN") ||
                (currentRole === "STORE" && msg.senderRole === "STORE");

              const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isMine ? "You" : msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400">{timeFormatted}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMine
                        ? "bg-health-700 text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips (for Citizen) */}
        {currentRole === "CITIZEN" && (
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-health-600" /> Quick:
            </span>
            {quickReplies.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-health-50 text-slate-700 hover:text-health-800 border border-slate-200 hover:border-health-300 transition-colors whitespace-nowrap shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentRole === "STORE"
                ? "Reply to citizen..."
                : "Ask pharmacist about stock, price..."
            }
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              !inputText.trim() || sending
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-health-700 hover:bg-health-800 text-white shadow-xs"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatDrawer;
