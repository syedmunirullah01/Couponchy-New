import React from "react";

export default function NoTranslateText({ text, storeName }) {
  if (!text) return null;

  const escapeRegex = (string) => string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

  const names = ["Couponchy"];
  if (storeName) {
    names.push(storeName);
  }

  // Sort by length descending to match longer names first
  names.sort((a, b) => b.length - a.length);

  // Avoid matching names if they are part of other words (using word boundaries)
  const regex = new RegExp(`\\b(${names.map(escapeRegex).join("|")})\\b`, "gi");

  const parts = text.split(regex);
  if (parts.length === 1) return <>{text}</>;

  const renderedParts = [];
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (part === undefined || part === "") continue;

    const isMatch = names.some((name) => name.toLowerCase() === part.toLowerCase());

    if (isMatch) {
      // Check if the next part starts with a space to bundle it into the notranslate tag
      const nextPart = parts[i + 1];
      if (nextPart && nextPart.startsWith(" ")) {
        part = part + " ";
        parts[i + 1] = nextPart.substring(1);
      }
      renderedParts.push(
        <span key={i} className="notranslate">
          {part}
        </span>
      );
    } else {
      renderedParts.push(part);
    }
  }

  return <>{renderedParts}</>;
}
