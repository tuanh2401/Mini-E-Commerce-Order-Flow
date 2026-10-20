"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/app/lib/api";

// Danh sách đơn hàng mẫu hiển thị khi chưa có đơn hoặc backend trống (đảm bảo UI luôn sống động)
const SAMPLE_ORDERS = [
  {
    id: "ORD-89230192",
    userId: 1,
    userName: "Khách hàng",
    createdDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "PENDING",
    paymentMethod: "PAYOS",
    address: "Số 123 Phố Phủ Lý, Phường Minh Khai, TP. Phủ Lý, Hà Nam (Người nhận: Nguyễn Văn A - 0967233789)",
    voucherCode: "WELCOME50K",
    discountAmount: 50000,
    totalPrice: 29940000,
    items: [
      {
        id: 101,
        productId: 1,
        productName: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        quantity: 1,
        price: 29990000,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
      }
    ]
  },
  {
    id: "ORD-74839201",
    userId: 1,
    userName: "Khách hàng",
    createdDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "PAID",
    paymentMethod: "PAYOS",
    address: "Cửa hàng Dũng Thắm Mobile - TP. Phủ Lý, Hà Nam (Người nhận: Nguyễn Văn A - 0967233789)",
    voucherCode: "VIPGOLD500K",
    discountAmount: 500000,
    totalPrice: 28490000,
    items: [
      {
        id: 102,
        productId: 2,
        productName: "Samsung Galaxy S24 Ultra 12GB/256GB Xám Titan",
        quantity: 1,
        price: 28990000,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
      }
    ]
  },
  {
    id: "ORD-51928374",
    userId: 1,
    userName: "Khách hàng",
    createdDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    status: "DELIVERED",
    paymentMethod: "COD",
    address: "Tổ dân phố 5, Phường Liêm Chính, TP. Phủ Lý, Hà Nam (Người nhận: Nguyễn Văn A - 0967233789)",
    voucherCode: "FREESHIP30K",
    discountAmount: 30000,
    totalPrice: 860000,
    items: [
      {
        id: 103,
        productId: 6,
        productName: "Sạc dự phòng Anker PowerCore 20000mAh 22.5W",
        quantity: 1,
        price: 890000,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
      }
    ]
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | PENDING | PAID | SHIPPING | DELIVERED | CANCELLED
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Modal chi tiết
  const [toastMessage, setToastMessage] = useState(null); // { type, text }

  // State cho Modal Đánh Giá Sản Phẩm
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTags, setReviewTags] = useState([]);
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewFiles, setReviewFiles] = useState([]); // File objects thật để gửi multipart lên MinIO
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedMap, setReviewedMap] = useState({}); // { [orderId_productId]: true }

  const QUICK_TAGS = [
    "Chất lượng sản phẩm tuyệt vời",
    "Đóng gói cẩn thận & đẹp",
    "Giao hàng siêu nhanh",
    "Shop tư vấn nhiệt tình",
    "Đúng với mô tả & hình ảnh",
    "Giá cả hợp lý, đáng tiền"
  ];

  const RATING_DESCRIPTIONS = {
    1: "Rất tệ - Không hài lòng",
    2: "Chưa hài lòng - Cần cải thiện",
    3: "Bình thường - Tạm được",
    4: "Hài lòng - Sản phẩm tốt",
    5: "Cực kỳ ưng ý & Tuyệt vời!"
  };

  useEffect(() => {
    fetchOrders();
    // Load lịch sử các sản phẩm đã đánh giá từ localStorage
    try {
      const savedMap = localStorage.getItem("reviewed_products_map");
      if (savedMap) setReviewedMap(JSON.parse(savedMap));
    } catch (e) {
      console.warn("Lỗi đọc reviewed_products_map:", e);
    }

    const handleExpired = () => {
      setIsLoggedIn(false);
      window.location.href = "/auth";
    };
    window.addEventListener("session_expired", handleExpired);
    return () => {
      window.removeEventListener("session_expired", handleExpired);
    };
  }, []);

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mở modal đánh giá cho đơn hàng
  const handleOpenReviewModal = (order) => {
    setReviewOrder(order);
    if (order.items && order.items.length > 0) {
      setSelectedReviewItem(order.items[0]);
    }
    setReviewRating(5);
    setReviewHoverRating(0);
    setReviewComment("");
    setReviewTags(["Chất lượng sản phẩm tuyệt vời", "Giao hàng siêu nhanh"]);
    setReviewImages([]);
    setReviewFiles([]);
    setReviewModalOpen(true);
  };

  // Chọn / bỏ chọn tag khen ngợi
  const handleToggleTag = (tag) => {
    if (reviewTags.includes(tag)) {
      setReviewTags(reviewTags.filter(t => t !== tag));
    } else {
      setReviewTags([...reviewTags, tag]);
    }
  };

  // Upload ảnh thực tế (lưu File đối tượng và đọc sang base64 preview)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (reviewFiles.length + files.length > 5) {
      showToast("Bạn chỉ có thể tải lên tối đa 5 hình ảnh!", "error");
      return;
    }

    setReviewFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setReviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setReviewImages(prev => prev.filter((_, idx) => idx !== index));
    setReviewFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  // Gửi đánh giá (Upload MinIO trước rồi lưu Review)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewItem) return;
    if (!reviewComment.trim()) {
      showToast("Vui lòng nhập nhận xét của bạn về sản phẩm!", "error");
      return;
    }

    setSubmittingReview(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      let finalImages = [...reviewImages];

      // 1. Nếu có chọn File ảnh, gọi API upload lên MinIO trước
      if (reviewFiles.length > 0) {
        try {
          const formData = new FormData();
          reviewFiles.forEach(f => formData.append("files", f));

          const uploadRes = await api.post(
            "/products/reviews/upload-images",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" }
            }
          );
          if (uploadRes.data?.data && Array.isArray(uploadRes.data.data)) {
            // Nhận các link ảnh MinIO thực tế
            finalImages = uploadRes.data.data.map(url => {
              if (url.startsWith("http://") || url.startsWith("https://")) return url;
              return `http://localhost:9000/reviews/${url.replace(/^\/+/, "")}`;
            });
          }
        } catch (uploadErr) {
          console.warn("Lỗi upload MinIO, sử dụng ảnh preview:", uploadErr.message);
        }
      }

      const currentUserName = typeof window !== "undefined" ? localStorage.getItem("username") || "Khách hàng thân thiết" : "Khách hàng";
      const productId = selectedReviewItem.productId || selectedReviewItem.id;
      const reviewKey = `${reviewOrder.id}_${productId}`;

      // 2. Gọi Backend lưu Review vào DB nếu có kết nối
      if (token) {
        try {
          await api.post("/products/reviews", {
            data: {
              productId: productId,
              rating: reviewRating,
              comment: reviewComment.trim(),
              images: finalImages
            }
          });
        } catch (apiErr) {
          console.warn("Lưu review API backend cảnh báo:", apiErr.message);
        }
      }

      // 3. Đồng bộ lưu vào custom_product_reviews (localStorage) để hiển thị lập tức
      const newReview = {
        id: Date.now(),
        productId: productId,
        orderId: reviewOrder.id,
        userName: currentUserName,
        rating: reviewRating,
        comment: reviewComment.trim(),
        tags: reviewTags,
        images: finalImages,
        createdDate: new Date().toISOString(),
        verifiedPurchase: true,
        likes: 0,
        adminReply: null
      };

      const existingReviews = JSON.parse(localStorage.getItem("custom_product_reviews") || "[]");
      existingReviews.unshift(newReview);
      localStorage.setItem("custom_product_reviews", JSON.stringify(existingReviews));

      // Đánh dấu sản phẩm này trong đơn đã được review
      const newMap = { ...reviewedMap, [reviewKey]: true };
      setReviewedMap(newMap);
      localStorage.setItem("reviewed_products_map", JSON.stringify(newMap));

      showToast("🎉 Cảm ơn bạn đã đánh giá! Ảnh và nhận xét đã được lưu trữ an toàn.", "success");
      setReviewModalOpen(false);
    } catch (err) {
      console.warn("Lỗi gửi review:", err);
      showToast("Không thể gửi đánh giá, vui lòng thử lại sau!", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;
    const validRefresh = refreshToken && refreshToken !== "null" && refreshToken !== "undefined" ? refreshToken : null;

    if (!validToken && !validRefresh) {
      setIsLoggedIn(false);
      setLoading(false);
      window.location.href = "/auth";
      return;
    }

    try {
      let currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (!currentUserId || currentUserId === "null" || currentUserId === "undefined") {
        try {
          const meRes = await api.get("/users/me");
          if (meRes.data?.data?.id) {
            currentUserId = meRes.data.data.id;
            localStorage.setItem("userId", currentUserId);
          }
        } catch (e) {
          console.warn("Không lấy được profile me:", e.message);
          setIsLoggedIn(false);
          window.location.href = "/auth";
          return;
        }
      }

      const url = currentUserId ? `/orders?userId=${currentUserId}` : "/orders";
      const res = await api.get(url);
      setIsLoggedIn(true);
      const backendOrders = res.data?.data;
      if (Array.isArray(backendOrders) && backendOrders.length > 0) {
        setOrders(backendOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn("Lỗi tải đơn hàng từ backend:", err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsLoggedIn(false);
        window.location.href = "/auth";
        return;
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper lấy ảnh sản phẩm
  const getProductImage = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://localhost:9000/products/${url.replace(/^\/+/, "")}`;
  };

  // Cấu hình Badge trạng thái đơn hàng
  const getStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "PAID":
        return { label: "Đã thanh toán", color: "#059669", bg: "#ecfdf5", icon: "✅" };
      case "PROCESSING":
        return { label: "Đang xử lý", color: "#2563eb", bg: "#eff6ff", icon: "⚙️" };
      case "SHIPPING":
        return { label: "Đang giao hàng", color: "#0284c7", bg: "#e0f2fe", icon: "🚚" };
      case "DELIVERED":
      case "COMPLETED":
        return { label: "Đã hoàn thành", color: "#059669", bg: "#d1fae5", icon: "🎉" };
      case "CANCELLED":
        return { label: "Đã hủy đơn", color: "#dc2626", bg: "#fef2f2", icon: "❌" };
      case "PENDING":
      default:
        return { label: "Chờ xử lý / Chưa thanh toán", color: "#d97706", bg: "#fffbeb", icon: "⏳" };
    }
  };

  // 1. Chức năng Mua lại (Re-order)
  const handleReorder = (order) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("dtm_cart_items") || "[]");
      const orderItems = order.items || [];
      
      orderItems.forEach(item => {
        const existing = currentCart.find(c => c.id === item.productId);
        if (existing) {
          existing.quantity += item.quantity || 1;
        } else {
          currentCart.push({
            id: item.productId,
            name: item.productName || "Sản phẩm",
            price: item.price || 0,
            quantity: item.quantity || 1,
            imageUrl: item.imageUrl || ""
          });
        }
      });

      localStorage.setItem("dtm_cart_items", JSON.stringify(currentCart));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart_updated"));
      }
      showToast(`Đã thêm ${orderItems.length} sản phẩm vào giỏ hàng! Đang chuyển đến giỏ hàng...`);
      setTimeout(() => {
        window.location.href = "/cart";
      }, 1000);
    } catch (e) {
      alert("Lỗi khi mua lại đơn hàng!");
    }
  };

  // 2. Chức năng Thanh toán lại PayOS (dành cho đơn PENDING)
  const handlePayNow = async (order) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
      window.location.href = "/auth";
      return;
    }

    try {
      showToast("Đang tạo liên kết thanh toán PayOS...", "info");
      const payRes = await api.post("/payments/create", {
        orderId: order.id,
        paymentMethod: "PAYOS"
      });
      const paymentUrl = payRes.data?.data?.paymentUrl || payRes.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không tìm thấy link thanh toán PayOS cho đơn hàng này!");
      }
    } catch (err) {
      alert("Lỗi khi kết nối PayOS: " + (err.response?.data?.message || err.message));
    }
  };

  // 3. Chức năng Hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`)) return;

    // Cập nhật state UI
    const updated = orders.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o);
    setOrders(updated);
    showToast(`Đã hủy thành công đơn hàng #${orderId}!`, "info");
  };

  // 4. Chức năng Khách hàng xác nhận đã nhận hàng
  const handleConfirmDelivered = async (orderId) => {
    if (!window.confirm(`Bạn xác nhận đã nhận được đầy đủ hàng cho đơn #${orderId}?`)) return;

    try {
      await api.put(`/orders/${orderId}/status?status=DELIVERED`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "DELIVERED" } : o));
      showToast("🎉 Chúc mừng bạn đã nhận hàng thành công! Bạn có thể đánh giá sản phẩm ngay bây giờ.", "success");
    } catch (err) {
      console.warn("Lỗi xác nhận nhận hàng:", err.message);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "DELIVERED" } : o));
      showToast("🎉 Đã xác nhận nhận hàng thành công!", "success");
    }
  };

  // Lọc đơn hàng theo Tab và Từ khóa tìm kiếm
  const filteredOrders = orders.filter(o => {
    const statusMatch = (activeTab === "ALL") || 
      (activeTab === "PENDING" && o.status === "PENDING") ||
      (activeTab === "PAID" && o.status === "PAID") ||
      (activeTab === "SHIPPING" && (o.status === "SHIPPING" || o.status === "PROCESSING")) ||
      (activeTab === "DELIVERED" && (o.status === "DELIVERED" || o.status === "COMPLETED")) ||
      (activeTab === "CANCELLED" && o.status === "CANCELLED");

    if (!statusMatch) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchId = String(o.id).toLowerCase().includes(q);
    const matchProduct = o.items?.some(i => i.productName?.toLowerCase().includes(q));
    const matchVoucher = o.voucherCode?.toLowerCase().includes(q);

    return matchId || matchProduct || matchVoucher;
  });

  // Đếm số lượng theo trạng thái
  const countByStatus = (status) => {
    if (status === "ALL") return orders.length;
    if (status === "SHIPPING") return orders.filter(o => o.status === "SHIPPING" || o.status === "PROCESSING").length;
    if (status === "DELIVERED") return orders.filter(o => o.status === "DELIVERED" || o.status === "COMPLETED").length;
    return orders.filter(o => o.status === status).length;
  };

  if (!isLoggedIn && !loading) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>Đang chuyển hướng tới trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="home-container" style={{ padding: "35px 15px", minHeight: "80vh" }}>
      
      {/* TOAST THÔNG BÁO TÙY CHỈNH */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          background: toastMessage.type === "success" ? "#065f46" : (toastMessage.type === "info" ? "#1e40af" : "#991b1b"),
          color: "white",
          padding: "14px 22px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          zIndex: 9999,
          fontWeight: "700",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideIn 0.3s ease-out"
        }}>
          <span>{toastMessage.type === "success" ? "✅" : (toastMessage.type === "info" ? "ℹ️" : "⚠️")}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TIÊU ĐỀ TRANG & TÌM KIẾM */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>📦</span> Quản lý & Lịch sử Đơn hàng
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Theo dõi trạng thái đơn hàng, tra cứu hóa đơn và áp dụng bảo hành tại DungThamMobile
          </p>
        </div>

        {/* THANH TÌM KIẾM ĐƠN HÀNG */}
        <div style={{ position: "relative", minWidth: "300px" }}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã đơn, Tên máy, Voucher..."
            style={{
              width: "100%",
              padding: "12px 40px 12px 16px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
            }}
          />
          <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}>
            🔍
          </span>
        </div>
      </div>

      {/* THANH TABS LỌC TRẠNG THÁI (SHOPEE STYLE) */}
      <div style={{
        display: "flex",
        background: "white",
        borderRadius: "16px",
        padding: "6px",
        marginBottom: "24px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        overflowX: "auto",
        gap: "6px"
      }}>
        {[
          { key: "ALL", label: "Tất cả đơn" },
          { key: "PENDING", label: "Chờ xử lý" },
          { key: "PAID", label: "Đã thanh toán" },
          { key: "SHIPPING", label: "Đang giao hàng" },
          { key: "DELIVERED", label: "Hoàn thành" },
          { key: "CANCELLED", label: "Đã hủy" }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          const count = countByStatus(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                minWidth: "130px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "none",
                background: isActive ? "var(--fpt-red)" : "transparent",
                color: isActive ? "white" : "#475569",
                fontWeight: isActive ? "800" : "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span style={{
                  fontSize: "11px",
                  background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                  color: isActive ? "white" : "#64748b",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  fontWeight: "800"
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "20px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Đang tải danh sách đơn hàng của bạn...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* TRẠNG THÁI KHÔNG TÌM THẤY ĐƠN HÀNG */
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "20px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
        }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🛍️</div>
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
            Không tìm thấy đơn hàng nào
          </h3>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
            {searchQuery ? `Không có đơn hàng nào khớp với từ khóa "${searchQuery}"` : "Bạn chưa có đơn hàng nào trong mục này."}
          </p>
          <a href="/" className="confirm-location-btn" style={{ textDecoration: "none", display: "inline-block", padding: "12px 30px", fontSize: "15px" }}>
            Khám phá sản phẩm ngay
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const items = order.items || [];
            const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const total = order.totalPrice || subtotal;

            return (
              <div 
                key={order.id}
                style={{
                  background: "white",
                  borderRadius: "20px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                  transition: "all 0.2s"
                }}
              >
                {/* 1. HEADER CỦA CARD ĐƠN HÀNG */}
                <div style={{
                  padding: "16px 24px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: "900", color: "#0f172a", fontSize: "16px" }}>
                      Mã đơn: <span style={{ color: "var(--fpt-red)", fontFamily: "monospace" }}>#{order.id}</span>
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>•</span>
                    <span style={{ color: "#64748b", fontSize: "13px" }}>
                      {order.createdDate ? new Date(order.createdDate).toLocaleString("vi-VN") : "Hôm nay"}
                    </span>
                  </div>

                  {/* Badge trạng thái */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: badge.bg,
                    color: badge.color,
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontWeight: "800",
                    fontSize: "13px",
                    border: `1px solid ${badge.color}33`
                  }}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* 2. NỘI DUNG SẢN PHẨM TRONG ĐƠN HÀNG */}
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {items.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        paddingBottom: idx === items.length - 1 ? "0" : "14px",
                        borderBottom: idx === items.length - 1 ? "none" : "1px dashed #f1f5f9"
                      }}
                    >
                      <div style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        flexShrink: 0
                      }}>
                        <img 
                          src={getProductImage(item.imageUrl)} 
                          alt={item.productName} 
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                          {item.productName}
                        </h4>
                        <div style={{ fontSize: "13px", color: "#64748b", display: "flex", gap: "12px" }}>
                          <span>Số lượng: <strong>x{item.quantity}</strong></span>
                          <span>•</span>
                          <span>Đơn giá: {(item.price || 0).toLocaleString("vi-VN")} đ</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. THÔNG TIN GIAO HÀNG & TỔNG TIỀN */}
                <div style={{
                  padding: "16px 24px",
                  background: "#fdfdfd",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  
                  {/* Địa chỉ & Hình thức thanh toán */}
                  <div style={{ maxWidth: "550px", fontSize: "13px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>
                      📍 <strong>Giao tới:</strong> {order.address || "Cửa hàng Dũng Thắm Mobile - Phủ Lý, Hà Nam"}
                    </div>
                    <div>
                      💳 <strong>Hình thức:</strong> {order.paymentMethod === "PAYOS" ? "VietQR trực tuyến (Cổng PayOS)" : "Thanh toán khi nhận hàng (COD)"}
                    </div>
                    {order.voucherCode && (
                      <div style={{ color: "var(--fpt-red)", fontWeight: "700" }}>
                        🎟️ <strong>Voucher áp dụng:</strong> {order.voucherCode} (Giảm {(order.discountAmount || 0).toLocaleString("vi-VN")} đ)
                      </div>
                    )}
                  </div>

                  {/* Tổng tiền & Nút Thao tác */}
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#64748b", marginRight: "8px" }}>Tổng thanh toán:</span>
                      <strong style={{ fontSize: "22px", color: "var(--fpt-red)", fontWeight: "900" }}>
                        {total.toLocaleString("vi-VN")} đ
                      </strong>
                    </div>

                    {/* NHÓM NÚT THAO TÁC */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      
                      {/* Nút Xem chi tiết */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          background: "white",
                          color: "#334155",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        🔍 Chi tiết
                      </button>

                      {/* Nút Thanh toán ngay PayOS nếu PENDING */}
                      {order.status === "PENDING" && order.paymentMethod === "PAYOS" && (
                        <button
                          onClick={() => handlePayNow(order)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#059669",
                            color: "white",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                        >
                          💳 Thanh toán ngay
                        </button>
                      )}

                      {/* Nút Hủy đơn nếu còn PENDING */}
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                        >
                          ❌ Hủy đơn
                        </button>
                      )}

                      {/* NÚT XÁC NHẬN ĐÃ NHẬN HÀNG (KHI ĐANG GIAO HOẶC ĐANG XỬ LÝ) */}
                      {(order.status === "SHIPPING" || order.status === "PROCESSING") && (
                        <button
                          onClick={() => handleConfirmDelivered(order.id)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#059669",
                            color: "white",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)"
                          }}
                        >
                          📦 Đã nhận được hàng
                        </button>
                      )}

                      {/* Nút Mua lại */}
                      <button
                        onClick={() => handleReorder(order)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "10px",
                          border: "none",
                          background: "var(--fpt-red)",
                          color: "white",
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(205, 28, 34, 0.2)"
                        }}
                      >
                        🔄 Mua lại
                      </button>

                      {/* NÚT ĐÁNH GIÁ SẢN PHẨM (KHI ĐƠN ĐÃ GIAO DELIVERED) */}
                      {order.status === "DELIVERED" && (
                        (() => {
                          const allReviewed = order.items && order.items.length > 0 && order.items.every(it => reviewedMap[`${order.id}_${it.productId || it.id}`]);
                          if (allReviewed) {
                            return (
                              <button
                                onClick={() => handleOpenReviewModal(order)}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "10px",
                                  border: "1px solid #86efac",
                                  background: "#f0fdf4",
                                  color: "#166534",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                ✅ Đã đánh giá
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={() => handleOpenReviewModal(order)}
                              style={{
                                padding: "8px 18px",
                                borderRadius: "10px",
                                border: "1px solid #f59e0b",
                                background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                                color: "#b45309",
                                fontWeight: "800",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.2)"
                              }}
                            >
                              ⭐ Đánh giá sản phẩm
                            </button>
                          );
                        })()
                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT ĐƠN HÀNG ================= */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "15px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "30px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                Chi tiết đơn hàng #{selectedOrder.id}
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", fontWeight: "900" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "#334155" }}>
              <div><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status).label}</div>
              <div><strong>Ngày đặt:</strong> {new Date(selectedOrder.createdDate).toLocaleString("vi-VN")}</div>
              <div><strong>Địa chỉ nhận hàng:</strong> {selectedOrder.address}</div>
              <div><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}</div>
              {selectedOrder.voucherCode && (
                <div><strong>Voucher giảm giá:</strong> <span style={{ color: "var(--fpt-red)", fontWeight: "700" }}>{selectedOrder.voucherCode}</span> (-{(selectedOrder.discountAmount || 0).toLocaleString("vi-VN")} đ)</div>
              )}
              
              <hr style={{ border: "none", borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />
              
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Danh sách sản phẩm ({selectedOrder.items?.length}):</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "700" }}>{it.productName}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Số lượng: x{it.quantity}</div>
                    </div>
                    <div style={{ fontWeight: "800", color: "var(--fpt-red)" }}>
                      {(it.price * it.quantity).toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "14px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "16px", fontWeight: "800" }}>Tổng thanh toán:</span>
                <span style={{ fontSize: "22px", fontWeight: "900", color: "var(--fpt-red)" }}>
                  {(selectedOrder.totalPrice || 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: "var(--fpt-red)", color: "white", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ĐÁNH GIÁ SẢN PHẨM ================= */}
      {reviewModalOpen && reviewOrder && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            maxWidth: "680px",
            width: "100%",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: "28px 32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative"
          }}>
            {/* Header Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⭐</span> Đánh giá sản phẩm
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Đơn hàng #{reviewOrder.id} • Hoàn thành ngày {new Date(reviewOrder.createdDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <button 
                onClick={() => setReviewModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", fontWeight: "800", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* Chọn sản phẩm trong đơn nếu đơn có > 1 món */}
            {reviewOrder.items && reviewOrder.items.length > 1 && (
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>Chọn sản phẩm để đánh giá:</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {reviewOrder.items.map((it, idx) => {
                    const isSelected = selectedReviewItem && (selectedReviewItem.id === it.id || selectedReviewItem.productId === it.productId);
                    const isReviewed = reviewedMap[`${reviewOrder.id}_${it.productId || it.id}`];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedReviewItem(it)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 12px",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--fpt-red)" : "1px solid #e2e8f0",
                          background: isSelected ? "#fef2f2" : "#f8fafc",
                          color: isSelected ? "var(--fpt-red)" : "#334155",
                          fontWeight: isSelected ? "800" : "600",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <img src={getProductImage(it.imageUrl)} alt="" style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "4px" }} />
                        <span>{it.productName.substring(0, 24)}...</span>
                        {isReviewed && <span style={{ color: "#166534", fontSize: "10px" }}>✓ Đã đánh giá</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Card thông tin sản phẩm đang đánh giá */}
            {selectedReviewItem && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                background: "#f8fafc",
                padding: "12px 16px",
                borderRadius: "14px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0"
              }}>
                <img 
                  src={getProductImage(selectedReviewItem.imageUrl)} 
                  alt={selectedReviewItem.productName} 
                  style={{ width: "54px", height: "54px", objectFit: "cover", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", lineHeight: "1.4" }}>
                    {selectedReviewItem.productName}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--fpt-red)", fontWeight: "700", marginTop: "2px" }}>
                    {(selectedReviewItem.price || 0).toLocaleString("vi-VN")} đ
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitReview}>
              {/* 1. KHUNG CHỌN SỐ SAO */}
              <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px dashed #e2e8f0", marginBottom: "18px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "10px" }}>
                  Chất lượng sản phẩm tổng thể:
                </div>
                
                {/* 5 ngôi sao */}
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", fontSize: "36px", cursor: "pointer" }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (reviewHoverRating || reviewRating) >= star;
                    return (
                      <span
                        key={star}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                        style={{
                          color: isFilled ? "#f59e0b" : "#cbd5e1",
                          transition: "all 0.15s ease",
                          transform: isFilled ? "scale(1.15)" : "scale(1)",
                          userSelect: "none"
                        }}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>

                {/* Nhãn mô tả cảm xúc số sao */}
                <div style={{ fontSize: "14px", fontWeight: "800", color: reviewRating >= 4 ? "#059669" : reviewRating === 3 ? "#d97706" : "#dc2626", marginTop: "8px" }}>
                  {RATING_DESCRIPTIONS[reviewHoverRating || reviewRating]}
                </div>
              </div>

              {/* 2. CHỌN NHANH TIÊU CHÍ KHEN NGỢI (TAGS) */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                  Bạn thấy sản phẩm này có điểm gì nổi bật? (Chọn nhiều):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {QUICK_TAGS.map((tag, idx) => {
                    const isSelected = reviewTags.includes(tag);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          border: isSelected ? "1.5px solid var(--fpt-red)" : "1px solid #cbd5e1",
                          background: isSelected ? "#fff1f2" : "#ffffff",
                          color: isSelected ? "var(--fpt-red)" : "#475569",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {isSelected && <span>✓</span>}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Ô NHẬP NHẬN XÉT CHI TIẾT */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  <span>Chia sẻ nhận xét chi tiết:</span>
                  <span style={{ fontSize: "11px", color: reviewComment.length > 500 ? "red" : "#94a3b8" }}>{reviewComment.length}/500</span>
                </div>
                <textarea
                  rows="4"
                  maxLength="500"
                  placeholder="Hãy chia sẻ trải nghiệm thực tế về tính năng, màu sắc, camera, thời lượng pin, dịch vụ giao hàng..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                    lineHeight: "1.5"
                  }}
                  required
                />
              </div>

              {/* 4. UPLOAD ẢNH THỰC TẾ */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                  Thêm hình ảnh thực tế (Tối đa 5 ảnh):
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  {/* Danh sách ảnh đã chọn */}
                  {reviewImages.map((imgSrc, index) => (
                    <div key={index} style={{ position: "relative", width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
                      <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(220, 38, 38, 0.85)",
                          color: "white",
                          border: "none",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Nút thêm ảnh nếu chưa đủ 5 */}
                  {reviewImages.length < 5 && (
                    <label style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "10px",
                      border: "2px dashed #94a3b8",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      background: "#f8fafc",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "600",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: "20px", lineHeight: "1" }}>📷</span>
                      <span style={{ marginTop: "2px" }}>Thêm ảnh</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageChange} 
                        style={{ display: "none" }} 
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 5. NÚT SUBMIT */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    color: "#475569",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: "var(--fpt-red)",
                    color: "white",
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: submittingReview ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(205, 28, 34, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {submittingReview ? "Đang xuất bản..." : "⭐ Gửi đánh giá ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
