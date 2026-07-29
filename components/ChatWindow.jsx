//C:\Users\Admin\Desktop\lumen messesg\frontend\components\ChatWindow.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Ban,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import api from "../lib/api";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import TypingDots from "./TypingDots";
import ReplyBox from "./ReplyBox";
import ConfirmDialog from "./ConfirmDialog";
import ForwardModal from "./ForwardModal";
import { useSocketEvent } from "../hooks/useSocket";

export default function ChatWindow({ chatId, onChatMutated, onBack }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'block' | 'delete' | null
  const [blockReason, setBlockReason] = useState("");
  const [forwardMessage, setForwardMessage] = useState(null);
  const scrollRef = useRef(null);
  const menuRef = useRef(null);

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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Close the header menu on outside click, so it behaves like a real popover.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Mobile hardware/browser back button support:
  // When a chat is opened, push a history entry. If the user presses
  // the phone's back button, intercept it (popstate) and go back to
  // the chat list instead of leaving the page/app.
  useEffect(() => {
    if (!chatId) return;

    window.history.pushState({ chatOpen: true, chatId }, "");

    const handlePopState = () => {
      onBack?.();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [chatId]);

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

  function handleBackClick() {
    // If we pushed a history entry for this chat, go back through it so
    // popstate fires and history stays clean; otherwise just call onBack.
    if (window.history.state?.chatOpen) {
      window.history.back();
    } else {
      onBack?.();
    }
  }

  if (!chatId) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-3 text-text-muted">
        <div className="h-14 w-14 rounded-2xl bg-elevated border border-border flex items-center justify-center">
          <MessageCircle size={22} className="opacity-60" />
        </div>
        <p className="text-sm">Select a chat to start replying</p>
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
  const initialLetter = displayName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex-1 flex flex-col h-[80vh] bg-base">
      {/* Header */}
      <div className="sticky flex items-center gap-3 px-3 md:px-4 py-2.5 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <button
          onClick={handleBackClick}
          className="md:hidden h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-text-muted hover:bg-elevated active:scale-95 transition"
          aria-label="Back to chats"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="relative shrink-0">
          <Avatar user={chat} size={40} />
          {chat.is_blocked && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-danger ring-2 ring-surface" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">{displayName}</p>
          </div>
          <p className={`text-xs truncate ${chat.is_blocked ? "text-danger" : "text-text-muted"}`}>
            {chat.is_blocked
              ? "Blocked \u2014 can't message you"
              : chat.username
              ? `@${chat.username}`
              : chat.last_seen
              ? `Seen ${new Date(chat.last_seen).toLocaleString()}`
              : "No username"}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {chat.is_pinned && (
            <span className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-elevated text-accent" title="Pinned">
              <Pin size={13} />
            </span>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className={`h-9 w-9 rounded-full flex items-center justify-center transition active:scale-95 ${
                menuOpen ? "bg-elevated text-text-primary" : "text-text-muted hover:bg-elevated"
              }`}
              aria-label="Chat options"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="n right-0 top-11 w-56 bg-elevated border border-border rounded-xl shadow-panel py-1.5 z-10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                <MenuItem
                  icon={chat.is_pinned ? <PinOff size={15} /> : <Pin size={15} />}
                  label={chat.is_pinned ? "Unpin chat" : "Pin chat"}
                  onClick={togglePin}
                />
                <MenuItem
                  icon={chat.is_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                  label={chat.is_archived ? "Unarchive chat" : "Archive chat"}
                  onClick={toggleArchive}
                />

                <div className="my-1.5 h-px bg-border" />

                {chat.is_blocked ? (
                  <MenuItem icon={<ShieldCheck size={15} />} label="Unblock user" onClick={unblock} />
                ) : (
                  <MenuItem
                    icon={<Ban size={15} />}
                    label="Block user"
                    onClick={() => { setMenuOpen(false); setConfirmAction("block"); }}
                    danger
                  />
                )}
                <MenuItem
                  icon={<Trash2 size={15} />}
                  label="Delete chat"
                  onClick={() => { setMenuOpen(false); setConfirmAction("delete"); }}
                  danger
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="h-12 w-12 rounded-full bg-elevated border border-border flex items-center justify-center text-text-muted text-sm font-medium">
              {initialLetter}
            </div>
            <p className="text-xs text-text-muted max-w-[220px]">
              No messages yet with {displayName}. Say hello to start the conversation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((m) => (
              <MessageBubble key={m._id} message={m} onForward={setForwardMessage} />
            ))}
          </div>
        )}
        {typing && (
          <div className="px-4 pt-2">
            <div className="inline-flex bg-elevated border border-border rounded-2xl px-3 py-2">
              <TypingDots />
            </div>
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
          className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition mt-1"
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
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors ${
        danger ? "text-danger hover:bg-danger/10" : "text-text-primary hover:bg-base/60"
      }`}
    >
      <span className="opacity-80">{icon}</span>
      {label}
    </button>
  );
}