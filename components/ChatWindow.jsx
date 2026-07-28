"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pin, Archive, Ban, Trash2, ShieldCheck } from "lucide-react";
import api from "../lib/api";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import TypingDots from "./TypingDots";
import ReplyBox from "./ReplyBox";
import ConfirmDialog from "./ConfirmDialog";
import ForwardModal from "./ForwardModal";
import { useSocketEvent } from "../hooks/useSocket";

export default function ChatWindow({ chatId, onChatMutated }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'block' | 'delete' | null
  const [blockReason, setBlockReason] = useState("");
  const [forwardMessage, setForwardMessage] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setMenuOpen(false);

    Promise.all([api.get(`/chats/${chatId}`), api.get(`/messages/${chatId}`)])
      .then(([chatRes, msgRes]) => {
        setChat(chatRes.data.chat);
        setMessages(msgRes.data.messages);
      })
      .finally(() => setLoading(false));

    api.post(`/chats/${chatId}/read`).catch(() => {});
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  useSocketEvent("message:new", (message) => {
    if (message.chat_id !== chatId) return;
    setMessages((prev) => [...prev, message]);
    if (message.sender === "user") api.post(`/chats/${chatId}/read`).catch(() => {});
  });

  useSocketEvent("user:typing", ({ chat_id, typing: t }) => {
    if (chat_id === chatId) setTyping(t);
  });

  useSocketEvent("user:update", (user) => {
    if (user.chat_id === chatId) setChat((c) => (c ? { ...c, ...user } : c));
  });

  useSocketEvent("user:block-status", ({ chat_id, is_blocked }) => {
    if (chat_id === chatId) setChat((c) => (c ? { ...c, is_blocked } : c));
  });

  async function togglePin() {
    const { data } = await api.post(`/chats/${chatId}/pin`);
    setChat(data.chat);
    setMenuOpen(false);
  }

  async function toggleArchive() {
    const { data } = await api.post(`/chats/${chatId}/archive`);
    setChat(data.chat);
    setMenuOpen(false);
    onChatMutated?.();
  }

  async function confirmBlock() {
    const { data } = await api.post(`/chats/${chatId}/block`, { reason: blockReason });
    setChat(data.chat);
    setConfirmAction(null);
    setBlockReason("");
  }

  async function unblock() {
    const { data } = await api.post(`/chats/${chatId}/unblock`);
    setChat(data.chat);
    setMenuOpen(false);
  }

  async function confirmDelete() {
    await api.delete(`/chats/${chatId}`);
    setConfirmAction(null);
    onChatMutated?.();
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Select a chat to start replying
      </div>
    );
  }

  if (loading || !chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const displayName = [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || chat.chat_id;

  return (
    <div className="flex-1 flex flex-col h-full bg-base">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <Avatar user={chat} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-text-muted truncate">
            {chat.is_blocked
              ? "Blocked"
              : chat.username
              ? `@${chat.username}`
              : chat.last_seen
              ? `Last message seen ${new Date(chat.last_seen).toLocaleString()}`
              : "No username"}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-elevated"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-elevated border border-border rounded-lg shadow-panel py-1 z-10">
              <MenuItem icon={<Pin size={14} />} label={chat.is_pinned ? "Unpin chat" : "Pin chat"} onClick={togglePin} />
              <MenuItem icon={<Archive size={14} />} label={chat.is_archived ? "Unarchive chat" : "Archive chat"} onClick={toggleArchive} />
              {chat.is_blocked ? (
                <MenuItem icon={<ShieldCheck size={14} />} label="Unblock user" onClick={unblock} />
              ) : (
                <MenuItem icon={<Ban size={14} />} label="Block user" onClick={() => { setMenuOpen(false); setConfirmAction("block"); }} danger />
              )}
              <MenuItem icon={<Trash2 size={14} />} label="Delete chat" onClick={() => { setMenuOpen(false); setConfirmAction("delete"); }} danger />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-text-muted mt-6">No messages in this conversation yet.</p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m._id} message={m} onForward={setForwardMessage} />
        ))}
        {typing && (
          <div className="px-4 py-1">
            <TypingDots />
          </div>
        )}
      </div>

      <ReplyBox chatId={chatId} disabled={chat.is_blocked} onSent={() => {}} />

      <ConfirmDialog
        open={confirmAction === "block"}
        title={`Block ${displayName}?`}
        description="They won't be able to send you new messages until you unblock them."
        confirmLabel="Block user"
        danger
        onCancel={() => { setConfirmAction(null); setBlockReason(""); }}
        onConfirm={confirmBlock}
      >
        <input
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent mt-1"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmAction === "delete"}
        title="Delete this chat?"
        description="This permanently deletes the conversation history from the dashboard. This can't be undone."
        confirmLabel="Delete chat"
        danger
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmDelete}
      />

      <ForwardModal
        open={!!forwardMessage}
        message={forwardMessage}
        excludeChatId={chatId}
        onClose={() => setForwardMessage(null)}
        onForwarded={() => {}}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-base/60 transition-colors ${
        danger ? "text-danger" : "text-text-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
