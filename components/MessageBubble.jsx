"use client";

import { format } from "date-fns";
import MediaPreview from "./MediaPreview";

export default function MessageBubble({ message }) {
  const isOut = message.sender === "admin";
  const time = format(new Date(message.date), "h:mm a");

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div
        className={`max-w-[70%] px-3.5 py-2 ${isOut ? "bubble-out bg-accent text-white" : "bubble-in bg-elevated text-text-primary"}`}
      >
        {message.message_type !== "text" && (
          <div className={message.text ? "mb-1.5" : ""}>
            <MediaPreview message={message} />
          </div>
        )}

        {message.text && message.message_type !== "sticker" && (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        )}

        <span className={`block text-[10px] mt-1 text-right ${isOut ? "text-white/70" : "text-text-faint"}`}>
          {time}
        </span>
      </div>
    </div>
  );
}
