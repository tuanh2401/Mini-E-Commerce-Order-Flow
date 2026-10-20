"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "@/app/lib/api";
import Link from "next/link";

// Thông số định mức và đặc quyền của 4 hạng thành viên
const TIER_CONFIG = {
  BRONZE: {
    name: "Đồng (Bronze)",
    code: "BRONZE",
    icon: "🥉",
    bgGradient: "linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)",
    cardBorder: "#d97706",
    textColor: "#fef3c7",
    badgeBg: "#fef9c3",
    badgeColor: "#854d0e",
    minSpent: 0,
    minOrders: 0,
    nextTier: "SILVER",
    nextThreshold: 2000000,
    nextOrdersThreshold: 5,
    cashbackRate: "0.5%",
    benefits: [
      "Tích lũy 0.5% điểm thưởng trên mọi đơn hàng",
      "Voucher chào mừng thành viên mới 50.000đ",
      "Bảo hành chính hãng 12 tháng tại DungThamMobile",
      "Nhận thông báo ưu đãi sớm qua SMS / Email"
    ]
  },
  SILVER: {
    name: "Bạc (Silver)",
    code: "SILVER",
    icon: "🥈",
    bgGradient: "linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)",
    cardBorder: "#94a3b8",
    textColor: "#f8fafc",
    badgeBg: "#f1f5f9",
    badgeColor: "#334155",
    minSpent: 2000000,
    minOrders: 5,
    nextTier: "GOLD",
    nextThreshold: 10000000,
    nextOrdersThreshold: 15,
    cashbackRate: "1.0%",
    benefits: [
      "Tích lũy 1.0% điểm thưởng trên mọi đơn hàng",
      "Miễn phí vận chuyển cho tất cả đơn từ 300.000đ",
      "Mã Voucher giảm 30.000đ - 100.000đ hàng tháng",
      "Ưu tiên hỗ trợ kỹ thuật và vệ sinh máy miễn phí"
    ]
  },
  GOLD: {
    name: "Vàng (Gold)",
    code: "GOLD",
    icon: "🥇",
    bgGradient: "linear-gradient(135deg, #854d0e 0%, #b45309 30%, #d97706 70%, #f59e0b 100%)",
    cardBorder: "#fbbf24",
    textColor: "#fffbeb",
    badgeBg: "#fef3c7",
    badgeColor: "#b45309",
    minSpent: 10000000,
    minOrders: 15,
    nextTier: "PLATINUM",
    nextThreshold: 30000000,
    nextOrdersThreshold: 30,
    cashbackRate: "2.0%",
    benefits: [
      "Tích lũy 2.0% điểm thưởng trên mọi đơn hàng",
      "Voucher độc quyền giảm 500.000đ cho đơn hàng từ 10tr",
      "Đổi trả 1-1 miễn phí trong 45 ngày đầu tiên",
      "Quà tặng tri ân đặc biệt vào tháng sinh nhật",
      "Ưu tiên xử lý đơn hàng và giao nhanh trong 2 giờ"
    ]
  },
  PLATINUM: {
    name: "Kim Cương (Platinum)",
    code: "PLATINUM",
    icon: "💎",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0369a1 80%, #0284c7 100%)",
    cardBorder: "#38bdf8",
    textColor: "#f0f9ff",
    badgeBg: "#e0f2fe",
    badgeColor: "#0369a1",
    minSpent: 30000000,
    minOrders: 30,
    nextTier: null,
    nextThreshold: 30000000,
    nextOrdersThreshold: 30,
    cashbackRate: "3.0%",
    benefits: [
      "Tích lũy 3.0% điểm thưởng cao nhất hệ thống",
      "Voucher VIP độc quyền giảm 1.000.000đ",
      "Chuyên viên chăm sóc khách hàng VIP 1-1 riêng",
      "Hỗ trợ cài đặt, sửa chữa và bảo hành tận nhà miễn phí",
      "Lời mời tham dự sự kiện ra mắt sản phẩm Flagship Apple / Samsung"
    ]
  }
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState("PROFILE"); // PROFILE | BENEFITS
  const [toastMessage, setToastMessage] = useState(null); // { type, text }

  // Thông tin người dùng
  const [userProfile, setUserProfile] = useState({
    id: 1,
    username: "",
    fullName: "Khách hàng",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
    totalSpent: 0,
    totalOrders: 0,
    membershipTier: "BRONZE",
    createdDate: null
  });

  // Form chỉnh sửa
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  // Modal xác thực Email
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showTierRulesModal, setShowTierRulesModal] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadProfile();
    const handleExpired = () => {
      setIsLoggedIn(false);
      window.location.href = "/auth";
    };
    window.addEventListener("session_expired", handleExpired);
    return () => {
      window.removeEventListener("session_expired", handleExpired);
    };
  }, []);

  // Countdown timer cho gửi lại OTP xác minh email
  useEffect(() => {
    let timer = null;
    if (showVerifyModal && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showVerifyModal, otpCountdown]);

  const loadProfile = async () => {
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
      const res = await api.get("/users/me");
      if (res.data?.data) {
        setIsLoggedIn(true);
        const d = res.data.data;
        const profileData = {
          id: d.id || 1,
          username: d.username || "Khách hàng",
          fullName: d.fullName || d.username || "Khách hàng",
          email: d.email || "",
          phone: d.phone || "",
          address: d.address || "",
          avatarUrl: d.avatarUrl || "",
          totalSpent: d.totalSpent != null ? parseFloat(d.totalSpent) : 0,
          totalOrders: d.totalOrders ?? 0,
          membershipTier: d.membershipTier || "BRONZE",
          createdDate: d.createdDate || null
        };
        setUserProfile(profileData);
        setEditFullName(profileData.fullName);
        setEditEmail(profileData.email);
        setEditPhone(profileData.phone);
        setEditAddress(profileData.address);
        setEditAvatarUrl(profileData.avatarUrl);
        if (profileData.avatarUrl) {
          localStorage.setItem("userAvatar", profileData.avatarUrl);
          window.dispatchEvent(new Event("avatar_updated"));
        }
      } else {
        throw new Error("Không có dữ liệu người dùng");
      }
    } catch (err) {
      console.warn("Phiên đăng nhập không hợp lệ hoặc đã hết hạn, chuyển hướng tới trang đăng nhập:", err.message);
      setIsLoggedIn(false);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("userId");
      window.location.href = "/auth";
      return;
    } finally {
      setLoading(false);
    }
  };

  // 1. XỬ LÝ UPLOAD FILE ẢNH JPEG / PNG / JPG
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng ảnh (JPEG, JPG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Vui lòng chọn tệp ảnh có định dạng JPEG, JPG hoặc PNG!", "error");
      return;
    }

    // Kiểm tra dung lượng ảnh (Tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Dung lượng ảnh tối đa là 5MB!", "error");
      return;
    }

    // Tạo preview ảnh tức thì
    const localPreviewUrl = URL.createObjectURL(file);
    setEditAvatarUrl(localPreviewUrl);

    // Gửi Multipart file lên backend MinIO
    setUploadingAvatar(true);
    const token = localStorage.getItem("accessToken");
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;

    if (validToken) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/users/me/avatar", formData);

        const newAvatarUrl = res.data?.data?.avatarUrl || "";
        if (newAvatarUrl) {
          setUserProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
          setEditAvatarUrl(newAvatarUrl);
          localStorage.setItem("userAvatar", newAvatarUrl);
          window.dispatchEvent(new Event("avatar_updated"));
          showToast("Tải ảnh đại diện lên máy chủ thành công!");
        } else {
          showToast("Không nhận được đường dẫn ảnh từ máy chủ!", "warning");
        }
      } catch (uploadErr) {
        console.error("Lỗi upload avatar lên MinIO:", uploadErr);
        const errMsg = uploadErr.response?.data?.message || uploadErr.message || "Tải ảnh lên máy chủ thất bại";
        showToast(`Lỗi tải ảnh đại diện: ${errMsg}`, "error");
        // Giữ preview tạm trên giao diện hiện tại nhưng KHÔNG lưu blob url vào localStorage để tránh hỏng ảnh khi login lại
      } finally {
        setUploadingAvatar(false);
      }
    } else {
      setUserProfile(prev => ({ ...prev, avatarUrl: localPreviewUrl }));
      setUploadingAvatar(false);
      showToast("Vui lòng đăng nhập để lưu ảnh đại diện lâu dài!", "warning");
    }
  };

  // 2. XỬ LÝ LƯU THÔNG TIN HỒ SƠ & BẬT XÁC THỰC EMAIL NẾU CÓ THAY ĐỔI
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFullName.trim() || !editPhone.trim()) {
      showToast("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!", "error");
      return;
    }

    // Kiểm tra nếu người dùng thay đổi Email so với Email hiện tại
    const isEmailChanged = editEmail.trim().toLowerCase() !== userProfile.email.trim().toLowerCase();
    if (isEmailChanged) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail.trim())) {
        showToast("Địa chỉ email không đúng định dạng!", "error");
        return;
      }

      // Gọi API yêu cầu gửi mã OTP thật qua Kafka -> Notification Service -> Gmail
      try {
        await api.post("/users/me/email/request-otp", {
          newEmail: editEmail.trim()
        });
        // Mở Modal xác minh mã OTP gửi về Email mới
        setShowVerifyModal(true);
        setOtpCountdown(60);
        setOtpCode("");
        showToast(`Đã gửi mã xác minh 6 số đến email: ${editEmail.trim()}`, "info");
      } catch (otpErr) {
        console.error("Lỗi gửi mã OTP:", otpErr);
        showToast(otpErr.response?.data?.message || "Không thể gửi mã xác thực, vui lòng thử lại sau!", "error");
      }
      return;
    }

    // Lưu thông thường nếu không đổi Email
    await executeSaveProfile(userProfile.email);
  };

  // Hàm thực thi lưu thông tin hồ sơ lên Backend
  const executeSaveProfile = async (targetEmail) => {
    setSaving(true);
    try {
      await api.put("/users/me", {
        fullName: editFullName.trim(),
        email: targetEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        avatarUrl: editAvatarUrl.trim()
      });

      localStorage.setItem("username", editFullName.trim());
    } catch (err) {
      console.error("Lỗi cập nhật backend:", err);
    }

    setUserProfile(prev => ({
      ...prev,
      fullName: editFullName.trim(),
      email: targetEmail.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      avatarUrl: editAvatarUrl.trim()
    }));

    showToast("Cập nhật thông tin hồ sơ thành công!");
    setSaving(false);
  };

  // 3. XỬ LÝ XÁC NHẬN MÃ OTP ĐỔI EMAIL
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      showToast("Vui lòng nhập đủ mã xác minh OTP 6 chữ số!", "error");
      return;
    }

    setIsVerifyingOtp(true);
    const token = localStorage.getItem("accessToken");
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;

    try {
      await api.post("/users/me/email/verify-otp", {
        newEmail: editEmail.trim(),
        otpCode: otpCode.trim()
      });
      setIsVerifyingOtp(false);
      setShowVerifyModal(false);

      // Thực hiện lưu hồ sơ với email mới đã xác thực
      await executeSaveProfile(editEmail.trim());
      showToast(`✅ Đã xác minh & cập nhật địa chỉ Email mới [${editEmail.trim()}] thành công!`);
    } catch (verifyErr) {
      setIsVerifyingOtp(false);
      console.error("Lỗi xác minh OTP:", verifyErr);
      showToast(verifyErr.response?.data?.message || "Mã xác thực OTP không chính xác hoặc đã hết hạn!", "error");
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;

    try {
      await api.post("/users/me/email/request-otp", {
        newEmail: editEmail.trim()
      });
      setOtpCountdown(60);
      showToast(`Đã gửi lại mã xác minh mới đến ${editEmail.trim()}!`, "info");
    } catch (err) {
      showToast("Không thể gửi lại mã xác thực, vui lòng thử lại!", "error");
    }
  };

  // Lấy cấu hình hạng hiện tại
  const currentTierKey = (userProfile.membershipTier || "BRONZE").toUpperCase();
  const currentTierConfig = TIER_CONFIG[currentTierKey] || TIER_CONFIG.BRONZE;

  // Tính toán thời gian kết thúc chu kỳ hạng thành viên
  const currentYear = new Date().getFullYear();
  const expirationDateStr = `31/12/${currentYear}`;

  // Tính toán tiến trình nâng hạng tiếp theo
  const nextTierKey = currentTierConfig.nextTier;
  const nextTierConfig = nextTierKey ? TIER_CONFIG[nextTierKey] : null;

  let remainingAmount = 0;
  let remainingOrders = 0;
  let spentProgressPercent = 100;
  let ordersProgressPercent = 100;
  let isSpentEligible = true;
  let isOrdersEligible = true;
  let completedCriteriaCount = 2;

  if (nextTierConfig) {
    const thresholdSpent = nextTierConfig.minSpent;
    const thresholdOrders = nextTierConfig.minOrders;
    const currentSpent = userProfile.totalSpent || 0;
    const currentOrders = userProfile.totalOrders || 0;

    remainingAmount = Math.max(0, thresholdSpent - currentSpent);
    remainingOrders = Math.max(0, thresholdOrders - currentOrders);

    isSpentEligible = currentSpent >= thresholdSpent;
    isOrdersEligible = currentOrders >= thresholdOrders;

    spentProgressPercent = thresholdSpent > 0 
      ? Math.min(100, Math.round((currentSpent / thresholdSpent) * 100))
      : 100;

    ordersProgressPercent = thresholdOrders > 0
      ? Math.min(100, Math.round((currentOrders / thresholdOrders) * 100))
      : 100;

    completedCriteriaCount = (isSpentEligible ? 1 : 0) + (isOrdersEligible ? 1 : 0);
  }

  if (loading) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>Đang tải thông tin hồ sơ người dùng...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>Đang chuyển hướng tới trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="home-container" style={{ padding: "35px 15px", minHeight: "85vh" }}>
      
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

      {/* TIÊU ĐỀ TRANG HỒ SƠ */}
      <div style={{ marginBottom: "26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>👤</span> Hồ sơ Cá nhân & Hạng Thành viên
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Quản lý thông tin tài khoản, ảnh đại diện, xác thực email và theo dõi đặc quyền hội viên DungThamMobile
          </p>
        </div>

        {/* Lối tắt sang trang Đơn hàng */}
        <a 
          href="/orders" 
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            border: "1px solid #cbd5e1",
            padding: "10px 18px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "700",
            color: "#334155",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
          }}
        >
          <span>📦</span>
          <span>Lịch sử đơn hàng</span>
          <span>›</span>
        </a>
      </div>

      {/* LAYOUT CHIA 2 CỘT: CỘT TRÁI (THẺ VIP & NÂNG HẠNG) + CỘT PHẢI (FORM CHỈNH SỬA & TABS) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.3fr", gap: "28px", alignItems: "start" }}>
        
        {/* ================= CỘT TRÁI: THẺ VIP HỘI VIÊN & THANH TIẾN TRÌNH THĂNG HẠNG ================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* 1. THẺ HỘI VIÊN VIP METALLIC CAO CẤP */}
          <div style={{
            background: currentTierConfig.bgGradient,
            borderRadius: "24px",
            padding: "28px",
            color: currentTierConfig.textColor,
            boxShadow: `0 14px 30px rgba(0,0,0,0.18)`,
            border: `1.5px solid ${currentTierConfig.cardBorder}66`,
            position: "relative",
            overflow: "hidden",
            minHeight: "230px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            {/* Hiệu ứng ánh sáng nền kim loại */}
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "180px",
              height: "180px",
              background: "rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              pointerEvents: "none",
              filter: "blur(20px)"
            }} />

            {/* Hàng trên: Logo thương hiệu & Tên hạng VIP */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div>
                <span style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.8, fontWeight: "700" }}>
                  DUNGTHAM MOBILE VIP CARD
                </span>
                <div style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "0.5px", marginTop: "2px" }}>
                  {currentTierConfig.icon} {currentTierConfig.name}
                </div>
              </div>

              {/* Badge chip thông minh */}
              <div style={{
                background: "rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}>
                MEMBER ID: #{userProfile.id || "108"}
              </div>
            </div>

            {/* Hàng giữa: Avatar thu nhỏ & Tên khách hàng */}
            <div style={{ margin: "20px 0 14px 0", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0
              }}>
                {userProfile.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Avatar" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : (
                  <span style={{ fontSize: "26px" }}>👤</span>
                )}
              </div>

              <div>
                <div style={{ fontSize: "12px", opacity: 0.85, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Chủ thẻ / Member Name
                </div>
                <div style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" }}>
                  {userProfile.fullName || "KHÁCH HÀNG"}
                </div>
              </div>
            </div>

            {/* Hàng dưới: THỜI GIAN KẾT THÚC HẠNG & TÍCH LŨY */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              paddingTop: "14px",
              position: "relative",
              zIndex: 1,
              fontSize: "13px"
            }}>
              <div>
                <span style={{ opacity: 0.8, display: "block", fontSize: "11px" }}>HẠN DUY TRÌ HẠNG:</span>
                <strong style={{ fontSize: "14px" }}>📅 Đến hết {expirationDateStr}</strong>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ opacity: 0.8, display: "block", fontSize: "11px" }}>TỶ LỆ TÍCH ĐIỂM:</span>
                <strong style={{ fontSize: "15px", color: "#fef08a" }}>⭐ +{currentTierConfig.cashbackRate} / đơn</strong>
              </div>
            </div>

          </div>

          {/* 2. KHUNG TIẾN TRÌNH NÂNG HẠNG (TIÊU THÊM BAO NHIÊU TIỀN NỮA ĐỂ LÊN HẠNG) */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🎯</span> Mục tiêu nâng hạng tiếp theo
              </h3>
              {nextTierConfig ? (
                <span style={{ fontSize: "13px", fontWeight: "800", color: nextTierConfig.badgeColor, background: nextTierConfig.badgeBg, padding: "4px 10px", borderRadius: "12px" }}>
                  Mục tiêu: {nextTierConfig.icon} {nextTierConfig.name}
                </span>
              ) : (
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#0284c7", background: "#e0f2fe", padding: "4px 10px", borderRadius: "12px" }}>
                  🏆 ĐÃ ĐẠT HẠNG CAO NHẤT
                </span>
              )}
            </div>

            {/* Thống kê chi tiêu hiện tại */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Tổng chi tiêu tích lũy</span>
                <strong style={{ fontSize: "18px", color: "var(--fpt-red)", fontWeight: "900" }}>
                  {(userProfile.totalSpent || 0).toLocaleString("vi-VN")} đ
                </strong>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Số đơn hoàn thành</span>
                <strong style={{ fontSize: "18px", color: "#0f172a", fontWeight: "900" }}>
                  {userProfile.totalOrders || 0} đơn hàng
                </strong>
              </div>
            </div>

            {/* TIẾN TRÌNH THĂNG HẠNG VỚI 2 TIÊU CHÍ MINH BẠCH */}
            {nextTierConfig ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Tiêu đề tiến trình */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: "#334155", fontWeight: "800" }}>
                    Mục tiêu: {nextTierConfig.icon} {nextTierConfig.name}
                  </span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "800",
                    background: completedCriteriaCount === 2 ? "#dcfce7" : completedCriteriaCount === 1 ? "#fef3c7" : "#f1f5f9",
                    color: completedCriteriaCount === 2 ? "#166534" : completedCriteriaCount === 1 ? "#b45309" : "#475569"
                  }}>
                    {completedCriteriaCount === 2 ? "🎉 Đủ điều kiện thăng hạng" : `Đạt ${completedCriteriaCount}/2 tiêu chí`}
                  </span>
                </div>

                {/* TIÊU CHÍ 1: TỔNG CHI TIÊU */}
                <div style={{
                  background: isSpentEligible ? "#f0fdf4" : "#f8fafc",
                  border: isSpentEligible ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>💰</span> Tiêu chí 1: Tổng chi tiêu
                    </span>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: isSpentEligible ? "#22c55e" : "#f1f5f9",
                      color: isSpentEligible ? "white" : "#64748b"
                    }}>
                      {isSpentEligible ? "✅ ĐÃ ĐẠT" : `Thiếu ${remainingAmount.toLocaleString("vi-VN")} đ`}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                    <span>{(userProfile.totalSpent || 0).toLocaleString("vi-VN")} đ</span>
                    <span style={{ fontWeight: "700" }}>Mục tiêu: {nextTierConfig.minSpent.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{
                      width: `${spentProgressPercent}%`,
                      height: "100%",
                      background: isSpentEligible ? "#16a34a" : "linear-gradient(90deg, #f59e0b, var(--fpt-red))",
                      borderRadius: "6px",
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>

                {/* TIÊU CHÍ 2: SỐ ĐƠN HÀNG */}
                <div style={{
                  background: isOrdersEligible ? "#f0fdf4" : "#f8fafc",
                  border: isOrdersEligible ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>📦</span> Tiêu chí 2: Số đơn hoàn thành
                    </span>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: isOrdersEligible ? "#22c55e" : "#fef3c7",
                      color: isOrdersEligible ? "white" : "#b45309"
                    }}>
                      {isOrdersEligible ? "✅ ĐÃ ĐẠT" : `Thiếu ${remainingOrders} đơn`}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                    <span>{userProfile.totalOrders || 0} đơn</span>
                    <span style={{ fontWeight: "700" }}>Mục tiêu: {nextTierConfig.minOrders} đơn</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{
                      width: `${ordersProgressPercent}%`,
                      height: "100%",
                      background: isOrdersEligible ? "#16a34a" : "linear-gradient(90deg, #f59e0b, #3b82f6)",
                      borderRadius: "6px",
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>

                {/* HỘP HÀNH ĐỘNG THÔNG MINH */}
                <div style={{
                  background: isSpentEligible ? "#f0fdf4" : "#fffbeb",
                  border: isSpentEligible ? "1px solid #86efac" : "1px solid #fde68a",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  color: isSpentEligible ? "#166534" : "#92400e"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>
                    <span>{isSpentEligible ? "🎉" : "⚡"}</span>
                    <span>
                      {isSpentEligible 
                        ? "Bạn đã tích lũy đủ số tiền chi tiêu!" 
                        : isOrdersEligible 
                          ? "Bạn đã đủ số đơn hàng tối thiểu!" 
                          : "Điều kiện nâng hạng tiếp theo:"}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 12px 0", fontSize: "13px", lineHeight: "1.5" }}>
                    {isSpentEligible && !isOrdersEligible && (
                      <>Chỉ cần hoàn thành thêm <strong style={{ color: "var(--fpt-red)" }}>{remainingOrders} đơn hàng</strong> nữa là bạn sẽ chính thức thăng cấp lên hạng <strong>{nextTierConfig.name}</strong>!</>
                    )}
                    {!isSpentEligible && isOrdersEligible && (
                      <>Chỉ cần mua sắm thêm <strong style={{ color: "var(--fpt-red)" }}>+{remainingAmount.toLocaleString("vi-VN")} đ</strong> nữa để chính thức lên hạng <strong>{nextTierConfig.name}</strong>!</>
                    )}
                    {!isSpentEligible && !isOrdersEligible && (
                      <>Cần chi tiêu thêm <strong style={{ color: "var(--fpt-red)" }}>+{remainingAmount.toLocaleString("vi-VN")} đ</strong> và hoàn thành thêm <strong>{remainingOrders} đơn hàng</strong> để lên hạng <strong>{nextTierConfig.name}</strong>.</>
                    )}
                  </p>
                  <Link
                    href="/"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "var(--fpt-red)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      textDecoration: "none",
                      boxShadow: "0 2px 6px rgba(225, 29, 72, 0.25)"
                    }}
                  >
                    🛒 Mua sắm tích lũy ngay
                  </Link>
                </div>

                {/* NÚT XEM CHI TIẾT 4 HẠNG */}
                <button
                  type="button"
                  onClick={() => setShowTierRulesModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "center",
                    padding: "4px 0",
                    textDecoration: "underline"
                  }}
                >
                  ℹ️ Xem bảng quy chế & tiêu chuẩn 4 hạng hội viên
                </button>
              </div>
            ) : (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "14px", padding: "16px", color: "#166534" }}>
                <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>🎉 Chúc mừng Quý khách!</strong>
                <p style={{ margin: "0 0 10px 0", fontSize: "13px" }}>
                  Bạn đang sở hữu thứ hạng <strong>KIM CƯƠNG (PLATINUM)</strong> - hạng hội viên danh giá và cao nhất tại DungThamMobile với trọn bộ đặc quyền tối thượng!
                </p>
                <button
                  type="button"
                  onClick={() => setShowTierRulesModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#059669",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline"
                  }}
                >
                  ℹ️ Xem đặc quyền các cấp bậc hội viên
                </button>
              </div>
            )}

          </div>

        </div>

        {/* ================= CỘT PHẢI: FORM CHỈNH SỬA THÔNG TIN & UPLOAD AVATAR JPEG/PNG ================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* THANH TABS CHUYỂN ĐỔI NỘI DUNG */}
          <div style={{
            display: "flex",
            background: "white",
            borderRadius: "16px",
            padding: "6px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
            gap: "6px"
          }}>
            <button
              onClick={() => setActiveTab("PROFILE")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "PROFILE" ? "var(--fpt-red)" : "transparent",
                color: activeTab === "PROFILE" ? "white" : "#475569",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              📝 Thông tin cá nhân
            </button>

            <button
              onClick={() => setActiveTab("BENEFITS")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "BENEFITS" ? "var(--fpt-red)" : "transparent",
                color: activeTab === "BENEFITS" ? "white" : "#475569",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              👑 Đặc quyền {currentTierConfig.name}
            </button>
          </div>

          {/* TAB 1: FORM CẬP NHẬT THÔNG TIN CÁ NHÂN */}
          {activeTab === "PROFILE" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
            }}>
              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "20px" }}>
                Chỉnh sửa thông tin tài khoản
              </h2>

              {/* KHU VỰC UPLOAD ẢNH ĐẠI DIỆN JPEG / PNG */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "#f8fafc",
                padding: "18px 20px",
                borderRadius: "16px",
                border: "1px dashed #cbd5e1",
                marginBottom: "20px"
              }}>
                <div style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  flexShrink: 0
                }}>
                  {editAvatarUrl ? (
                    <img 
                      src={editAvatarUrl} 
                      alt="Avatar Preview" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <span style={{ fontSize: "36px" }}>👤</span>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    Ảnh đại diện tài khoản
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                    Hỗ trợ định dạng <strong>JPEG, JPG, PNG</strong> (Dung lượng tối đa 5MB)
                  </div>

                  {/* Ẩn input file mặc định, kích hoạt qua nút bấm */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleAvatarFileChange}
                    style={{ display: "none" }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "white",
                      color: "#334155",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: uploadingAvatar ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}
                  >
                    <span>📷</span>
                    <span>{uploadingAvatar ? "Đang tải ảnh lên..." : "Tải ảnh JPEG / PNG lên"}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                
                {/* Họ và tên */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Họ và tên người nhận *
                  </label>
                  <input 
                    type="text"
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Số điện thoại & Địa chỉ Email (Cho phép sửa kèm xác minh) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Số điện thoại *
                    </label>
                    <input 
                      type="text"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="0967233789"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                        Địa chỉ Email *
                      </label>
                      {editEmail.trim().toLowerCase() !== userProfile.email.trim().toLowerCase() ? (
                        <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", background: "#fef3c7", padding: "2px 6px", borderRadius: "6px" }}>
                          ⚠️ Cần xác minh OTP
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#059669", fontWeight: "800", background: "#d1fae5", padding: "2px 6px", borderRadius: "6px" }}>
                          ✓ Đã xác thực
                        </span>
                      )}
                    </div>

                    <input 
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: editEmail.trim().toLowerCase() !== userProfile.email.trim().toLowerCase() ? "1.5px solid #d97706" : "1px solid #cbd5e1",
                        background: "white",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Địa chỉ nhận hàng mặc định */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Địa chỉ nhận hàng mặc định
                  </label>
                  <textarea 
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>

                {/* Nút lưu thông tin */}
                <div style={{ marginTop: "10px" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "var(--fpt-red)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "800",
                      cursor: saving ? "wait" : "pointer",
                      boxShadow: "0 4px 14px rgba(205, 28, 34, 0.25)",
                      transition: "all 0.2s"
                    }}
                  >
                    {saving ? "Đang lưu thay đổi..." : (
                      editEmail.trim().toLowerCase() !== userProfile.email.trim().toLowerCase() 
                        ? "XÁC MINH EMAIL & LƯU HỒ SƠ 🔐" 
                        : "LƯU THAY ĐỔI THÔNG TIN"
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 2: DANH SÁCH ĐẶC QUYỀN HỘI VIÊN */}
          {activeTab === "BENEFITS" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
            }}>
              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                Đặc quyền Hội viên của bạn
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                Các quyền lợi và ưu đãi đang áp dụng cho hạng <strong>{currentTierConfig.name}</strong>
              </p>

              {/* Danh sách quyền lợi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {currentTierConfig.benefits.map((benefit, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "#f8fafc",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9"
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>✨</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bảng so sánh nhanh 4 hạng */}
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                Tổng quan tiêu chuẩn 4 cấp bậc hội viên:
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                {Object.values(TIER_CONFIG).map(t => {
                  const isCurrent = t.code === currentTierKey;
                  const isNext = t.code === nextTierKey;
                  return (
                    <div 
                      key={t.code}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: isCurrent ? "#fff5f5" : (isNext ? "#f0f9ff" : "#f8fafc"),
                        border: isCurrent ? "2px solid var(--fpt-red)" : (isNext ? "1.5px solid #0284c7" : "1px solid #e2e8f0"),
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ fontWeight: "800", color: isCurrent ? "var(--fpt-red)" : (isNext ? "#0284c7" : "#0f172a"), fontSize: "14px" }}>
                          {t.icon} {t.name}
                        </div>
                        {isCurrent && (
                          <span style={{ fontSize: "10px", fontWeight: "800", background: "var(--fpt-red)", color: "white", padding: "2px 6px", borderRadius: "6px" }}>
                            HIỆN TẠI
                          </span>
                        )}
                        {isNext && (
                          <span style={{ fontSize: "10px", fontWeight: "800", background: "#0284c7", color: "white", padding: "2px 6px", borderRadius: "6px" }}>
                            TIẾP THEO
                          </span>
                        )}
                      </div>
                      <div style={{ color: "#334155", fontSize: "12px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div>💰 <strong>Chi tiêu:</strong> {t.minSpent === 0 ? "0 đ" : `Từ ${(t.minSpent).toLocaleString("vi-VN")} đ`}</div>
                        <div>📦 <strong>Số đơn:</strong> {t.minOrders === 0 ? "0 đơn" : `Tối thiểu ${t.minOrders} đơn`}</div>
                        <div style={{ color: "#b45309", fontWeight: "700", marginTop: "2px" }}>🎁 Hoàn: {t.cashbackRate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL XÁC MINH OTP KHI THAY ĐỔI EMAIL ================= */}
      {showVerifyModal && (
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
            maxWidth: "480px",
            width: "100%",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>📧</div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>
              Xác minh địa chỉ Email mới
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" }}>
              Hệ thống bảo mật đã gửi mã xác thực 6 chữ số (OTP) tới hòm thư:<br />
              <strong style={{ color: "#0f172a", fontSize: "15px" }}>{editEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: "20px" }}>
                <input 
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Nhập 6 chữ số OTP (VD: 839210)"
                  style={{
                    width: "100%",
                    padding: "14px",
                    textAlign: "center",
                    letterSpacing: "8px",
                    fontSize: "22px",
                    fontWeight: "900",
                    borderRadius: "12px",
                    border: "2px solid #cbd5e1",
                    outline: "none"
                  }}
                  autoFocus
                />
              </div>

              {/* Đếm ngược gửi lại mã */}
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
                {otpCountdown > 0 ? (
                  <span>Gửi lại mã xác minh sau: <strong style={{ color: "var(--fpt-red)" }}>{otpCountdown}s</strong></span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    style={{ background: "none", border: "none", color: "var(--fpt-red)", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Gửi lại mã OTP ngay
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  style={{
                    flex: 1.5,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "var(--fpt-red)",
                    color: "white",
                    fontWeight: "800",
                    cursor: isVerifyingOtp ? "wait" : "pointer"
                  }}
                >
                  {isVerifyingOtp ? "Đang xác thực..." : "Xác nhận & Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL BẢNG QUY CHẾ & TIÊU CHUẨN 4 HẠNG HỘI VIÊN ================= */}
      {showTierRulesModal && (
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
            maxWidth: "680px",
            width: "100%",
            padding: "28px 32px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0" }}>
                  👑 Tiêu Chuẩn & Đặc Quyền Hội Viên
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Hệ thống tự động nâng hạng khi đạt <strong>đồng thời cả 2 tiêu chí</strong> trong chu kỳ năm {currentYear}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTierRulesModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569"
                }}
              >
                ✕
              </button>
            </div>

            {/* BẢNG TIÊU CHUẨN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {Object.values(TIER_CONFIG).map(tier => {
                const isCurrent = tier.code === currentTierKey;
                const isNext = tier.code === nextTierKey;

                return (
                  <div
                    key={tier.code}
                    style={{
                      border: isCurrent ? "2px solid var(--fpt-red)" : isNext ? "2px solid #0284c7" : "1px solid #e2e8f0",
                      background: isCurrent ? "#fff5f5" : isNext ? "#f0f9ff" : "#ffffff",
                      borderRadius: "16px",
                      padding: "16px 20px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "22px" }}>{tier.icon}</span>
                        <strong style={{ fontSize: "16px", color: isCurrent ? "var(--fpt-red)" : isNext ? "#0284c7" : "#0f172a" }}>
                          {tier.name}
                        </strong>
                      </div>
                      {isCurrent && (
                        <span style={{
                          background: "var(--fpt-red)",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "800"
                        }}>
                          👉 HẠNG HIỆN TẠI
                        </span>
                      )}
                      {isNext && (
                        <span style={{
                          background: "#0284c7",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "800"
                        }}>
                          🎯 MỤC TIÊU TIẾP THEO
                        </span>
                      )}
                    </div>

                    {/* Điều kiện đạt hạng */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      background: isCurrent ? "#ffe4e6" : isNext ? "#e0f2fe" : "#f8fafc",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      marginBottom: "10px"
                    }}>
                      <div>
                        💰 <strong>Chi tiêu:</strong> {tier.minSpent === 0 ? "0 đ" : `Từ ${(tier.minSpent).toLocaleString("vi-VN")} đ`}
                      </div>
                      <div>
                        📦 <strong>Số đơn:</strong> {tier.minOrders === 0 ? "0 đơn" : `Tối thiểu ${tier.minOrders} đơn`}
                      </div>
                    </div>

                    {/* Đặc quyền tiêu biểu */}
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>
                      <strong>Đặc quyền:</strong> {tier.benefits.slice(0, 2).join(" • ")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lưu ý quy chế */}
            <div style={{
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "12px",
              color: "#92400e",
              lineHeight: "1.5",
              marginBottom: "20px"
            }}>
              💡 <strong>Lưu ý:</strong> Thứ hạng hội viên có hiệu lực đến hết ngày <strong>{expirationDateStr}</strong>. Đơn hàng chỉ được tính là hoàn thành sau khi đã thanh toán thành công và được giao nhận hoàn tất (không bao gồm đơn đã hủy hoặc hoàn tiền).
            </div>

            <button
              type="button"
              onClick={() => setShowTierRulesModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
