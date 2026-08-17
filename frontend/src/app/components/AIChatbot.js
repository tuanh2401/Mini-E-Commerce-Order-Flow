// frontend/src/app/components/AIChatbot.js
"use client";
import React, { useState } from "react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Dạ, em là trợ lý FPT Shop. Em có thể giúp gì cho anh/chị tìm kiếm sản phẩm hôm nay ạ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Lỗi");
      }
      setMessages([...updatedMessages, { role: "assistant", content: data.content }]);
    } catch (error) {
      setMessages([...updatedMessages, { role: "assistant", content: "Dạ, hệ thống đang bận. Anh/chị thử lại sau nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000, fontFamily: "sans-serif" }}>
      {/* Nút Bong Bóng Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: "24px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          💬
        </button>
      )}

      {/* Cửa Sổ Chat */}
      {isOpen && (
        <div style={{ width: "350px", height: "450px", background: "#fff", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <div style={{ background: "#ef4444", color: "#fff", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "bold" }}>🤖 Trợ lý Mua sắm AI</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px" }}>✕</button>
          </div>

          {/* Vùng Tin Nhắn */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#f9fafb" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#ef4444" : "#e5e7eb", color: m.role === "user" ? "#fff" : "#1f2937", padding: "10px 14px", borderRadius: "12px", maxWidth: "80%", fontSize: "14px" }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ fontSize: "12px", color: "#6b7280" }}>AI đang phân tích sản phẩm...</div>}
          </div>

          {/* Form Gửi Tin Nhắn */}
          <form onSubmit={handleSend} style={{ display: "flex", borderTop: "1px solid #e5e7eb", padding: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tôi muốn mua laptop dưới 20 triệu..."
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "20px", outline: "none", fontSize: "14px" }}
            />
            <button type="submit" style={{ marginLeft: "8px", background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "14px" }}>Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}