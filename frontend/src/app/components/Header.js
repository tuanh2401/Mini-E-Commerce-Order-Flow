"use client";
import React, { useState, useEffect } from "react";

export default function Header() {
  const [megamenuOpen, setMegamenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("PHONE"); // PHONE | LAPTOP | APPLIANCE | ACCESSORY

  // Lấy trạng thái đăng nhập từ localStorage sau khi mounted
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "");
      // Đọc role từ JWT token
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserRole(payload.role || payload.roles || "");
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUsername("");
    setUserRole("");
    window.location.href = "/";
  };

  // 1. Giao diện Megamenu - Nội dung Điện thoại
  const renderPhoneContent = () => (
    <div>
      <div className="megamenu-section-title">🔥 Gợi ý cho bạn</div>
      
      {/* Brand filters */}
      <div className="megamenu-brands-row">
        <a href="/category/1?brand=apple" className="brand-logo-pill" style={{ textDecoration: "none" }}>Apple</a>
        <a href="/category/1?brand=samsung" className="brand-logo-pill" style={{ textDecoration: "none" }}>Samsung</a>
        <a href="/category/1?brand=xiaomi" className="brand-logo-pill" style={{ textDecoration: "none" }}>Xiaomi</a>
        <a href="/category/1?brand=oppo" className="brand-logo-pill" style={{ textDecoration: "none" }}>OPPO</a>
        <a href="/category/1?brand=honor" className="brand-logo-pill" style={{ textDecoration: "none" }}>Honor</a>
        <a href="/category/1?brand=tecno" className="brand-logo-pill" style={{ textDecoration: "none" }}>Tecno</a>
      </div>

      {/* Sub-types filters */}
      <div className="megamenu-subtypes-row">
        <a href="/category/1?search=5g" style={{ textDecoration: "none", color: "inherit" }}><span>⚡ Điện thoại 5G</span></a>
        <a href="/category/1?search=ai" style={{ textDecoration: "none", color: "inherit" }}><span>🧠 Điện thoại AI</span></a>
        <a href="/category/1?search=gập" style={{ textDecoration: "none", color: "inherit" }}><span>📱 Điện thoại gập</span></a>
        <a href="/category/1?search=gaming" style={{ textDecoration: "none", color: "inherit" }}><span>🎮 Gaming phone</span></a>
        <a href="/category/1?search=phổ thông" style={{ textDecoration: "none", color: "inherit" }}><span>📞 Phổ thông 4G</span></a>
      </div>

      {/* Product categories lists grid */}
      <div className="megamenu-grid-cols">
        <div className="megamenu-col">
          <a href="/category/1?brand=apple" className="megamenu-group-title">Apple (iPhone) ⟩</a>
          <a href="/category/1?brand=apple&series=17">iPhone 17 Series</a>
          <a href="/category/1?brand=apple&search=air">iPhone Air</a>
          <a href="/category/1?brand=apple&series=16">iPhone 16 Series</a>
          <a href="/category/1?brand=apple&series=15">iPhone 15 Series</a>
          <a href="/category/1?brand=apple&series=14">iPhone 14 Series</a>
          <a href="/category/1?brand=apple&series=13">iPhone 13 Series</a>
          <a href="/category/1?brand=apple&series=12">iPhone 12 Series</a>
          <a href="/category/1?brand=apple&series=11">iPhone 11 Series</a>
          <a href="/category/1?brand=apple&search=x">iPhone X Series</a>
        </div>
        <div className="megamenu-col">
          <a href="/category/1?brand=samsung" className="megamenu-group-title">Samsung ⟩</a>
          <a href="/category/1?brand=samsung&search=ai">Galaxy AI</a>
          <a href="/category/1?brand=samsung&series=s">Galaxy S Series</a>
          <a href="/category/1?brand=samsung&search=z">Galaxy Z Series</a>
          <a href="/category/1?brand=samsung&search=a">Galaxy A Series</a>
          <a href="/category/1?brand=samsung&search=xcover">Galaxy XCover</a>
        </div>
        <div className="megamenu-col">
          <a href="/category/1?brand=xiaomi" className="megamenu-group-title">Xiaomi ⟩</a>
          <a href="/category/1?brand=xiaomi&search=poco">Poco Series</a>
          <a href="/category/1?brand=xiaomi&search=xiaomi">Xiaomi Series</a>
          <a href="/category/1?brand=xiaomi&search=note">Redmi Note Series</a>
          <a href="/category/1?brand=xiaomi&search=redmi">Redmi Series</a>
        </div>
        <div className="megamenu-col">
          <a href="/category/1?brand=oppo" className="megamenu-group-title">OPPO ⟩</a>
          <a href="/category/1?brand=oppo&search=reno">OPPO Reno Series</a>
          <a href="/category/1?brand=oppo&search=oppo%20a">OPPO A Series</a>
          <a href="/category/1?brand=oppo&search=find">OPPO Find Series</a>
        </div>
      </div>
    </div>
  );

  // 2. Giao diện Megamenu - Nội dung Laptop
  const renderLaptopContent = () => (
    <div>
      <div className="megamenu-section-title">🔥 Gợi ý cho bạn</div>

      {/* Brand filters */}
      <div className="megamenu-brands-row">
        <a href="/category/2?brand=apple" className="brand-logo-pill" style={{ textDecoration: "none" }}>MacBook</a>
        <a href="/category/2?brand=asus" className="brand-logo-pill" style={{ textDecoration: "none" }}>Asus</a>
        <a href="/category/2?brand=dell" className="brand-logo-pill" style={{ textDecoration: "none" }}>Dell</a>
        <a href="/category/2?brand=lenovo" className="brand-logo-pill" style={{ textDecoration: "none" }}>Lenovo</a>
        <a href="/category/2?brand=hp" className="brand-logo-pill" style={{ textDecoration: "none" }}>HP</a>
        <a href="/category/2?brand=acer" className="brand-logo-pill" style={{ textDecoration: "none" }}>Acer</a>
      </div>

      {/* Sub-types filters */}
      <div className="megamenu-subtypes-row">
        <a href="/category/2?search=gaming" style={{ textDecoration: "none", color: "inherit" }}><span>🎮 Gaming đồ họa</span></a>
        <a href="/category/2?search=ai" style={{ textDecoration: "none", color: "inherit" }}><span>🧠 Laptop AI</span></a>
        <a href="/category/2?search=học%20tập" style={{ textDecoration: "none", color: "inherit" }}><span>🎓 Sinh viên - Văn phòng</span></a>
        <a href="/category/2?search=mỏng" style={{ textDecoration: "none", color: "inherit" }}><span>💻 Mỏng nhẹ</span></a>
        <a href="/category/2?search=doanh%20nhân" style={{ textDecoration: "none", color: "inherit" }}><span>💼 Doanh nhân</span></a>
      </div>

      {/* Product categories lists grid */}
      <div className="megamenu-grid-cols">
        <div className="megamenu-col">
          <a href="/category/2?brand=apple" className="megamenu-group-title">Apple (MacBook) ⟩</a>
          <a href="/category/2?brand=apple&search=neo">MacBook Neo</a>
          <a href="/category/2?brand=apple&search=air%2013">MacBook Air 13 inch</a>
          <a href="/category/2?brand=apple&search=air%2015">MacBook Air 15 inch</a>
          <a href="/category/2?brand=apple&search=pro%2014">MacBook Pro 14 inch</a>
          <a href="/category/2?brand=apple&search=pro%2016">MacBook Pro 16 inch</a>
          <a href="/category/2?brand=apple&search=m5">MacBook M5 Series</a>
          
          <a href="/category/2?brand=asus" className="megamenu-group-title" style={{ marginTop: "12px" }}>Asus ⟩</a>
          <a href="/category/2?brand=asus&search=zenbook">Asus ZenBook</a>
          <a href="/category/2?brand=asus&search=vivobook">Asus VivoBook</a>
          <a href="/category/2?brand=asus&search=tuf">Asus TUF Gaming</a>
          <a href="/category/2?brand=asus&search=rog">Asus ROG</a>
        </div>
        
        <div className="megamenu-col">
          <a href="/category/2?brand=lenovo" className="megamenu-group-title">Lenovo ⟩</a>
          <a href="/category/2?brand=lenovo&search=loq">Lenovo Gaming LOQ</a>
          <a href="/category/2?brand=lenovo&search=legion">Lenovo Legion Gaming</a>
          <a href="/category/2?brand=lenovo&search=yoga">Lenovo Yoga</a>
          <a href="/category/2?brand=lenovo&search=thinkpad">Lenovo ThinkPad</a>
          <a href="/category/2?brand=lenovo&search=ideapad">Lenovo IdeaPad</a>
          <a href="/category/2?brand=lenovo&search=thinkbook">Lenovo ThinkBook</a>
          <a href="/category/2?brand=lenovo&search=v%20series">Lenovo V Series</a>

          <a href="/category/2?brand=acer" className="megamenu-group-title" style={{ marginTop: "12px" }}>Acer ⟩</a>
          <a href="/category/2?brand=acer&search=aspire">Acer Aspire</a>
          <a href="/category/2?brand=acer&search=gaming">Acer Aspire Gaming</a>
          <a href="/category/2?brand=acer&search=nitro">Acer Nitro</a>
        </div>

        <div className="megamenu-col">
          <a href="/category/2?brand=dell" className="megamenu-group-title">Dell ⟩</a>
          <a href="/category/2?brand=dell&search=xps">Dell XPS</a>
          <a href="/category/2?brand=dell&search=inspiron">Dell Inspiron</a>
          <a href="/category/2?brand=dell&search=latitude">Dell Latitude</a>
          <a href="/category/2?brand=dell&search=dell%2015">Dell 15</a>
          <a href="/category/2?brand=dell&search=dell%2016">Dell 16</a>

          <a href="/category/2?brand=hp" className="megamenu-group-title" style={{ marginTop: "12px" }}>HP ⟩</a>
          <a href="/category/2?brand=hp&search=14s">HP 14/15 - 14s/15s</a>
          <a href="/category/2?brand=hp&search=probook">HP ProBook</a>
          <a href="/category/2?brand=hp&search=victus">HP Victus</a>
          <a href="/category/2?brand=hp&search=omen">HP Omen</a>
          <a href="/category/2?brand=hp&search=omnibook">HP Omnibook 5</a>
        </div>
      </div>
    </div>
  );

  // 3. Giao diện Megamenu - Nội dung Điện máy
  const renderApplianceContent = () => (
    <div>
      <div className="megamenu-section-title">🔥 Gợi ý cho bạn</div>

      {/* Sub-types filters */}
      <div className="megamenu-subtypes-row">
        <span>❄️ Máy lạnh 1 chiều</span>
        <span>📺 Tivi 4K</span>
        <span>📺 Tivi QLED</span>
        <span>🧼 Máy giặt cửa trước</span>
        <span>🧊 Tủ lạnh Inverter</span>
      </div>

      <div className="megamenu-grid-cols">
        <div className="megamenu-col">
          <a href="#" className="megamenu-group-title" onClick={(e) => { e.preventDefault(); alert("Danh mục Điện máy sẽ được mở rộng sớm!"); }}>Tivi ⟩</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Tivi QLED</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Tivi 4K</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Google TV</a>
          
          <a href="#" className="megamenu-group-title" style={{ marginTop: "12px" }} onClick={(e) => { e.preventDefault(); alert("Danh mục Điện máy sẽ được mở rộng sớm!"); }}>Máy giặt ⟩</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Máy giặt cửa trước</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Máy giặt cửa trên</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Máy giặt sấy</a>
        </div>

        <div className="megamenu-col">
          <a href="#" className="megamenu-group-title" onClick={(e) => { e.preventDefault(); alert("Danh mục Điện máy sẽ được mở rộng sớm!"); }}>Máy lạnh - Điều hòa ⟩</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Máy lạnh - Điều hòa 1 chiều</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Máy lạnh - Điều hòa 2 chiều</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Máy lạnh - Điều hòa Inverter</a>
          
          <a href="#" className="megamenu-group-title" style={{ marginTop: "12px" }} onClick={(e) => { e.preventDefault(); alert("Danh mục Điện máy sẽ được mở rộng sớm!"); }}>Máy sấy ⟩</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Sấy thông hơi</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Sấy ngưng tụ</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Sấy bơm nhiệt</a>
        </div>

        <div className="megamenu-col">
          <a href="#" className="megamenu-group-title" onClick={(e) => { e.preventDefault(); alert("Danh mục Điện máy sẽ được mở rộng sớm!"); }}>Tủ lạnh ⟩</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Tủ lạnh Inverter</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Tủ lạnh nhiều cửa</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Side by side</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Mini</a>

          <a href="#" className="megamenu-group-title" style={{ marginTop: "12px" }} onClick={(e) => e.preventDefault()}>Tủ đông ⟩</a>
          <a href="#" className="megamenu-group-title" style={{ marginTop: "12px" }} onClick={(e) => e.preventDefault()}>Phụ kiện điện máy ⟩</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Vật tư máy lạnh</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Phụ kiện máy giặt</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Phụ kiện Tivi</a>
        </div>
      </div>
    </div>
  );

  // 4. Giao diện Megamenu - Nội dung Phụ kiện
  const renderAccessoryContent = () => (
    <div>
      <div className="megamenu-section-title">🔥 Gợi ý cho bạn</div>

      <div className="megamenu-subtypes-row">
        <a href="/category/3?search=tai%20nghe" style={{ textDecoration: "none", color: "inherit" }}><span>🎧 Tai nghe không dây</span></a>
        <a href="/category/3?search=sạc" style={{ textDecoration: "none", color: "inherit" }}><span>🔌 Cáp sạc nhanh 20W</span></a>
        <a href="/category/3?search=sạc%20dự%20phòng" style={{ textDecoration: "none", color: "inherit" }}><span>🔋 Sạc dự phòng 20000mAh</span></a>
        <a href="/category/3?search=chuột" style={{ textDecoration: "none", color: "inherit" }}><span>🖱️ Chuột gaming</span></a>
        <a href="/category/3?search=bàn%20phím" style={{ textDecoration: "none", color: "inherit" }}><span>⌨️ Bàn phím cơ</span></a>
      </div>

      <div className="megamenu-grid-cols">
        <div className="megamenu-col">
          <a href="/category/3?search=tai%20nghe" className="megamenu-group-title">Tai nghe ⟩</a>
          <a href="/category/3?search=true%20wireless">Tai nghe True Wireless</a>
          <a href="/category/3?search=chụp%20tai">Tai nghe chụp tai</a>
          <a href="/category/3?search=thể%20thao">Tai nghe thể thao</a>
          
          <a href="/category/3?search=sạc" className="megamenu-group-title" style={{ marginTop: "12px" }}>Sạc cáp ⟩</a>
          <a href="/category/3?search=cáp">Cáp Type-C / Lightning</a>
          <a href="/category/3?search=sạc%20nhanh">Củ sạc nhanh</a>
        </div>

        <div className="megamenu-col">
          <a href="/category/3?search=sạc%20dự%20phòng" className="megamenu-group-title">Sạc dự phòng ⟩</a>
          <a href="/category/3?search=anker">Sạc dự phòng Anker</a>
          <a href="/category/3?search=không%20dây">Sạc dự phòng không dây</a>
          
          <a href="/category/3?search=chuột" className="megamenu-group-title" style={{ marginTop: "12px" }}>Thiết bị ngoại vi ⟩</a>
          <a href="/category/3?search=chuột">Chuột không dây</a>
          <a href="/category/3?search=bàn%20phím">Bàn phím cơ</a>
        </div>

        <div className="megamenu-col">
          <a href="/category/3?search=ốp" className="megamenu-group-title">Ốp lưng & Bao da ⟩</a>
          <a href="/category/3?search=ốp%20lưng%20iphone">Ốp lưng iPhone</a>
          <a href="/category/3?search=ốp%20lưng%20samsung">Ốp lưng Samsung</a>
          <a href="/category/3?search=bao%20da">Bao da cao cấp</a>
        </div>
      </div>
    </div>
  );

  return (
    <header className="fpt-header">
      <div className="header-container">
        
        {/* 1. Logo FPT Shop */}
        <a href="/" className="fpt-logo">
          <span className="logo-fpt">fpt</span>
          <span className="logo-shop">Shop</span>
        </a>

        {/* 2. Nút Danh mục (Megamenu kích hoạt khi Hover) */}
        <div 
          className="menu-btn-wrapper"
          onMouseEnter={() => setMegamenuOpen(true)}
          onMouseLeave={() => setMegamenuOpen(false)}
        >
          <button className="menu-btn">
            <svg className="menu-icon" fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
            Danh mục
          </button>

          {/* Hộp Megamenu lớn */}
          {megamenuOpen && (
            <div className="fpt-megamenu-panel">
              <div className="megamenu-container">
                
                {/* CỘT 1: Sidebar các danh mục chính */}
                <div className="megamenu-sidebar">
                  <div 
                    className={`sidebar-item ${activeCategory === "PHONE" ? "active" : ""}`}
                    onMouseEnter={() => setActiveCategory("PHONE")}
                    onClick={() => window.location.href = "/category/1"}
                  >
                    📱 Điện thoại
                  </div>
                  <div 
                    className={`sidebar-item ${activeCategory === "LAPTOP" ? "active" : ""}`}
                    onMouseEnter={() => setActiveCategory("LAPTOP")}
                    onClick={() => window.location.href = "/category/2"}
                  >
                    💻 Laptop
                  </div>
                  <div 
                    className={`sidebar-item ${activeCategory === "APPLIANCE" ? "active" : ""}`}
                    onMouseEnter={() => setActiveCategory("APPLIANCE")}
                    onClick={() => window.location.href = "/category/4"}
                  >
                    📺 Điện máy
                  </div>
                  <div 
                    className={`sidebar-item ${activeCategory === "ACCESSORY" ? "active" : ""}`}
                    onMouseEnter={() => setActiveCategory("ACCESSORY")}
                    onClick={() => window.location.href = "/category/3"}
                  >
                    🎧 Phụ kiện
                  </div>

                  <div className="sidebar-divider">Chuyên trang thương hiệu</div>
                  <div className="sidebar-brands-list">
                    <span>🍎 Apple</span>
                    <span>📱 Samsung</span>
                    <span>📺 LG</span>
                    <span>🔋 Xiaomi</span>
                    <span>⌚ Garmin</span>
                  </div>
                  
                  <div className="sidebar-divider">Điện tử, điện lạnh</div>
                  <div className="sidebar-brands-list font-small">
                    <span>📺 Tivi, Máy lạnh</span>
                    <span>🧊 Tủ lạnh, Tủ mát</span>
                    <span>🧼 Máy giặt, Máy sấy</span>
                  </div>
                </div>

                {/* CỘT 2: Nội dung tương ứng với danh mục đang hover */}
                <div className="megamenu-content">
                  {activeCategory === "PHONE" && renderPhoneContent()}
                  {activeCategory === "LAPTOP" && renderLaptopContent()}
                  {activeCategory === "APPLIANCE" && renderApplianceContent()}
                  {activeCategory === "ACCESSORY" && renderAccessoryContent()}
                </div>

                {/* CỘT 3: Các tiện ích & Banner quảng cáo góc phải */}
                <div className="megamenu-utilities">
                  <div className="util-item-row">
                    <span className="util-icon">📱</span>
                    <div className="util-text">
                      <strong>Máy cũ</strong>
                      <span>Thu cũ đổi mới giá hời</span>
                    </div>
                  </div>

                  <div className="util-item-row">
                    <span className="util-icon">📰</span>
                    <div className="util-text">
                      <strong>Thông tin hay</strong>
                      <span>Tin công nghệ mới nhất</span>
                    </div>
                  </div>

                  <div className="util-item-row">
                    <span className="util-icon">💳</span>
                    <div className="util-text">
                      <strong>Sim thẻ & Tiện ích</strong>
                      <span>Nạp tiền điện thoại, hóa đơn</span>
                    </div>
                  </div>

                  <div className="util-item-row">
                    <span className="util-icon">🤝</span>
                    <div className="util-text">
                      <strong>Đặc quyền đối tác</strong>
                      <span>Chiết khấu cao</span>
                    </div>
                  </div>

                  <div className="util-item-row">
                    <span className="util-icon">🏢</span>
                    <div className="util-text">
                      <strong>Chiết khấu doanh nghiệp</strong>
                      <span>Ưu đãi lớn cho cty</span>
                    </div>
                  </div>

                  {/* Banner mini quảng cáo trong megamenu */}
                  <div className="megamenu-ad-banner">
                    <img 
                      src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80" 
                      alt="Megamenu Promo"
                    />
                    <div className="ad-badge">AD</div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* 3. Thanh tìm kiếm & Gợi ý từ khóa nhanh ở dưới */}
        <div className="search-section">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="Nhập tên điện thoại, laptop, phụ kiện... cần tìm" 
              className="search-input"
            />
            <button className="search-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </div>
          
          <div className="quick-tags">
            <span>iphone 17</span>
            <span>laptop</span>
            <span>samsung</span>
            <span>iphone 16</span>
            <span>macbook</span>
            <span>máy lạnh</span>
            <span>phần mềm</span>
            <span>tivi</span>
          </div>
        </div>

        {/* 4. Nhóm tiện ích (User & Giỏ hàng) */}
        <div className="utility-group">
          {/* Nút tài khoản hình tròn hoặc tên người dùng đăng nhập */}
          {username ? (
            <div className="user-logged-in-box">
              <span className="user-greeting">Chào, {username}</span>
              {userRole === "ADMIN" && (
                <a href="/admin" className="btn-admin-link" target="_blank" rel="noopener noreferrer">⚙️ Quản trị</a>
              )}
              <button onClick={handleLogout} className="btn-logout-small">Đăng xuất</button>
            </div>
          ) : (
            <a href="/auth" className="user-icon-btn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </a>
          )}

          {/* Nút Giỏ hàng hình con nhộng màu đen */}
          <a href="/cart" className="cart-pill-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span>Giỏ hàng</span>
          </a>
        </div>

      </div>
    </header>
  );
}





          


