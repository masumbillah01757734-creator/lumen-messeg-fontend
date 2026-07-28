"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft } from "lucide-react";
import ChatList from "../../components/ChatList";
import ChatWindow from "../../components/ChatWindow";
import BlockedUsersModal from "../../components/BlockedUsersModal";
import { getSocket, disconnectSocket } from "../../lib/socket";

export default function DashboardPage() {
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState(null);
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    getSocket();
    setReady(true);
    return () => disconnectSocket();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    disconnectSocket();
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-base">
      {/* Sidebar — hidden on mobile once a chat is open */}
      <aside
        className={`w-full sm:w-[340px] shrink-0 border-r border-border bg-surface flex flex-col ${
          activeChatId ? "hidden sm:flex" : "flex"
        }`}
      >
        <ChatList
          key={refreshKey}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onOpenBlocked={() => setBlockedModalOpen(true)}
        />
        <div className="px-4 py-3 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Conversation pane */}
      <main className={`flex-1 flex flex-col ${activeChatId ? "flex" : "hidden sm:flex"}`}>
        {activeChatId && (
          <button
            onClick={() => setActiveChatId(null)}
            className="sm:hidden flex items-center gap-1.5 px-4 py-2 text-xs text-text-muted border-b border-border"
          >
            <ArrowLeft size={14} /> Back to chats
          </button>
        )}
        <ChatWindow chatId={activeChatId} onChatMutated={() => setRefreshKey((k) => k + 1)} />
      </main>

      <BlockedUsersModal open={blockedModalOpen} onClose={() => setBlockedModalOpen(false)} />
    </div>
  );
}
