// Utility functions to export document content in multiple formats

const downloadBlob = (filename, blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Convert HTML to simple clean Markdown
export const convertHtmlToMarkdown = (html = "") => {
  if (!html) return "";
  let md = html;

  // Headings
  md = md.replace(/<h1>(.*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2>(.*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3>(.*?)<\/h3>/gi, "\n### $1\n");

  // Bold, Italic, Strike
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<s>(.*?)<\/s>/gi, "~~$1~~");
  md = md.replace(/<strike>(.*?)<\/strike>/gi, "~~$1~~");

  // Code
  md = md.replace(/<code>(.*?)<\/code>/gi, "`$1`");
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");

  // Quotes
  md = md.replace(/<blockquote>(.*?)<\/blockquote>/gi, "\n> $1\n");

  // Lists
  md = md.replace(/<li><p>(.*?)<\/p><\/li>/gi, "- $1\n");
  md = md.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, "\n$1\n");
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, "\n$1\n");

  // Paragraphs and breaks
  md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  md = md
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  return md.trim();
};

// Export as Markdown (.md)
export const exportAsMarkdown = (title, html) => {
  const mdContent = `# ${title || "Untitled Document"}\n\n${convertHtmlToMarkdown(html)}`;
  const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
  downloadBlob(`${(title || "document").replace(/[^a-z0-9]/gi, "_")}.md`, blob);
};

// Export as HTML (.html)
export const exportAsHtml = (title, html) => {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Document"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1, h2, h3 { font-family: 'Georgia', serif; color: #111; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 8px; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #555; margin: 16px 0; }
    code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f8f8f8; padding: 12px; border-radius: 6px; overflow-x: auto; }
    hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
  </style>
</head>
<body>
  <h1>${title || "Untitled Document"}</h1>
  ${html}
</body>
</html>`;
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  downloadBlob(`${(title || "document").replace(/[^a-z0-9]/gi, "_")}.html`, blob);
};

// Export as Plain Text (.txt)
export const exportAsPlainText = (title, html) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const text = `${title || "Untitled Document"}\n\n${temp.textContent || temp.innerText || ""}`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(`${(title || "document").replace(/[^a-z0-9]/gi, "_")}.txt`, blob);
};

// Print / PDF via Browser
export const printDocument = (title) => {
  const prevTitle = document.title;
  document.title = title || "Document";
  window.print();
  document.title = prevTitle;
};
