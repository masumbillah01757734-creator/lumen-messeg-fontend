import twemoji from "twemoji";

// Windows' built-in emoji font (Segoe UI Emoji) is missing glyphs for a lot of
// emoji that Android/iOS render fine, which is why some show as blank boxes on
// desktop. Twemoji renders every emoji as a small SVG image instead, so the
// same emoji looks identical everywhere regardless of what fonts are installed.
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Converts raw (untrusted) text into HTML-escaped text with emoji swapped for
// <img> tags. Safe to use with dangerouslySetInnerHTML since HTML is escaped
// before twemoji ever sees it.
export function emojifyHtml(text) {
  const escaped = escapeHtml(text ?? "");
  return twemoji.parse(escaped, {
    base: TWEMOJI_BASE,
    folder: "svg",
    ext: ".svg",
    className: "inline-emoji",
  });
}
