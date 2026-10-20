"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/app/lib/api";

export default function Header() {
  const [megamenuOpen, setMegamenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("PHONE"); // PHONE | LAPTOP | APPLIANCE | ACCESSORY

  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const userMenuRef = useRef(null);
  const megamenuRef = useRef(null);
  const menuBtnRef = useRef(null);
  const megamenuTimeoutRef = useRef(null);

  // Trạng thái tìm kiếm sản phẩm & Live Search
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchWrapperRef = useRef(null);

  const handleMouseEnterMenu = () => {
    if (megamenuTimeoutRef.current) {
      clearTimeout(megamenuTimeoutRef.current);
      megamenuTimeoutRef.current = null;
    }
    setMegamenuOpen(true);
  };

  const handleMouseLeaveMenu = () => {
    if (megamenuTimeoutRef.current) {
      clearTimeout(megamenuTimeoutRef.current);
    }
    megamenuTimeoutRef.current = setTimeout(() => {
      setMegamenuOpen(false);
    }, 280);
  };

  const toggleMegamenu = (e) => {
    if (e) e.stopPropagation();
    if (megamenuTimeoutRef.current) {
      clearTimeout(megamenuTimeoutRef.current);
      megamenuTimeoutRef.current = null;
    }
    setMegamenuOpen(prev => !prev);
  };

  const updateCartCount = () => {
    try {
      const local = JSON.parse(localStorage.getItem("dtm_cart_items") || "[]");
      const count = local.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (e) {}
  };

  const syncUserAvatar = () => {
    try {
      const savedAvatar = localStorage.getItem("userAvatar") || "";
      setUserAvatar(savedAvatar);
    } catch (e) {}
  };

  const resetUser = () => {
    setUsername("");
    setUserRole("");
    setUserAvatar("");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const validToken = token && token !== "null" && token !== "undefined" ? token : null;
      const validRefresh = refreshToken && refreshToken !== "null" && refreshToken !== "undefined" ? refreshToken : null;

      // 1. Nếu không có token nào trong storage -> Xóa toàn bộ dữ liệu người dùng cũ
      if (!validToken && !validRefresh) {
        localStorage.removeItem("username");
        localStorage.removeItem("userAvatar");
        localStorage.removeItem("userId");
        resetUser();
      } else {
        // 2. Nếu có token, đọc tạm role
        if (validToken) {
          try {
            const payload = JSON.parse(atob(validToken.split(".")[1]));
            setUserRole(payload.role || payload.roles || "");
          } catch (e) {}
        }

        // Tự động kiểm tra tính hợp lệ của phiên đăng nhập từ backend
        api.get("/users/me").then(res => {
          const d = res.data?.data;
          if (d) {
            const name = d.fullName || d.username || "";
            if (name) {
              setUsername(name);
              localStorage.setItem("username", name);
            }
            if (d.avatarUrl) {
              setUserAvatar(d.avatarUrl);
              localStorage.setItem("userAvatar", d.avatarUrl);
            }
          }
        }).catch((err) => {
          console.warn("Phiên đăng nhập không còn hiệu lực trên backend:", err.message);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("username");
          localStorage.removeItem("userAvatar");
          localStorage.removeItem("userId");
          resetUser();
        });
      }
      updateCartCount();
    }

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (
        megamenuRef.current &&
        !megamenuRef.current.contains(event.target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(event.target)
      ) {
        setMegamenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("cart_updated", updateCartCount);
    window.addEventListener("avatar_updated", syncUserAvatar);
    window.addEventListener("session_expired", resetUser);

    return () => {
      if (megamenuTimeoutRef.current) {
        clearTimeout(megamenuTimeoutRef.current);
      }
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("cart_updated", updateCartCount);
      window.removeEventListener("avatar_updated", syncUserAvatar);
      window.removeEventListener("session_expired", resetUser);
    };
  }, []);

  // Lắng nghe và gợi ý sản phẩm tức thì (Debounced Live Search)
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`http://localhost:8082/api/products?name=${encodeURIComponent(searchTerm.trim())}&size=5`);
        const list = res.data?.data?.content || res.data?.data || [];
        setSuggestions(list);
        setShowSuggestions(true);
      } catch (err) {
        console.warn("Lỗi tìm kiếm gợi ý:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSelectQuickTag = (tag) => {
    setSearchTerm(tag);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  const getSuggestionImage = (imageUrl) => {
    if (!imageUrl) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    return `http://localhost:9000/products/${imageUrl.replace(/^\/+/, "")}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userAvatar");
    setUsername("");
    setUserRole("");
    setUserAvatar("");
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
        <a href="/category/4?search=máy%20lạnh" style={{ textDecoration: "none", color: "inherit" }}><span>❄️ Máy lạnh 1 chiều</span></a>
        <a href="/category/4?search=tivi" style={{ textDecoration: "none", color: "inherit" }}><span>📺 Tivi 4K</span></a>
        <a href="/category/4?search=oled" style={{ textDecoration: "none", color: "inherit" }}><span>📺 Tivi QLED</span></a>
        <a href="/category/4?search=máy%20giặt" style={{ textDecoration: "none", color: "inherit" }}><span>🧼 Máy giặt cửa trước</span></a>
        <a href="/category/4?search=tủ%20lạnh" style={{ textDecoration: "none", color: "inherit" }}><span>🧊 Tủ lạnh Inverter</span></a>
      </div>

      <div className="megamenu-grid-cols">
        <div className="megamenu-col">
          <a href="/category/4?search=tivi" className="megamenu-group-title">Tivi ⟩</a>
          <a href="/category/4?search=qled">Tivi QLED</a>
          <a href="/category/4?search=4k">Tivi 4K</a>
          <a href="/category/4?search=samsung">Smart TV Samsung</a>
          
          <a href="/category/4?search=máy%20giặt" className="megamenu-group-title" style={{ marginTop: "12px" }}>Máy giặt ⟩</a>
          <a href="/category/4?search=cửa%20trước">Máy giặt cửa trước</a>
          <a href="/category/4?search=lg">Máy giặt LG</a>
          <a href="/category/4?search=sấy">Máy giặt sấy</a>
        </div>

        <div className="megamenu-col">
          <a href="/category/4?search=máy%20lạnh" className="megamenu-group-title">Máy lạnh - Điều hòa ⟩</a>
          <a href="/category/4?search=inverter">Máy lạnh Inverter</a>
          <a href="/category/4?search=daikin">Điều hòa Daikin</a>
          <a href="/category/4?search=panasonic">Điều hòa Panasonic</a>
          
          <a href="/category/4?search=sấy" className="megamenu-group-title" style={{ marginTop: "12px" }}>Máy sấy ⟩</a>
          <a href="/category/4?search=sấy%20thông%20hơi">Sấy thông hơi</a>
          <a href="/category/4?search=sấy%20bơm%20nhiệt">Sấy bơm nhiệt</a>
        </div>

        <div className="megamenu-col">
          <a href="/category/4?search=tủ%20lạnh" className="megamenu-group-title">Tủ lạnh ⟩</a>
          <a href="/category/4?search=inverter">Tủ lạnh Inverter</a>
          <a href="/category/4?search=samsung">Tủ lạnh Samsung</a>
          <a href="/category/4?search=panasonic">Tủ lạnh Panasonic</a>
          <a href="/category/4?search=2%20cửa">Tủ lạnh 2 cửa</a>

          <a href="/category/4?search=tủ%20đông" className="megamenu-group-title" style={{ marginTop: "12px" }}>Tủ đông &amp; Khác ⟩</a>
          <a href="/category/4?search=phụ%20kiện">Phụ kiện điện máy</a>
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
        
        {/* 1. Logo DungThamMobile */}
        <a href="/" className="fpt-logo">
          <span className="logo-fpt">DungTham</span>
          <span className="logo-shop">Mobile</span>
        </a>

        {/* 2. Nút Danh mục (Hỗ trợ cả Click ghim menu và Hover mượt mà) */}
        <div 
          className="menu-btn-wrapper"
          onMouseEnter={handleMouseEnterMenu}
          onMouseLeave={handleMouseLeaveMenu}
        >
          <button 
            ref={menuBtnRef}
            className={`menu-btn ${megamenuOpen ? "active" : ""}`}
            onClick={toggleMegamenu}
            type="button"
          >
            <svg className="menu-icon" fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
            Danh mục
          </button>

          {/* Hộp Megamenu lớn */}
          {megamenuOpen && (
            <div 
              ref={megamenuRef}
              className="fpt-megamenu-panel"
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
            >
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
        <div className="search-section" ref={searchWrapperRef} style={{ position: "relative" }}>
          <form onSubmit={handleSearchSubmit} className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="Nhập tên điện thoại, laptop, phụ kiện... cần tìm" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim().length >= 2 && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(""); setSuggestions([]); setShowSuggestions(false); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Xóa từ khóa"
              >
                ✕
              </button>
            )}
            <button type="submit" className="search-btn" title="Tìm kiếm">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>

          {/* Live Search Popup Dropdown */}
          {showSuggestions && (
            <div style={{
              position: "absolute",
              top: "54px",
              left: 0,
              right: 0,
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
              border: "1px solid #e2e8f0",
              zIndex: 9999,
              overflow: "hidden"
            }}>
              <div style={{
                padding: "10px 16px",
                background: "#f8fafc",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: "#64748b"
              }}>
                <span>GỢI Ý SẢN PHẨM PHÙ HỢP</span>
                {isSearching && <span style={{ color: "#cd1c22" }}>⏳ Đang tìm...</span>}
              </div>

              {suggestions.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                  {isSearching ? "Đang tra cứu sản phẩm..." : `Không tìm thấy sản phẩm nào khớp với "${searchTerm}".`}
                </div>
              ) : (
                <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                  {suggestions.map(item => (
                    <a
                      key={item.id}
                      href={`/product/${item.id}`}
                      onClick={() => setShowSuggestions(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 16px",
                        textDecoration: "none",
                        borderBottom: "1px solid #f8fafc",
                        transition: "background 0.15s",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <img 
                        src={getSuggestionImage(item.imageUrl)} 
                        alt={item.name}
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {item.name}
                        </div>
                        {item.categoryName && (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {item.categoryName}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#cd1c22" }}>
                          {item.price != null ? Number(item.price).toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                        </div>
                        {item.stock != null && item.stock <= 5 && (
                          <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>
                            Còn {item.stock} máy
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                  
                  <div 
                    onClick={handleSearchSubmit}
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      background: "#fff1f2",
                      color: "#cd1c22",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      borderTop: "1px solid #fecdd3"
                    }}
                  >
                    🔍 Xem tất cả kết quả cho "{searchTerm}" →
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="quick-tags">
            {["iPhone 16", "Laptop", "Samsung", "MacBook", "Tai nghe", "iPad"].map(tag => (
              <span key={tag} onClick={() => handleSelectQuickTag(tag)}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Nhóm tiện ích (Thông báo, User & Giỏ hàng) */}
        <div className="utility-group">
          
          {/* Icon Chuông thông báo */}
          <button 
            className="bell-icon-btn" 
            title="Thông báo của tôi"
            onClick={() => alert("Bạn không có thông báo mới nào!")}
          >
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>

          {/* Nút Avatar User & Dropdown Menu */}
          <div className="user-menu-wrapper" ref={userMenuRef}>
            {username ? (
              <>
                <button 
                  className="user-avatar-btn" 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title={`Tài khoản: ${username}`}
                >
                  <div className="avatar-circle" style={{ overflow: "hidden", padding: 0 }}>
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={username} 
                        onError={() => {
                          setUserAvatar("");
                          localStorage.removeItem("userAvatar");
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "white",
                        fontWeight: "800",
                        fontSize: "18px",
                        textTransform: "uppercase"
                      }}>
                        {username ? username.charAt(0) : "👤"}
                      </div>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu xổ xuống chuẩn FPT Shop khi nhấp vào icon User */}
                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt={username} 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #f59e0b" }}
                        />
                      ) : (
                        <div style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #f59e0b, #d97706)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          color: "white",
                          fontWeight: "800",
                          textTransform: "uppercase"
                        }}>
                          {username ? username.charAt(0) : "👤"}
                        </div>
                      )}
                      <div>
                        <div className="user-name-title" style={{ fontSize: "15px", fontWeight: "700" }}>{username}</div>
                        <span className="user-role-badge">
                          {userRole === "ADMIN" ? "👑 Quản trị viên" : (userRole === "STAFF" ? "🛵 Nhân viên" : "✨ Thành viên")}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-menu-list">
                      <a href="/profile" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <span className="item-icon">👤</span>
                        <span>Hồ sơ & Hạng thành viên</span>
                      </a>

                      <a href="/orders" className="user-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <span className="item-icon">📦</span>
                        <span>Đơn hàng của tôi</span>
                      </a>

                      <div className="user-dropdown-item" onClick={() => { alert("Bạn không có thông báo mới nào!"); setUserDropdownOpen(false); }}>
                        <span className="item-icon">🔔</span>
                        <span>Thông báo của tôi</span>
                      </div>

                      <div className="user-dropdown-item" onClick={() => { alert("Kho ưu đãi đang được cập nhật!"); setUserDropdownOpen(false); }}>
                        <span className="item-icon">🎁</span>
                        <span>Ưu đãi của tôi</span>
                      </div>

                      <div className="user-dropdown-item" onClick={() => { alert("Lịch sử điểm thưởng: 150 điểm"); setUserDropdownOpen(false); }}>
                        <span className="item-icon">🕒</span>
                        <span>Lịch sử điểm thưởng</span>
                      </div>

                      {/* ĐÃ BỎ "DỊCH VỤ THU HỘ" THEO YÊU CẦU CỦA KHÁCH HÀNG */}

                      <div className="user-dropdown-item" onClick={() => { alert("Tra cứu bảo hành tại DungThamMobile"); setUserDropdownOpen(false); }}>
                        <span className="item-icon">🛡️</span>
                        <span>Thông tin bảo hành</span>
                      </div>

                      <div className="user-dropdown-item" onClick={() => { alert("Sổ địa chỉ: Cửa hàng Dũng Thẩm Mobile - Hà Nam"); setUserDropdownOpen(false); }}>
                        <span className="item-icon">📍</span>
                        <span>Sổ địa chỉ nhận hàng</span>
                      </div>

                      {userRole === "ADMIN" && (
                        <a href="/admin" className="user-dropdown-item admin-item" target="_blank" rel="noopener noreferrer">
                          <span className="item-icon">⚙️</span>
                          <span>Trang Quản trị Admin</span>
                        </a>
                      )}

                      <div className="dropdown-divider"></div>

                      <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                        <span className="item-icon">🚪</span>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <a href="/auth" className="user-avatar-btn link-btn" title="Đăng nhập / Đăng ký">
                <div className="avatar-circle">
                  <svg width="24" height="24" fill="#d97706" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </a>
            )}
          </div>

          {/* Nút Giỏ hàng hình con nhộng màu đen */}
          <a href="/cart" className="cart-pill-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span>Giỏ hàng {cartCount > 0 && <strong style={{ color: "#facc15", marginLeft: "4px" }}>({cartCount})</strong>}</span>
          </a>
        </div>

      </div>
    </header>
  );
}





          


