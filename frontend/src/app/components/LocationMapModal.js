"use client";
import React, { useState } from "react";

export default function LocationMapModal({ isOpen, onClose, selectedLocation, setSelectedLocation }) {
  if (!isOpen) return null;

  // Dữ liệu cửa hàng Dũng Thắm Mobile
  const storeInfo = {
    name: "Cửa Hàng ĐTDĐ Dũng Thắm",
    city: "Hà Nam",
    district: "TP. Phủ Lý",
    address: "Chợ Cầu Gừng, Liêm Tuyền, TP. Phủ Lý, Tỉnh Hà Nam",
    phone: "0977.978.999",
    hours: "07:30 - 21:30 (Mở cửa tất cả các ngày trong tuần)",
    status: "Đang mở cửa",
    // Embed map URL chính xác của Cửa Hàng ĐTDĐ Dũng Thắm từ Google Maps
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.7214732170366!2d105.9148131!3d20.5080732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135d1b3fcb5100b%3A0x3632a71172bfde00!2zQ-G7rWEgSMOgbmcgxJDhuJDEkCBExaluZyBUaOG6r20!5e0!3m2!1svi!2svn!4v1700000000000",
    promotions: [
      { id: 1, tag: "🔥 ĐẶC QUYỀN DŨNG THẮM MOBILE", text: "Giảm thêm 500.000đ & Tặng bộ quà tặng phụ kiện khi mua máy tại shop" },
      { id: 2, tag: "🚀 GIAO HÀNG TẬN NƠI", text: "Miễn phí giao hàng hỏa tốc trong 1 giờ tại khu vực TP. Phủ Lý & lân cận" },
      { id: 3, tag: "♻️ THU CỦ ĐỔI MỚI", text: "Trợ giá thu cũ đổi mới lên đến 2.000.000đ dành cho khách hàng tại Hà Nam" },
      { id: 4, tag: "🛠️ BẢO HÀNH & SỬA CHỮA", text: "Bảo hành 1 đổi 1 trong 30 ngày & Hỗ trợ kỹ thuật, ép kính, thay pin tại chỗ" }
    ]
  };

  const handleConfirm = () => {
    if (setSelectedLocation) {
      setSelectedLocation("Phủ Lý, Hà Nam");
      if (typeof window !== "undefined") {
        localStorage.setItem("user_selected_location", "Phủ Lý, Hà Nam");
      }
    }
    onClose();
  };

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="location-modal-header">
          <div className="location-modal-title">
            <span className="location-modal-icon">📍</span>
            <div>
              <h3>Cửa Hàng & Ưu Đãi Khu Vực</h3>
              <p>Xem thông tin cửa hàng và ưu đãi đặc quyền tại khu vực bạn chọn</p>
            </div>
          </div>
          <button className="location-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Content - 2 Columns Layout */}
        <div className="location-modal-body">
          
          {/* CỘT TRÁI: Thông tin cửa hàng & Ưu đãi */}
          <div className="location-info-column">
            
            {/* Thẻ chọn tỉnh thành / khu vực */}
            <div className="location-select-box">
              <label className="location-select-label">Khu vực đã chọn:</label>
              <div className="location-current-badge">
                <span>🏙️ TP. Phủ Lý, Tỉnh Hà Nam</span>
                <span className="active-tag">Chi nhánh chính</span>
              </div>
            </div>

            {/* Chi tiết cửa hàng */}
            <div className="store-detail-card">
              <div className="store-card-header">
                <span className="store-name">{storeInfo.name}</span>
                <span className="store-status-pill">{storeInfo.status}</span>
              </div>
              
              <div className="store-info-row">
                <span className="info-icon">📍</span>
                <span className="info-text"><strong>Địa chỉ:</strong> {storeInfo.address}</span>
              </div>
              
              <div className="store-info-row">
                <span className="info-icon">⏰</span>
                <span className="info-text"><strong>Giờ mở cửa:</strong> {storeInfo.hours}</span>
              </div>
              
              <div className="store-info-row">
                <span className="info-icon">📞</span>
                <span className="info-text"><strong>Hotline:</strong> <a href={`tel:${storeInfo.phone}`} className="phone-link">{storeInfo.phone}</a></span>
              </div>
            </div>

            {/* Khung danh sách Ưu đãi khu vực */}
            <div className="local-promotions-section">
              <h4 className="promo-section-title">🎁 Ưu đãi đặc quyền cho khu vực Hà Nam</h4>
              <div className="promo-list">
                {storeInfo.promotions.map((promo) => (
                  <div key={promo.id} className="promo-item-card">
                    <span className="promo-tag-badge">{promo.tag}</span>
                    <p className="promo-text-content">{promo.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="confirm-location-btn" onClick={handleConfirm}>
              ✓ Xác nhận ưu đãi tại Dũng Thắm Mobile (Hà Nam)
            </button>
          </div>

          {/* CỘT PHẢI: Khung Bản Đồ Nhúng (Google Maps Embedded) */}
          <div className="location-map-column">
            <div className="map-wrapper">
              <div className="map-header-bar">
                <span>🗺️ Vị trí Cửa Hàng ĐTDĐ Dũng Thắm</span>
                <a 
                  href="https://www.google.com/maps/place/C%E1%BB%ADa+H%C3%A0ng+%C4%90T%C4%90%C4%90+D%C6%A9ng+Th%E1%BA%AFm/@20.5080732,105.9148131,17z" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="open-gmaps-link"
                >
                  Mở trên Google Maps ↗
                </a>
              </div>
              
              <iframe
                title="Bản đồ Cửa Hàng ĐTDĐ Dũng Thắm"
                src={storeInfo.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="embedded-google-map"
              ></iframe>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
