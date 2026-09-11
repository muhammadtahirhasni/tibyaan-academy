import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Stored post content arrives in two shapes: the dars agent is prompted for HTML,
 * the blog agent for Markdown, and translations drift between the two. `marked`
 * handles both — it passes raw HTML blocks through untouched — so a single path
 * covers everything and the sanitizer is what makes the result safe to inject.
 */

marked.setOptions({ gfm: true, breaks: true });

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "div", "span",
    "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
    "ul", "ol", "li",
    "blockquote", "q", "cite",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    span: ["dir", "lang"],
    div: ["dir", "lang"],
    p: ["dir", "lang"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Anything not on the allowlist loses its tag but keeps its text, so a stray
  // <h1> or <script> wrapper never silently deletes a paragraph of content.
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  transformTags: {
    // The page title is the one <h1>. Content headings start at <h2>.
    h1: "h2",
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const isExternal = /^https?:\/\//i.test(href) && !href.includes("tibyaanacademy.com");
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer nofollow" }
            : { rel: "noopener noreferrer" }),
        },
      };
    },
  },
};

/** Render stored post content (Markdown or HTML) to sanitized HTML. */
export function renderPostContent(source: string | null | undefined): string {
  if (!source) return "";
  const html = marked.parse(source, { async: false }) as string;
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/** Plain text of stored content — for meta descriptions and excerpts. */
export function contentToPlainText(source: string | null | undefined): string {
  if (!source) return "";
  const html = marked.parse(source, { async: false }) as string;
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
