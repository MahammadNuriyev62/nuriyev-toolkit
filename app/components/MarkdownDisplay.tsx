"use client";

import React from "react";

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export default function MarkdownDisplay({
  content,
  className = "",
}: MarkdownDisplayProps) {
  return (
    <div className={`whitespace-pre-wrap font-mono text-sm ${className}`}>
      {content}
    </div>
  );
}
