"use client";

import { useRef, useState } from "react";
import { Send, Smile } from "lucide-react";
import api from "../lib/api";
import { useSocket } from "../hooks/useSocket";

const QUICK_EMOJIS = ["😀", "😂", "❤️", "👍", "🙏", "🎉", "🔥", "😢"];

export default function ReplyBox({ chatId, disabled, onSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimeout = useRef(null);
  const socket = useSocket();

  function handleChange(e) {
    setText(e.target.value);
    socket.emit("admin:typing", { chat_id: chatId, typing: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("admin:typing", { chat_id: chatId, typing: false });
    }, 1500);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/messages/${chatId}`, { text });
      setText("");
      onSent?.();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  if (disabled) {
    return (
      <div className="border-t border-border bg-surface px-4 py-3 text-center text-sm text-text-muted">
        This user is blocked. Unblock them to reply.
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="relative border-t border-border bg-surface px-4 py-3 flex items-end gap-2">
      {showEmoji && (
        <div className="absolute bottom-16 left-4 bg-elevated border border-border rounded-lg p-2 flex gap-1 shadow-panel">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="text-lg hover:scale-110 transition-transform"
              onClick={() => {
                setText((t) => t + emoji);
                setShowEmoji(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowEmoji((s) => !s)}
        className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-text-muted hover:bg-elevated transition-colors"
      >
        <Smile size={20} />
      </button>

      <textarea
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) handleSend(e);
        }}
        placeholder="Type a reply…"
        className="flex-1 resize-none bg-elevated border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-accent max-h-32"
      />

      <button
        type="submit"
        disabled={!text.trim() || sending}
        className="h-9 w-9 shrink-0 rounded-full bg-accent hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
