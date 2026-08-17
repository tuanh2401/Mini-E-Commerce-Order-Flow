"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import AIChatbot from "./AIChatbot";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname && pathname.startsWith("/admin");

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* HEADER CHUẨN FPT SHOP */}
      <Header />

      {/* SUB-HEADER BAR (THANH PHỤ MÀU TRẮNG DƯỚI HEADER) */}
      <div className="sub-header-bar">
        <div className="sub-header-container" style={{ justifyContent: "flex-start" }}>
          <div className="sub-promo-links">
            <a href="#" className="promo-link-item">
              <span className="promo-icon">🖥️</span>
              PC E-Power hiệu năng cao
            </a>
            <a href="#" className="promo-link-item">
              <span className="promo-icon">📱</span>
              Thu cũ iPhone giá tốt
            </a>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CÁC TRANG CON SẼ HIỂN THỊ TẠI ĐÂY */}
      <main className="main-content">
        {children}
      </main>

      {/* FOOTER BẢN QUYỀN CHUẨN THÔNG TIN LÀM CHO FPT SHOP */}
      <footer className="fpt-footer">
        <div className="fpt-footer-container">
          <p>© 2007 - 2026 CÔNG TY CỔ PHẦN BÁN LẺ KỸ THUẬT SỐ FPT. MST: 0311609355. (Đăng ký lần đầu: Ngày 08 tháng 03 năm 2012, Đăng ký thay đổi ngày 10/07/2025)</p>
          <p>GP số 264/GP-TTĐT do Sở TTTT TP. Hồ Chí Minh cấp ngày 22/04/2020</p>
          <p>Địa chỉ: Số 261 - 263 Khánh Hội, Phường 5, Quận 4, Thành phố Hồ Chí Minh, Việt Nam. Điện thoại: 1800 6601. Chịu trách nhiệm nội dung: Nguyễn Bạch Điệp.</p>
        </div>
      </footer>

      {/* CHATBOT AI TƯ VẤN SẢN PHẨM */}
      <AIChatbot />
    </>
  );
}
