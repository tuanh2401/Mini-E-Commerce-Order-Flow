"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import AIChatbot from "./AIChatbot";
import LocationMapModal from "./LocationMapModal";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname && pathname.startsWith("/admin");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Dũng Thắm Mobile - Hà Nam");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_selected_location");
      if (saved) {
        setSelectedLocation(saved);
      }
    }
  }, []);

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* HEADER CHUẨN FPT SHOP */}
      <Header />

      {/* SUB-HEADER BAR (THANH PHỤ MÀU TRẮNG DƯỚI HEADER) */}
      <div className="sub-header-bar">
        <div className="sub-header-container">
          <div className="sub-promo-links">
            <a href="#" className="promo-link-item">
              <span className="promo-icon">🖥️</span>
              PC E-Power hiệu năng cao
            </a>
            <a href="#" className="promo-link-item">
              <span className="promo-icon">📱</span>
              Thu cũ iPhone giá tốt
            </a>
            <a href="#" className="promo-link-item">
              <span className="promo-icon">🧹</span>
              Robot hút bụi giá tốt
            </a>
          </div>

          {/* NÚT CHỌN KHU VỰC ĐỂ XEM ƯU ĐÃI & BẢN ĐỒ CỬA HÀNG */}
          <button 
            className="location-selector-btn"
            onClick={() => setIsModalOpen(true)}
            title="Xem vị trí cửa hàng Phủ Lý - Hà Nam và ưu đãi khu vực"
          >
            <span className="location-pin-icon">📍</span>
            <span className="location-text">Chọn khu vực: <strong>{selectedLocation}</strong></span>
            <span className="location-arrow">∨</span>
          </button>
        </div>
      </div>

      {/* MODAL BẢN ĐỒ & ƯU ĐÃI CỬA HÀNG PHỦ LÝ HÀ NAM */}
      <LocationMapModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      {/* NỘI DUNG CÁC TRANG CON SẼ HIỂN THỊ TẠI ĐÂY */}
      <main className="main-content">
        {children}
      </main>

      {/* FOOTER BẢN QUYỀN CHUẨN THÔNG TIN LÀM CHO DŨNG THẨM MOBILE */}
      <footer className="fpt-footer">
        <div className="fpt-footer-container">
          <p>© 2007 - 2026 CÔNG TY CỔ PHẦN BÁN LẺ DŨNG THẨM MOBILE. MST: 0311609355. (Đăng ký lần đầu: Ngày 08 tháng 03 năm 2012, Đăng ký thay đổi ngày 10/07/2025)</p>
          <p>GP số 264/GP-TTĐT do Sở TTTT TP. Hồ Chí Minh cấp ngày 22/04/2020</p>
          <p>Địa chỉ: Cửa hàng Dũng Thẩm Mobile - TP. Phủ Lý, Hà Nam. Điện thoại: 1800 6601. Chịu trách nhiệm nội dung: Dũng Thẩm Mobile.</p>
        </div>
      </footer>

      {/* CHATBOT AI TƯ VẤN SẢN PHẨM */}
      <AIChatbot />
    </>
  );
}
