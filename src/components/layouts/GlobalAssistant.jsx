"use client";

import { useState, useEffect } from "react";
import AssistantSidePanel from "./AssistantSidePanel";

export default function GlobalAssistant() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Listen for custom event to open assistant from floating button or other triggers
  useEffect(() => {
    const handleOpenInara = () => setAssistantOpen(true);
    window.addEventListener('open-inara', handleOpenInara);
    return () => window.removeEventListener('open-inara', handleOpenInara);
  }, []);

  return (
    <AssistantSidePanel
      isOpen={assistantOpen}
      onClose={() => setAssistantOpen(false)}
    />
  );
}
