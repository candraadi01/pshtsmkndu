export function resolveMediaUrl(reference: string | null | undefined) {
  if (!reference) return "/sh-emblem.png";
  if (/^https?:\/\//i.test(reference)) return reference;
  const clean = reference.replace(/^\/+/, "");
  if (
    clean.startsWith("sh-emblem.png") ||
    clean.startsWith("psht-badge.png") ||
    clean.startsWith("logo.png") ||
    clean.startsWith("favicon")
  ) {
    return `/${clean}`;
  }
  const normalized = clean.replace(/^storage\//, "");
  return `/storage/${normalized}`;
}

/**
 * Converts various YouTube URL formats (watch, share, shorts) to an embeddable URL.
 */
export function formatVideoEmbedUrl(url?: string | null): string {
  if (!url) return "";
  const clean = url.trim();
  if (!clean) return "";

  // Convert youtu.be/ID
  if (clean.includes("youtu.be/")) {
    const id = clean.split("youtu.be/")[1]?.split(/[?&]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  // Convert youtube.com/watch?v=ID
  if (clean.includes("youtube.com/watch")) {
    const match = clean.match(/[?&]v=([^&]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Convert youtube.com/shorts/ID
  if (clean.includes("youtube.com/shorts/")) {
    const id = clean.split("youtube.com/shorts/")[1]?.split(/[?&]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  return clean;
}

