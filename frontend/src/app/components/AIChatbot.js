// frontend/src/app/components/AIChatbot.js
"use client";
import React, { useState, useRef, useEffect } from "react";

// Hàm xử lý định dạng tin nhắn: hỗ trợ In đậm (**...**) và Link mở tab mới ([text](url))
function renderFormattedText(content) {
  if (!content) return null;

  const lines = String(content).split("\n");

  return lines.map((line, lineIdx) => {
    // Tách các đoạn link markdown [text](url) hoặc in đậm **text**
    const tokens = line.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

    return (
      <div key={lineIdx} style={{ minHeight: line.trim() === "" ? "8px" : "auto", lineHeight: "1.5", margin: "2px 0" }}>
        {tokens.map((token, tokenIdx) => {
          if (!token) return null;

          // Kiểm tra xem có phải là Link Markdown [tên sản phẩm](đường_dẫn)
          const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
          if (linkMatch) {
            const linkText = linkMatch[1];
            const linkHref = linkMatch[2];
            return (
              <a
                key={tokenIdx}
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#dc2626",
                  fontWeight: "600",
                  textDecoration: "none",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  margin: "2px 0",
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#fecaca";
                  e.currentTarget.style.color = "#b91c1c";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }}
                title={`Mở trang "${linkText}" trong tab mới`}
              >
                <span>{linkText}</span>
                <span style={{ fontSize: "11px" }}>↗</span>
              </a>
            );
          }

          // Kiểm tra xem có phải là chữ in đậm **văn bản**
          const boldMatch = token.match(/^\*\*(.*?)\*\*$/);
          if (boldMatch) {
            return (
              <strong key={tokenIdx} style={{ fontWeight: "700" }}>
                {boldMatch[1]}
              </strong>
            );
          }

          return <span key={tokenIdx}>{token}</span>;
        })}
      </div>
    );
  });
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Dạ, em là trợ lý tư vấn công nghệ DungThamMobile. Em có thể hỗ trợ anh/chị chọn điện thoại, laptop hay thiết bị nào hôm nay ạ? Anh/chị có thể gửi ảnh máy để em phân tích nhé!"
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // Base64 data URL
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Xử lý chọn ảnh từ máy
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, WebP)!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset file input
  };

  // Hỗ trợ dán ảnh trực tiếp từ Clipboard (Ctrl + V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // Hủy câu hỏi khi hỏi nhầm (Abort)
  const handleCancelQuestion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: "⏹ Đã hủy câu hỏi theo yêu cầu của anh/chị. Anh/chị cần em hỗ trợ điều gì khác không ạ?"
      }
    ]);
  };

  // Gửi tin nhắn
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const currentImage = selectedImage;
    const currentInput = input.trim();

    const userMessage = {
      role: "user",
      content: currentInput,
      image: currentImage
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          image: currentImage
        }),
        signal: controller.signal
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Lỗi kết nối");
      }
      setMessages([...updatedMessages, { role: "assistant", content: data.content }]);
    } catch (error) {
      if (error.name === "AbortError") {
        // Đã được xử lý bởi handleCancelQuestion
        return;
      }
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Dạ, hệ thống đang bận hoặc quá tải tạm thời. Anh/chị vui lòng thử gửi lại nhé!"
        }
      ]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000, fontFamily: "sans-serif" }}>
      {/* Nút Bong Bóng Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#fff",
            border: "none",
            fontSize: "26px",
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease"
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          title="Trò chuyện cùng Trợ lý AI DungThamMobile"
        >
          💬
        </button>
      )}

      {/* Cửa Sổ Chat */}
      {isOpen && (
        <div
          style={{
            width: "400px",
            maxWidth: "92vw",
            height: "550px",
            maxHeight: "86vh",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#fff",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "22px" }}>🤖</span>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>Trợ lý Công nghệ AI</div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>Tư vấn nhanh • Hỗ trợ gửi ảnh • Trực tiếp sản phẩm</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>

          {/* Vùng Tin Nhắn */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "#f9fafb"
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#ef4444" : "#ffffff",
                  color: m.role === "user" ? "#fff" : "#1f2937",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  maxWidth: "88%",
                  fontSize: "13.5px",
                  lineHeight: "1.45",
                  boxShadow: m.role === "user" ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
                  border: m.role === "user" ? "none" : "1px solid #e5e7eb"
                }}
              >
                {/* Nếu tin nhắn có kèm hình ảnh */}
                {m.image && (
                  <div style={{ marginBottom: "8px" }}>
                    <img
                      src={m.image}
                      alt="Ảnh tải lên"
                      style={{
                        maxWidth: "180px",
                        maxHeight: "140px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        border: "2px solid rgba(255,255,255,0.6)"
                      }}
                    />
                  </div>
                )}
                {m.role === "user" ? m.content : renderFormattedText(m.content)}
              </div>
            ))}

            {/* Trạng thái AI đang phản hồi kèm nút HỦY */}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  fontSize: "12.5px",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  background: "#fee2e2",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  width: "90%"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚙️</span>
                  <span>AI đang phân tích và tìm máy phù hợp...</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelQuestion}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "11.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px"
                  }}
                  title="Dừng xử lý nếu hỏi nhầm"
                >
                  ⏹ Hủy
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khung Xem Trước Ảnh nếu đã chọn */}
          {selectedImage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                background: "#fef2f2",
                borderTop: "1px solid #fecaca"
              }}
            >
              <img
                src={selectedImage}
                alt="Preview"
                style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ef4444" }}
              />
              <span style={{ fontSize: "12px", color: "#b91c1c", flex: 1 }}>
                Đã đính kèm ảnh (AI sẽ xem và nhận diện máy)
              </span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Gỡ ảnh này"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form Gửi Tin Nhắn */}
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #e5e7eb",
              padding: "10px",
              background: "#fff",
              gap: "8px"
            }}
          >
            {/* Input file ẩn */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {/* Nút đính kèm ảnh */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                background: selectedImage ? "#fee2e2" : "#f3f4f6",
                color: selectedImage ? "#dc2626" : "#4b5563",
                border: selectedImage ? "1px solid #fca5a5" : "1px solid #d1d5db",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
                transition: "all 0.2s"
              }}
              title="Đính kèm ảnh máy hoặc dán ảnh (Ctrl+V)"
            >
              📷
            </button>

            {/* Ô nhập tin nhắn */}
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder={selectedImage ? "Nhập câu hỏi về ảnh này..." : "Hỏi về máy hoặc dán ảnh (Ctrl+V)..."}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "20px",
                outline: "none",
                fontSize: "13.5px"
              }}
            />

            {/* Nút Gửi hoặc Nút Hủy khi đang tải */}
            {loading ? (
              <button
                type="button"
                onClick={handleCancelQuestion}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title="Hủy ngay câu hỏi này"
              >
                ⏹ Hủy
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !selectedImage}
                style={{
                  background: !input.trim() && !selectedImage ? "#fca5a5" : "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: !input.trim() && !selectedImage ? "not-allowed" : "pointer",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  transition: "background 0.2s"
                }}
              >
                Gửi
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}