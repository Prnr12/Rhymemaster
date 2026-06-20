import React, { useState, useRef } from "react";

export default function RhymeMaster() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const findRhymes = async () => {
    const cleanWord = word.trim();
    if (!cleanWord) {
      setError("Type a word first.");
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/.netlify/functions/rhyme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: cleanWord }),
      });

      if (!response.ok) throw new Error("API request failed");
      const parsed = await response.json();

      if (!parsed.rhymes || !Array.isArray(parsed.rhymes) || parsed.rhymes.length === 0) {
        throw new Error("No rhymes returned");
      }
      setResult(parsed);
    } catch (e) {
      setError("Couldn't find rhymes right now. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") findRhymes();
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const text = `${word.toUpperCase()} rhymes with: ${result.rhymes
      .map((r) => r.word)
      .join(", ")}\n\n"${result.sentence}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select and copy manually.");
    }
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `${word.toUpperCase()} rhymes with: ${result.rhymes
      .map((r) => r.word)
      .join(", ")}\n\n"${result.sentence}"\n\nFound on Rhyme Master`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Rhyme Master", text });
      } catch {}
    } else {
      copyToClipboard();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0E0E10",
        color: "#F2F0EB",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "90px",
          border: "1px dashed #3A3A3E",
          background: "#161618",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6B7280",
          fontSize: "12px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          boxSizing: "border-box",
        }}
        aria-label="AdSense Space Top"
      >
        AdSense Space
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginTop: "56px", marginBottom: "40px" }}>
          <div
            style={{
              fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(40px, 9vw, 64px)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Rhyme<span style={{ color: "#A78BFA" }}>Master</span>
          </div>
          <p style={{ color: "#9A9AA2", fontSize: "15px", marginTop: "12px", marginBottom: 0 }}>
            Type a word. Get the rhyme. Drop the mic.
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            ref={inputRef}
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type any word…"
            aria-label="Word to rhyme"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: "clamp(22px, 5vw, 30px)",
              fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
              fontWeight: 500,
              textAlign: "center",
              padding: "20px 16px",
              borderRadius: "14px",
              border: "2px solid #2B2B2F",
              background: "#161618",
