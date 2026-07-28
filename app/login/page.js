"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import api from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-10 w-10 rounded-2xl bg-accent/15 flex items-center justify-center">
            <Send size={20} className="text-accent" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Dashboard</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl2 p-6 shadow-panel space-y-4"
        >
          <div>
            <h1 className="font-display text-lg font-semibold mb-1">Admin sign in</h1>
            <p className="text-sm text-text-muted">Reply to your Telegram bot's messages from here.</p>
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-dim disabled:opacity-60 text-white font-medium text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
