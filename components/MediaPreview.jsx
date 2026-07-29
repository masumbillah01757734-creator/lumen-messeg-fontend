"use client";

import { FileText, Download } from "lucide-react";

function fileUrl(fileId, fileName, { download = false } = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const params = new URLSearchParams({ token: token || "" });
  if (fileName) params.set("filename", fileName);
  if (download) params.set("download", "1");
  return `${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}?${params.toString()}`;
}

export default function MediaPreview({ message }) {
  const { message_type, file_id, file_name, text } = message;
  const src = file_id ? fileUrl(file_id, file_name) : null;

  switch (message_type) {
    case "photo":
      return (
        <img
          src={src}
          alt={text || "Photo"}
          className="rounded-lg max-w-[280px] max-h-[320px] object-cover"
          loading="lazy"
        />
      );

    case "video":
      return (
        <video controls className="rounded-lg max-w-[280px] max-h-[320px]">
          <source src={src} />
        </video>
      );

    case "video_note":
      return (
        <video
          controls
          className="rounded-full w-[200px] h-[200px] object-cover"
        >
          <source src={src} />
        </video>
      );

    case "animation": // GIF
      return <img src={src} alt="GIF" className="rounded-lg max-w-[240px]" loading="lazy" />;

    case "sticker":
      return (
        <div className="flex flex-col items-start">
          <img src={src} alt={text || "Sticker"} className="w-32 h-32 object-contain" loading="lazy" />
          {text && <span className="text-xs text-text-muted mt-1">{text}</span>}
        </div>
      );

    case "audio":
      return (
        <audio controls className="w-64">
          <source src={src} />
        </audio>
      );

    case "voice":
      return (
        <audio controls className="w-56">
          <source src={src} type="audio/ogg" />
        </audio>
      );

    case "document": {
      // download=1 forces Content-Disposition: attachment on the backend, so zips and other
      // archives actually save to disk instead of just opening a blank tab.
      const downloadUrl = fileUrl(file_id, file_name, { download: true });
      return (
        <a
          href={downloadUrl}
          download={file_name || undefined}
          className="flex items-center gap-3 bg-elevated hover:bg-elevated/70 border border-border rounded-lg px-3 py-2.5 max-w-[260px] transition-colors"
        >
          <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-accent" />
          </div>
          <span className="text-sm truncate flex-1">{file_name || "Document"}</span>
          <Download size={16} className="text-text-muted shrink-0" />
        </a>
      );
    }

    default:
      return null;
  }
}
