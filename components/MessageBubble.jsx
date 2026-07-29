"use client";

import { format } from "date-fns";
import { Forward } from "lucide-react";
import MediaPreview from "./MediaPreview";
import { emojifyHtml } from "../lib/emoji";

export default function MessageBubble({ message, onForward }) {
  const isOut = message.sender === "admin";
  const time = format(new Date(message.date), "h:mm a");

  return (
    <div className={`group flex items-center gap-1 ${isOut ? "justify-end" : "justify-start"} px-4 py-1`}>
      {isOut && message.telegram_message_id && (
        <button
          type="button"
          onClick={() => onForward?.(message)}
          title="Forward"
          className="opacity-70 md:opacity-0 md:group-hover:opacity-100 h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-text-muted bg-elevated/60 md:bg-transparent hover:bg-elevated hover:text-accent active:bg-elevated transition-all"
        >
          <Forward size={14} />
        </button>
      )}

      <div
        className={`max-w-[85%] md:max-w-[70%] !px-3.5 py-2 shadow-panel ${isOut ? "bubble-out bg-ember text-white" : "bubble-in bg-elevated text-text-primary"
          }`}
      >
        {message.message_type !== "text" && (
          <div className={message.text ? "mb-1.5" : ""}>
            <MediaPreview message={message} isOut={isOut} />
          </div>
        )}

        {message.text && message.message_type !== "sticker" && (
          <p
            className="text-sm whitespace-pre-wrap break-words leading-relaxed"
            dangerouslySetInnerHTML={{ __html: emojifyHtml(message.text) }}
          />
        )}

        <span className={`block text-[10px] mt-1 text-right ${isOut ? "text-white/70" : "text-text-faint"}`}>
          {time}
        </span>
      </div>

      {!isOut && message.telegram_message_id && (
        <button
          type="button"
          onClick={() => onForward?.(message)}
          title="Forward"
          className="opacity-70 md:opacity-0 md:group-hover:opacity-100 h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-text-muted bg-elevated/60 md:bg-transparent hover:bg-elevated hover:text-accent active:bg-elevated transition-all"
        >
          <Forward size={14} />
        </button>
      )}
    </div>
  );
}