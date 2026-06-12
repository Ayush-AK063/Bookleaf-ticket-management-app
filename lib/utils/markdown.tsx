import React from "react";

export function renderTextWithAttachments(text: string) {
  if (!text) return null;

  // Split the text by our image or link patterns
  // Pattern matches ![alt](url) or [text](url)
  const regex = /(!?\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        // Image match: ![Attachment](url)
        const imgMatch = part.match(/^!\[([^\]]+)\]\(([^)]+)\)$/);
        if (imgMatch) {
          return (
            <img
              key={i}
              src={imgMatch[2]}
              alt={imgMatch[1]}
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: 8,
                marginTop: 12,
                display: "block",
                border: "1px solid var(--color-border)",
                objectFit: "contain",
              }}
            />
          );
        }

        // Link match: [View Attachment](url)
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-primary)",
                textDecoration: "underline",
                display: "inline-block",
                marginTop: 12,
              }}
            >
              {linkMatch[1]}
            </a>
          );
        }

        // Regular text
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
