"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/app/lib/api";

// Danh sách voucher mặc định (đầy đủ các mức ưu đãi để luôn hiển thị mượt mà)
const DEFAULT_VOUCHERS = [
  {
    id: 1,
    code: "WELCOME50K",
    discountAmount: 50000,
    maxDiscountAmount: 50000,
    minOrderValue: 500000,
    minMembershipTier: "BRONZE",
    description: "Giảm 50.000đ cho đơn hàng từ 500.000đ dành cho khách hàng mới",
    usageLimit: 1000,
    usedCount: 15,
    isActive: true,
    validTo: "2026-12-31T23:59:59"
  },
  {
    id: 2,
    code: "FREESHIP30K",
    discountAmount: 30000,
    maxDiscountAmount: 30000,
    minOrderValue: 300000,
    minMembershipTier: "BRONZE",
    description: "Miễn phí vận chuyển 30.000đ cho đơn hàng từ 300.000đ",
    usageLimit: 500,
    usedCount: 42,
    isActive: true,
    validTo: "2026-12-31T23:59:59"
  },
  {
    id: 3,
    code: "GIAM100K",
    discountAmount: 100000,
    maxDiscountAmount: 100000,
    minOrderValue: 2000000,
    minMembershipTier: "BRONZE",
    description: "Giảm ngay 100.000đ cho đơn hàng công nghệ từ 2.000.000đ",
    usageLimit: 300,
    usedCount: 88,
    isActive: true,
    validTo: "2026-12-31T23:59:59"
  },
  {
    id: 4,
    code: "VIPGOLD500K",
    discountAmount: 500000,
    maxDiscountAmount: 500000,
    minOrderValue: 10000000,
    minMembershipTier: "GOLD",
    description: "Đặc quyền Hội viên GOLD: Giảm 500.000đ cho đơn từ 10.000.000đ",
    usageLimit: 100,
    usedCount: 21,
    isActive: true,
    validTo: "2026-12-31T23:59:59"
  },
  {
    id: 5,
    code: "PLATINUM1TR",
    discountAmount: 1000000,
    maxDiscountAmount: 1000000,
    minOrderValue: 20000000,
    minMembershipTier: "PLATINUM",
    description: "Đặc quyền Hội viên PLATINUM: Giảm 1.000.000đ cho đơn từ 20.000.000đ",
    usageLimit: 50,
    usedCount: 8,
    isActive: true,
    validTo: "2026-12-31T23:59:59"
  }
];

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Thông tin người nhận & Địa chỉ
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Số 123 Phố Phủ Lý, Phường Minh Khai, Thành phố Phủ Lý, Hà Nam");
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Thông tin hạng thành viên người dùng
  const [membershipTier, setMembershipTier] = useState("BRONZE");

  // Yêu cầu đặc biệt
  const [installSupport, setInstallSupport] = useState(false);
  const [otherPerson, setOtherPerson] = useState(false);
  const [techSupport, setTechSupport] = useState(false);
  const [otherNote, setOtherNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Hóa đơn VAT
  const [vatInvoice, setVatInvoice] = useState(false);

  // Phương thức thanh toán: COD | PAYOS
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");

  // Danh sách Voucher & Quản lý chọn Voucher
  const [vouchers, setVouchers] = useState(DEFAULT_VOUCHERS);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [manualCodeMessage, setManualCodeMessage] = useState(null); // { type: 'success'|'error', text: '' }

  useEffect(() => {
    // 1. Kiểm tra PayOS / Cổng thanh toán callback quay lại URL
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get("status");
      const code = urlParams.get("code");
      const orderCode = urlParams.get("orderCode");
      const cancel = urlParams.get("cancel");

      if (status || code || cancel) {
        const isSuccess = status === "PAID" || code === "00";
        const savedOrderStr = localStorage.getItem("pending_payos_order");
        let savedInfo = null;
        if (savedOrderStr) {
          try { savedInfo = JSON.parse(savedOrderStr); } catch (e) {}
        }

        setCreatedOrder({
          orderId: savedInfo?.orderId || orderCode || `ORD-${Date.now().toString().slice(-8)}`,
          fullName: savedInfo?.fullName || localStorage.getItem("username") || "Khách hàng",
          phone: savedInfo?.phone || "0967233789",
          address: savedInfo?.address || "Hà Nam",
          total: savedInfo?.total || 0,
          paymentMethod: isSuccess ? "Thanh toán qua PayOS - VietQR (Thành công ✅)" : "Thanh toán qua PayOS (Thất bại hoặc Đã hủy ❌)",
          isSuccess: isSuccess
        });

        localStorage.removeItem("dtm_cart_items");
        localStorage.removeItem("pending_payos_order");
        api.delete("/cart").catch(clearErr => {
          console.warn("Lỗi xóa giỏ hàng server khi return PayOS:", clearErr.message);
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart_updated"));
        }
        setOrderComplete(true);
        setLoading(false);
        return;
      }
    }

    loadCheckoutData();
    fetchActiveVouchers();
  }, []);

  const loadCheckoutData = async () => {
    setLoading(true);
    let items = [];
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("username") || "Khách hàng";
      setFullName(savedUser);
      setPhone("0967233789");

      const savedLocation = localStorage.getItem("user_selected_location");
      if (savedLocation) {
        setAddress(savedLocation);
      }

      // Đọc giỏ hàng từ localStorage
      try {
        const localData = localStorage.getItem("dtm_cart_items");
        if (localData) {
          items = JSON.parse(localData);
        }
      } catch (e) {
        console.error("Lỗi đọc cart local: ", e);
      }

      // Lấy thông tin user chi tiết từ Backend (nếu có token)
      const token = localStorage.getItem("accessToken");
      const validToken = token && token !== "null" && token !== "undefined" ? token : null;
      if (validToken) {
        try {
          const userRes = await api.get("/users/me");
          if (userRes.data?.data) {
            const userData = userRes.data.data;
            if (userData.fullName) setFullName(userData.fullName);
            if (userData.phone) setPhone(userData.phone);
            if (userData.address) setAddress(userData.address);
            if (userData.membershipTier) setMembershipTier(userData.membershipTier);
          }
        } catch (err) {
          // Bỏ qua nếu chưa có API user profile hoặc token hết hạn
        }
      }
    }
    setCartItems(items);
    setLoading(false);
  };

  // Lấy danh sách Voucher khả dụng từ Backend
  const fetchActiveVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const res = await api.get("/promotions/active");
      const backendVouchers = res.data?.data;
      if (Array.isArray(backendVouchers) && backendVouchers.length > 0) {
        setVouchers(backendVouchers);
      } else {
        setVouchers(DEFAULT_VOUCHERS);
      }
    } catch (err) {
      console.warn("Không thể tải voucher từ backend, sử dụng danh sách voucher hệ thống:", err.message);
      setVouchers(DEFAULT_VOUCHERS);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const getProductImage = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://localhost:9000/products/${url.replace(/^\/+/, "")}`;
  };

  // Trọng số hạng thành viên
  const getTierWeight = (tier) => {
    if (!tier) return 0;
    switch (tier.toUpperCase()) {
      case "BRONZE": return 0;
      case "SILVER": return 1;
      case "GOLD": return 2;
      case "PLATINUM": return 3;
      default: return 0;
    }
  };

  // Tên hiển thị của hạng thành viên
  const getTierBadge = (tier) => {
    const t = (tier || "BRONZE").toUpperCase();
    switch (t) {
      case "PLATINUM": return { label: "💎 Kim Cương (Platinum)", color: "#0284c7", bg: "#e0f2fe" };
      case "GOLD": return { label: "🥇 Vàng (Gold)", color: "#b45309", bg: "#fef3c7" };
      case "SILVER": return { label: "🥈 Bạc (Silver)", color: "#475569", bg: "#f1f5f9" };
      default: return { label: "🥉 Đồng (Bronze)", color: "#854d0e", bg: "#fef9c3" };
    }
  };

  // Tính toán số tiền
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const originalSubtotal = cartItems.reduce((acc, item) => acc + (Math.round(item.price * 1.35) * item.quantity), 0);

  // Tính số tiền giảm giá từ Voucher được chọn
  let voucherDiscount = 0;
  if (selectedVoucher) {
    const discAmount = selectedVoucher.discountAmount || 0;
    const maxDisc = selectedVoucher.maxDiscountAmount || discAmount;
    voucherDiscount = Math.min(discAmount, maxDisc, subtotal);
  }

  const finalTotal = Math.max(subtotal - voucherDiscount, 0);
  const totalSavings = (originalSubtotal - subtotal) + voucherDiscount;
  const rewardPoints = Math.round(finalTotal / 4000);

  // Kiểm tra điều kiện áp dụng của 1 voucher
  const checkVoucherEligibility = (v) => {
    const minOrder = v.minOrderValue || 0;
    const isMinOrderOk = subtotal >= minOrder;
    const userTierWeight = getTierWeight(membershipTier);
    const voucherTierWeight = getTierWeight(v.minMembershipTier);
    const isTierOk = userTierWeight >= voucherTierWeight;
    const isLimitOk = v.usageLimit ? (v.usedCount < v.usageLimit) : true;

    const isEligible = isMinOrderOk && isTierOk && isLimitOk;

    let reason = "";
    if (!isMinOrderOk) {
      const diff = minOrder - subtotal;
      reason = `Chưa đủ đơn hàng tối thiểu (Cần mua thêm ${diff.toLocaleString("vi-VN")} đ)`;
    } else if (!isTierOk) {
      reason = `Yêu cầu hạng ${v.minMembershipTier} trở lên (Hạng hiện tại: ${membershipTier})`;
    } else if (!isLimitOk) {
      reason = "Mã voucher đã hết lượt sử dụng";
    }

    return { isEligible, isMinOrderOk, isTierOk, isLimitOk, reason };
  };

  // Chọn / Bỏ chọn Voucher
  const handleToggleVoucher = (v) => {
    const { isEligible, reason } = checkVoucherEligibility(v);
    if (!isEligible) {
      alert(`Không thể áp dụng mã [${v.code}]:\n${reason}`);
      return;
    }

    if (selectedVoucher?.code === v.code) {
      setSelectedVoucher(null);
      setManualCodeMessage({ type: "info", text: `Đã hủy chọn mã voucher ${v.code}` });
    } else {
      setSelectedVoucher(v);
      setManualCodeMessage({ type: "success", text: `Đã áp dụng thành công mã voucher: ${v.code} (-${(v.discountAmount || 0).toLocaleString("vi-VN")}đ)` });
    }
  };

  // Áp dụng mã Voucher thủ công do người dùng gõ
  const handleApplyManualCode = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setManualCodeMessage({ type: "error", text: "Vui lòng nhập mã voucher!" });
      return;
    }

    const codeUpper = manualCode.trim().toUpperCase();
    const found = vouchers.find(v => v.code?.toUpperCase() === codeUpper);

    if (!found) {
      setManualCodeMessage({ type: "error", text: `Mã giảm giá "${codeUpper}" không tồn tại trên hệ thống!` });
      return;
    }

    const { isEligible, reason } = checkVoucherEligibility(found);
    if (!isEligible) {
      setManualCodeMessage({ type: "error", text: `Mã "${codeUpper}" không đủ điều kiện: ${reason}` });
      return;
    }

    setSelectedVoucher(found);
    setManualCodeMessage({ type: "success", text: `Áp dụng thành công mã ${codeUpper}! Giảm ${(found.discountAmount || 0).toLocaleString("vi-VN")} đ` });
    setManualCode("");
  };

  // Xử lý XÁC NHẬN ĐẶT HÀNG
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      window.location.href = "/";
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!");
      return;
    }

    const token = localStorage.getItem("accessToken");
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;

    if (paymentMethod === "PAYOS" && !validToken) {
      alert("Vui lòng đăng nhập để thanh toán trực tuyến qua Cổng PayOS!");
      window.location.href = "/auth";
      return;
    }

    setSubmitting(true);

    // Chuẩn bị payload đơn hàng kèm voucherCode
    const orderPayload = {
      orderItems: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      address: `${address} (Người nhận: ${fullName} - ${phone})`,
      paymentMethod: paymentMethod,
      voucherCode: selectedVoucher ? selectedVoucher.code : null,
      note: noteText || (installSupport ? "Hỗ trợ lắp đặt" : "")
    };

    let orderId = `ORD-${Date.now().toString().slice(-8)}`;

    // 1. Gọi Order Service tạo đơn hàng
    if (validToken) {
      try {
        const res = await api.post("/orders", orderPayload);
        if (res.data?.data?.id || res.data?.data?.orderId) {
          orderId = res.data.data.id || res.data.data.orderId;
        }
      } catch (e) {
        console.error("Lỗi khi tạo đơn hàng:", e);
        const errMsg = e.response?.data?.message || e.message;
        alert(`Lỗi khi tạo đơn hàng: ${errMsg}`);
        setSubmitting(false);
        return;
      }
    }

    // 2. XỬ LÝ THANH TOÁN QUA CỔNG PAYOS
    if (paymentMethod === "PAYOS") {
      let targetPaymentUrl = null;

      if (validToken) {
        try {
          const payRes = await api.post("/payments/create", {
            orderId: orderId,
            paymentMethod: "PAYOS"
          });
          targetPaymentUrl = payRes.data?.data?.paymentUrl || payRes.data?.paymentUrl;
        } catch (payErr) {
          console.error("Lỗi khi tạo link thanh toán PayOS:", payErr);
          const errorMsg = payErr.response?.data?.message || payErr.message || "Không thể kết nối đến Cổng thanh toán PayOS";
          alert(`Lỗi tạo thanh toán PayOS: ${errorMsg}`);
          setSubmitting(false);
          return;
        }
      }

      if (targetPaymentUrl) {
        localStorage.setItem("pending_payos_order", JSON.stringify({
          orderId: orderId,
          fullName: fullName,
          phone: phone,
          address: address,
          total: finalTotal,
          voucherCode: selectedVoucher?.code || null
        }));

        localStorage.removeItem("dtm_cart_items");
        try {
          await api.delete("/cart");
        } catch (clearErr) {
          console.warn("Lỗi xóa giỏ hàng server:", clearErr.message);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart_updated"));
        }

        window.location.href = targetPaymentUrl;
        return;
      }
    }

    // 3. THANH TOÁN KHI NHẬN HÀNG (COD)
    localStorage.removeItem("dtm_cart_items");
    try {
      await api.delete("/cart");
    } catch (clearErr) {
      console.warn("Lỗi xóa giỏ hàng server COD:", clearErr.message);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart_updated"));
    }

    setCreatedOrder({
      orderId: orderId,
      fullName: fullName,
      phone: phone,
      address: address,
      total: finalTotal,
      voucherCode: selectedVoucher?.code || null,
      voucherDiscount: voucherDiscount,
      paymentMethod: "Thanh toán khi nhận hàng (COD)",
      isSuccess: true
    });
    setOrderComplete(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>Đang tải thông tin thanh toán DungThamMobile...</p>
      </div>
    );
  }

  if (orderComplete && createdOrder) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <div style={{ background: "white", padding: "40px 32px", borderRadius: "24px", maxWidth: "650px", margin: "0 auto", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>{createdOrder.isSuccess ? "🎉" : "⚠️"}</div>
          <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>
            {createdOrder.isSuccess ? "Đặt hàng & Thanh toán thành công!" : "Thông báo đơn hàng"}
          </h2>
          <p style={{ fontSize: "16px", color: "#475569", marginBottom: "20px" }}>
            Mã đơn hàng: <strong style={{ color: "var(--fpt-red)" }}>#{createdOrder.orderId}</strong>
          </p>

          <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px", textAlign: "left", marginBottom: "24px", fontSize: "15px", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid #e2e8f0" }}>
            <div><strong>Người nhận:</strong> {createdOrder.fullName} ({createdOrder.phone})</div>
            <div><strong>Địa chỉ:</strong> {createdOrder.address}</div>
            {createdOrder.voucherCode && (
              <div><strong>Voucher đã áp dụng:</strong> <span style={{ background: "#fee2e2", color: "var(--fpt-red)", padding: "3px 10px", borderRadius: "6px", fontWeight: "700" }}>{createdOrder.voucherCode}</span> (Giảm {(createdOrder.voucherDiscount || 0).toLocaleString("vi-VN")} đ)</div>
            )}
            <div><strong>Hình thức thanh toán:</strong> {createdOrder.paymentMethod}</div>
            <div><strong>Tổng thanh toán:</strong> <strong style={{ color: "var(--fpt-red)", fontSize: "20px" }}>{createdOrder.total.toLocaleString("vi-VN")} đ</strong></div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/orders" style={{
              textDecoration: "none",
              display: "inline-block",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: "800",
              background: "var(--fpt-red)",
              color: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(205, 28, 34, 0.25)"
            }}>
              📦 Xem đơn hàng của tôi
            </a>
            <a href="/" className="confirm-location-btn" style={{ textDecoration: "none", display: "inline-block", padding: "14px 28px", fontSize: "15px" }}>
              Quay về Trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  const userBadgeInfo = getTierBadge(membershipTier);

  return (
    <div className="home-container" style={{ padding: "35px 15px" }}>
      
      {/* TIÊU ĐỀ TRANG THANH TOÁN */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>
            🛒 Xác nhận & Tiến hành thanh toán
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Vui lòng kiểm tra thông tin đơn hàng, chọn mã giảm giá voucher và phương thức thanh toán
          </p>
        </div>

        {/* THẺ HẠNG THÀNH VIÊN CỦA KHÁCH HÀNG */}
        <div style={{ background: userBadgeInfo.bg, color: userBadgeInfo.color, padding: "8px 16px", borderRadius: "20px", fontWeight: "800", fontSize: "14px", border: `1px solid ${userBadgeInfo.color}33`, display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Hạng thành viên:</span>
          <strong>{userBadgeInfo.label}</strong>
        </div>
      </div>

      {/* KHUNG THANH TOÁN CHIA 2 CỘT RÕ RÀNG */}
      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: "28px", alignItems: "start" }}>
        
        {/* ================= CỘT TRÁI (SẢN PHẨM, NGƯỜI NHẬN, ĐỊA CHỈ, PHƯƠNG THỨC THANH TOÁN) ================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* 1. SẢN PHẨM TRONG ĐƠN */}
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "18px" }}>
              📦 Sản phẩm trong đơn ({cartItems.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "14px", borderBottom: "1px dashed #e2e8f0" }}>
                  <div style={{ width: "68px", height: "68px", borderRadius: "12px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "6px" }}>
                    <img src={getProductImage(item.imageUrl)} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{item.name}</h3>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>Số lượng: x{item.quantity}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: "900", color: "var(--fpt-red)" }}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                    <div style={{ fontSize: "13px", color: "#94a3b8", textDecoration: "line-through" }}>
                      {(Math.round(item.price * 1.35) * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. THÔNG TIN NGƯỜI NHẬN */}
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", margin: 0 }}>👤 Người nhận hàng</h2>
              <button 
                onClick={() => setIsEditingUser(!isEditingUser)} 
                style={{ background: "transparent", border: "none", color: "var(--fpt-red)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
              >
                {isEditingUser ? "Xong" : "Thay đổi"}
              </button>
            </div>

            {isEditingUser ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  placeholder="Họ và tên người nhận"
                  style={{ padding: "12px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Số điện thoại"
                  style={{ padding: "12px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "14px", outline: "none" }}
                />
              </div>
            ) : (
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px 18px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{fullName || "Khách hàng"}</div>
                <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>📞 {phone || "0967233789"}</div>
              </div>
            )}
          </div>

          {/* 3. ĐỊA CHỈ NHẬN HÀNG */}
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>📍 Địa chỉ nhận hàng</h2>
            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                placeholder="Tỉnh/Thành phố, Phường Xã, Số nhà/Tên đường..."
                style={{
                  width: "100%",
                  padding: "14px 40px 14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none"
                }}
              />
              <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--fpt-red)" }}>
                📍
              </span>
            </div>
          </div>

          {/* 4. PHƯƠNG THỨC THANH TOÁN */}
          <div style={{ background: "white", borderRadius: "20px", padding: "26px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>💳 Phương thức thanh toán</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* PAYOS */}
              <label 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  border: paymentMethod === "PAYOS" ? "2px solid var(--fpt-red)" : "1px solid #cbd5e1",
                  background: paymentMethod === "PAYOS" ? "#fef2f2" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <input 
                  type="radio" 
                  name="payment_method" 
                  value="PAYOS" 
                  checked={paymentMethod === "PAYOS"} 
                  onChange={() => setPaymentMethod("PAYOS")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--fpt-red)" }}
                />
                <div style={{ background: "#059669", color: "white", padding: "5px 10px", borderRadius: "8px", fontWeight: "900", fontSize: "13px" }}>PayOS</div>
                <div>
                  <strong style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>Thanh toán trực tuyến VietQR (Cổng PayOS)</strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Quét mã QR tự động qua ứng dụng ngân hàng bất kỳ</span>
                </div>
              </label>

              {/* COD */}
              <label 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  border: paymentMethod === "COD" ? "2px solid var(--fpt-red)" : "1px solid #cbd5e1",
                  background: paymentMethod === "COD" ? "#fef2f2" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <input 
                  type="radio" 
                  name="payment_method" 
                  value="COD" 
                  checked={paymentMethod === "COD"} 
                  onChange={() => setPaymentMethod("COD")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--fpt-red)" }}
                />
                <div style={{ fontSize: "22px" }}>💵</div>
                <div>
                  <strong style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>Thanh toán khi nhận hàng (COD)</strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Nhận hàng và thanh toán tiền mặt trực tiếp cho shipper</span>
                </div>
              </label>

            </div>
          </div>

          {/* 5. YÊU CẦU ĐẶC BIỆT & VAT */}
          <div style={{ background: "white", borderRadius: "20px", padding: "20px 24px", border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>Ghi chú & Tùy chọn thêm</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "#334155" }}>
                <input type="checkbox" checked={installSupport} onChange={e => setInstallSupport(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                Hỗ trợ cài đặt máy
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "#334155" }}>
                <input type="checkbox" checked={vatInvoice} onChange={e => setVatInvoice(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                Xuất hóa đơn VAT
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "#334155" }}>
                <input type="checkbox" checked={otherNote} onChange={e => setOtherNote(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                Ghi chú riêng
              </label>
            </div>
            {otherNote && (
              <textarea 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Nhập yêu cầu riêng cho đơn hàng..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", height: "70px", outline: "none" }}
              />
            )}
          </div>

        </div>

        {/* ================= CỘT PHẢI (CỘT VOUCHER KHUYẾN MÃI + TỔNG TIỀN ĐƠN HÀNG) ================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "90px" }}>
          
          {/* =================== KHỐI VOUCHER / MÃ GIẢM GIÁ CHUYÊN BIỆT =================== */}
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 6px 24px rgba(0,0,0,0.04)" }}>
            
            {/* Header Voucher */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>🎟️</span>
                <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                  Mã giảm giá & Voucher
                </h2>
              </div>
              <span style={{ fontSize: "12px", background: "#fee2e2", color: "var(--fpt-red)", padding: "3px 8px", borderRadius: "12px", fontWeight: "800" }}>
                {vouchers.length} mã hiện có
              </span>
            </div>

            {/* Ô nhập mã Voucher thủ công */}
            <form onSubmit={handleApplyManualCode} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input 
                type="text" 
                value={manualCode}
                onChange={e => { setManualCode(e.target.value); setManualCodeMessage(null); }}
                placeholder="Nhập mã voucher (VD: GIAM50K)..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  outline: "none"
                }}
              />
              <button 
                type="submit"
                style={{
                  background: "var(--fpt-red)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                Áp dụng
              </button>
            </form>

            {/* Thông báo kết quả nhập mã */}
            {manualCodeMessage && (
              <div style={{
                marginBottom: "16px",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                background: manualCodeMessage.type === "success" ? "#ecfdf5" : (manualCodeMessage.type === "info" ? "#eff6ff" : "#fef2f2"),
                color: manualCodeMessage.type === "success" ? "#065f46" : (manualCodeMessage.type === "info" ? "#1e40af" : "#991b1b"),
                border: `1px solid ${manualCodeMessage.type === "success" ? "#a7f3d0" : (manualCodeMessage.type === "info" ? "#bfdbfe" : "#fecaca")}`
              }}>
                {manualCodeMessage.text}
              </div>
            )}

            {/* DANH SÁCH TẤT CẢ VOUCHER CỦA WEB */}
            <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
              {vouchers.map(v => {
                const { isEligible, reason } = checkVoucherEligibility(v);
                const isSelected = selectedVoucher?.code === v.code;
                const minOrder = v.minOrderValue || 0;

                return (
                  <div
                    key={v.id || v.code}
                    onClick={() => {
                      if (isEligible) handleToggleVoucher(v);
                    }}
                    style={{
                      position: "relative",
                      borderRadius: "14px",
                      padding: "14px 16px",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      // Voucher đủ điều kiện: SÁNG LÊN, BÓNG ĐỔ, ĐƯỢC CLICK
                      // Voucher không đủ điều kiện: MỜ ĐI, DISABLE, KHÔNG CLICK ĐƯỢC
                      background: isSelected 
                        ? "#fff5f5" 
                        : (isEligible ? "#ffffff" : "#f8fafc"),
                      border: isSelected 
                        ? "2px solid var(--fpt-red)" 
                        : (isEligible ? "1.5px solid #fecaca" : "1px dashed #cbd5e1"),
                      boxShadow: isSelected 
                        ? "0 6px 16px rgba(205, 28, 34, 0.15)" 
                        : (isEligible ? "0 4px 12px rgba(0,0,0,0.04)" : "none"),
                      opacity: isEligible ? 1 : 0.58,
                      cursor: isEligible ? "pointer" : "not-allowed",
                      transform: isSelected ? "scale(1.01)" : "none"
                    }}
                  >
                    {/* Hàng trên: Mã Voucher & Badge trạng thái */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontFamily: "monospace",
                          fontWeight: "900",
                          fontSize: "14px",
                          color: isEligible ? "var(--fpt-red)" : "#64748b",
                          background: isEligible ? "#fee2e2" : "#e2e8f0",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          letterSpacing: "0.5px"
                        }}>
                          {v.code}
                        </span>

                        {isSelected && (
                          <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#d1fae5", padding: "2px 8px", borderRadius: "10px" }}>
                            ✓ ĐANG CHỌN
                          </span>
                        )}
                      </div>

                      {/* Badge điều kiện */}
                      {isEligible ? (
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: "10px" }}>
                          ✨ Đủ điều kiện
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: "10px" }}>
                          🔒 Chưa đủ đk
                        </span>
                      )}
                    </div>

                    {/* Mức giảm giá & Mô tả */}
                    <div style={{ fontSize: "15px", fontWeight: "800", color: isEligible ? "#0f172a" : "#64748b", marginBottom: "4px" }}>
                      Giảm {(v.discountAmount || 0).toLocaleString("vi-VN")} đ
                    </div>

                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.4", marginBottom: "8px" }}>
                      {v.description || `Đơn hàng tối thiểu ${minOrder.toLocaleString("vi-VN")} đ`}
                    </div>

                    {/* Điều kiện cụ thể & Lý do nếu chưa đủ */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "11px", marginBottom: "8px" }}>
                      {minOrder > 0 && (
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                          Đơn từ: {minOrder.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                      {v.minMembershipTier && (
                        <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                          Hạng: {v.minMembershipTier}
                        </span>
                      )}
                      {v.validTo && (
                        <span style={{ color: "#94a3b8" }}>
                          HSD: {new Date(v.validTo).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>

                    {/* CẢNH BÁO LÝ DO NẾU KHÔNG ĐỦ ĐIỀU KIỆN */}
                    {!isEligible && (
                      <div style={{
                        background: "#fff1f2",
                        color: "#e11d48",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "4px"
                      }}>
                        <span>⚠️</span>
                        <span>{reason}</span>
                      </div>
                    )}

                    {/* NÚT HÀNH ĐỘNG DÀNH CHO VOUCHER ĐỦ ĐIỀU KIỆN */}
                    {isEligible && (
                      <div style={{ marginTop: "8px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVoucher(v);
                          }}
                          style={{
                            background: isSelected ? "#059669" : "var(--fpt-red)",
                            color: "white",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "800",
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          {isSelected ? "✓ Đã chọn (Bấm để hủy)" : "Áp dụng ngay"}
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>

          {/* =================== THÔNG TIN TỔNG CHI PHÍ & ĐẶT HÀNG =================== */}
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 6px 24px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              Tóm tắt đơn hàng
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px", fontSize: "14px", color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tổng giá niêm yết:</span>
                <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>{originalSubtotal.toLocaleString("vi-VN")} đ</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Giá bán trực tiếp:</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>

              {/* Giảm giá Voucher */}
              {selectedVoucher ? (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--fpt-red)", fontWeight: "700" }}>
                  <span>Voucher ({selectedVoucher.code}):</span>
                  <span>-{voucherDiscount.toLocaleString("vi-VN")} đ</span>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
                  <span>Mã giảm giá:</span>
                  <span>Chưa chọn</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Phí vận chuyển:</span>
                <span style={{ fontWeight: "700", color: "#059669" }}>MIỄN PHÍ</span>
              </div>
            </div>

            {/* Tổng cần thanh toán */}
            <div style={{ borderTop: "2px dashed #e2e8f0", paddingTop: "14px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Tổng thanh toán:</span>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "var(--fpt-red)" }}>
                {finalTotal.toLocaleString("vi-VN")} đ
              </span>
            </div>

            {totalSavings > 0 && (
              <div style={{ background: "#f0fdf4", color: "#166534", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", textAlign: "center", marginBottom: "16px" }}>
                🎉 Bạn tiết kiệm được tổng cộng {totalSavings.toLocaleString("vi-VN")} đ cho đơn hàng này!
              </div>
            )}

            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🪙 Điểm thưởng tích lũy:</span>
              <strong style={{ color: "#d97706", fontSize: "14px" }}>+{rewardPoints.toLocaleString()}</strong>
            </div>

            {/* NÚT XÁC NHẬN ĐẶT HÀNG */}
            <button 
              onClick={handlePlaceOrder}
              disabled={submitting}
              style={{
                width: "100%",
                backgroundColor: "var(--fpt-red)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "16px",
                fontSize: "17px",
                fontWeight: "900",
                cursor: submitting ? "wait" : "pointer",
                boxShadow: "0 6px 20px rgba(205, 28, 34, 0.3)",
                transition: "all 0.2s"
              }}
            >
              {submitting ? "Đang xử lý đơn hàng..." : "ĐẶT HÀNG & THANH TOÁN"}
            </button>

            <div style={{ marginTop: "12px", textAlign: "center", fontSize: "11px", color: "#94a3b8", lineHeight: "1.4" }}>
              Bằng việc nhấn đặt hàng, bạn đồng ý với Điều khoản mua hàng tại DungThamMobile.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
