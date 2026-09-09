import sanitizeHtmlLibrary from "sanitize-html";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitasi konten HTML artikel server-side menggunakan package sanitize-html
 * dengan allowlist tag, atribut, dan skema URL yang ketat.
 */
export function sanitizeHtml(rawHtml: string | null | undefined): string {
  if (!rawHtml) return "";

  // Jika konten berupa teks biasa tanpa tag HTML, escape karakter khusus lalu ubah baris baru menjadi paragraf
  if (!/<[a-z][\s\S]*>/i.test(rawHtml)) {
    return rawHtml
      .split(/\n\n+/)
      .map((p) => `<p class="mb-4 leading-relaxed">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  return sanitizeHtmlLibrary(rawHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "b", "strong", "i", "em", "u", "s", "strike",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtmlLibrary.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}
