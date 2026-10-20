"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/app/lib/api";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    let items = [];
    const token = localStorage.getItem("accessToken");
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;
    setIsLoggedIn(!!validToken);

    // 1. Thử lấy từ Backend API (nếu có token hợp lệ)
    if (validToken) {
      try {
        const res = await api.get("/cart");
        const backendItems = res.data.data?.items || res.data.data?.cartItems || [];
        if (backendItems.length > 0) {
          items = backendItems.map(item => ({
            id: item.productId || item.id,
            name: item.productName || item.name || "Sản phẩm",
            price: item.price || item.unitPrice || 0,
            quantity: item.quantity || 1,
            imageUrl: item.imageUrl || item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
          }));
        }
      } catch (err) {
        console.warn("Lỗi tải giỏ hàng từ server:", err.message);
      }
    }

    // 2. Nếu Backend trống hoặc không đăng nhập, đọc từ localStorage local
    if (items.length === 0) {
      try {
        const localData = localStorage.getItem("dtm_cart_items");
        if (localData) {
          items = JSON.parse(localData);
        }
      } catch (e) {
        console.error("Lỗi đọc local cart: ", e);
      }
    }

    setCartItems(items);
    setLoading(false);
  };

  const saveLocalCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem("dtm_cart_items", JSON.stringify(newItems));
  };

  // Cập nhật số lượng (+ / -)
  const handleUpdateQuantity = async (productId, delta) => {
    const updated = cartItems.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });

    saveLocalCart(updated);

    // Nếu đã đăng nhập, đồng bộ sang Backend API
    const targetItem = updated.find(i => i.id === productId);
    if (targetItem) {
      try {
        await api.put(`/cart/items/${productId}`, { quantity: targetItem.quantity });
      } catch (e) {
        // Bỏ qua lỗi sync backend nếu có
      }
    }
  };

  // Xóa 1 sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (productId) => {
    const updated = cartItems.filter(item => item.id !== productId);
    saveLocalCart(updated);

    try {
      await api.delete(`/cart/items/${productId}`);
    } catch (e) {
      // Bỏ qua lỗi sync
    }
  };

  // Xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?")) return;
    saveLocalCart([]);

    try {
      await api.delete("/cart");
    } catch (e) {}
  };

  // Tiến hành Đặt hàng (Chuyển sang trang Thanh Toán Checkout)
  const handleCheckout = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vui lòng đăng nhập để tiến hành đặt hàng!");
      window.location.href = "/auth";
      return;
    }
    window.location.href = "/checkout";
  };

  const getProductImage = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://localhost:9000/products/${url.replace(/^\/+/, "")}`;
  };

  // Tính tổng tiền
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = subtotal > 15000000 ? 500000 : 0;
  const shippingFee = subtotal > 0 ? 0 : 0;
  const total = Math.max(subtotal - discount + shippingFee, 0);

  if (loading) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>Đang tải thông tin giỏ hàng DungThamMobile...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <div style={{ background: "white", padding: "40px 30px", borderRadius: "20px", maxWidth: "600px", margin: "0 auto", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>Đặt hàng thành công!</h2>
          <p style={{ fontSize: "16px", color: "#475569", marginBottom: "24px", lineHeight: "1.6" }}>
            Cảm ơn bạn đã mua sắm tại <strong>DungThamMobile</strong>. Nhân viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
          </p>
          <a href="/" className="confirm-location-btn" style={{ textDecoration: "none", display: "inline-block", padding: "14px 32px", fontSize: "16px" }}>
            Quay về Trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container" style={{ padding: "40px 15px" }}>
      
      {/* TIÊU ĐỀ GIỎ HÀNG */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a" }}>
          🛒 Giỏ hàng của bạn ({cartItems.length} sản phẩm)
        </h1>
        {cartItems.length > 0 && (
          <button 
            onClick={handleClearCart} 
            style={{ background: "transparent", border: "none", color: "#ef4444", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}
          >
            🗑️ Xóa tất cả
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        /* TRẠNG THÁI GIỎ HÀNG TRỐNG */
        <div style={{ background: "white", borderRadius: "20px", padding: "60px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛍️</div>
          <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", marginBottom: "10px" }}>Giỏ hàng của bạn đang trống</h3>
          <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "24px" }}>Hãy chọn thêm sản phẩm điện thoại, laptop, phụ kiện từ DungThamMobile để tiếp tục!</p>
          <a href="/" className="confirm-location-btn" style={{ textDecoration: "none", display: "inline-block", padding: "14px 32px", fontSize: "16px" }}>
            Khám phá sản phẩm ngay
          </a>
        </div>
      ) : (
        /* DANH SÁCH SẢN PHẨM & TỔNG TIỀN (2 CỘT LAYOUT) */
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "28px" }}>
          
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM trong GIỎ HÀNG */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cartItems.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  border: "1px solid #f1f5f9"
                }}
              >
                {/* Ảnh sản phẩm */}
                <div style={{ width: "90px", height: "90px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img 
                    src={getProductImage(item.imageUrl)} 
                    alt={item.name} 
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>{item.name}</h3>
                  <div style={{ fontSize: "18px", fontWeight: "900", color: "var(--fpt-red)" }}>
                    {item.price ? item.price.toLocaleString("vi-VN") : 0} đ
                  </div>
                </div>

                {/* Bộ chỉnh số lượng */}
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    style={{ background: "#f8fafc", border: "none", width: "36px", height: "36px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", color: "#334155" }}
                  >
                    -
                  </button>
                  <span style={{ padding: "0 14px", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    style={{ background: "#f8fafc", border: "none", width: "36px", height: "36px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", color: "#334155" }}
                  >
                    +
                  </button>
                </div>

                {/* Tổng tiền món */}
                <div style={{ width: "130px", textAlign: "right", fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>
                  {((item.price || 0) * item.quantity).toLocaleString("vi-VN")} đ
                </div>

                {/* Nút xóa */}
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", padding: "8px" }}
                  title="Xóa sản phẩm"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI: THÔNG TIN TỔNG ĐƠN HÀNG & NÚT ĐẶT HÀNG */}
          <div>
            <div 
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "26px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
                position: "sticky",
                top: "100px"
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                Tóm tắt đơn hàng
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", fontSize: "15px", color: "#475569" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tạm tính ({cartItems.length} món):</span>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>{subtotal.toLocaleString("vi-VN")} đ</span>
                </div>

                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}>
                    <span>Ưu đãi giỏ hàng lớn:</span>
                    <span style={{ fontWeight: "700" }}>-{discount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Phí giao hàng:</span>
                  <span style={{ fontWeight: "700", color: "#059669" }}>MIỄN PHÍ</span>
                </div>
              </div>

              <div style={{ borderTop: "2px dashed #e2e8f0", paddingTop: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Tổng tiền:</span>
                <span style={{ fontSize: "24px", fontWeight: "900", color: "var(--fpt-red)" }}>
                  {total.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={ordering}
                style={{
                  width: "100%",
                  backgroundColor: "var(--fpt-red)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "16px",
                  fontSize: "17px",
                  fontWeight: "800",
                  cursor: ordering ? "wait" : "pointer",
                  boxShadow: "0 4px 12px rgba(205, 28, 34, 0.25)",
                  transition: "all 0.2s"
                }}
              >
                {ordering ? "Đang xử lý..." : "TIẾN HÀNH THANH TOÁN 🎟️"}
              </button>

              <div style={{ marginTop: "14px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
                💡 <em>Bạn có thể chọn mã giảm giá / Voucher ở bước thanh toán kế tiếp.</em>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
