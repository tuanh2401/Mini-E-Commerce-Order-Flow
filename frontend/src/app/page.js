"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái phản hồi sự hài lòng của khách hàng
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Bộ lọc danh mục của phần Flash Sale
  const [flashSaleTab, setFlashSaleTab] = useState("ALL");

  // Ref điều khiển cuộn cho đường chạy banner chung
  const sliderRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleQuickAddToCart = (prod, e) => {
    if (e) e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem("dtm_cart_items") || "[]");
      const index = existing.findIndex(item => item.id === prod.id);
      if (index >= 0) {
        existing[index].quantity += 1;
      } else {
        existing.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 1,
          imageUrl: prod.imageUrl || prod.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
        });
      }
      localStorage.setItem("dtm_cart_items", JSON.stringify(existing));
      window.dispatchEvent(new Event("cart_updated"));

      const token = localStorage.getItem("accessToken");
      if (token) {
        axios.post("http://localhost:8082/api/cart/items", { productId: prod.id, quantity: 1 }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.warn(err));
      }

      setToastMessage(`Đã thêm "${prod.name}" vào giỏ hàng!`);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const [banners, setBanners] = useState([
    { id: 1, imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&q=80", title: "Khuyến mãi 1" },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80", title: "Khuyến mãi 2" },
    { id: 3, imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&q=80", title: "Khuyến mãi 3" },
    { id: 4, imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=700&q=80", title: "Khuyến mãi 4" }
  ]);

  const [promoBadges, setPromoBadges] = useState([
    { id: 1, title: "Tải App nhận voucher 10%", iconUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&q=80", linkUrl: "#" },
    { id: 2, title: "HSSV Giảm thêm đến 10%", iconUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&q=80", linkUrl: "#" },
    { id: 3, title: "Rẻ hơn khi mua kèm Sim", iconUrl: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=150&q=80", linkUrl: "#" },
    { id: 4, title: "Gia dụng bảo hành 1 đổi 1", iconUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&q=80", linkUrl: "#" },
    { id: 5, title: "Trợ giá thu cũ đổi mới", iconUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&q=80", linkUrl: "#" }
  ]);



  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm từ Backend thông qua Gateway
    axios.get("http://localhost:8082/api/products")
      .then(res => {
        const list = res.data.data?.content || res.data.data || [];
        setProducts(list);
      })
      .catch(err => {
        console.error("Lỗi lấy sản phẩm: ", err);
      })
      .finally(() => setLoading(false));

    // Gọi API lấy danh sách Banner từ MinIO / DB
    axios.get("http://localhost:8082/api/products/banners")
      .then(res => {
        const bannerList = res.data?.data || [];
        if (Array.isArray(bannerList) && bannerList.length > 0) {
          setBanners(bannerList);
        }
      })
      .catch(err => {
        console.warn("Chưa tải được banner động, sử dụng banner mặc định", err);
      });

    // Gọi API lấy danh sách Badge quảng cáo từ MinIO / DB
    axios.get("http://localhost:8082/api/products/badges")
      .then(res => {
        const badgeList = res.data?.data || [];
        if (Array.isArray(badgeList) && badgeList.length > 0) {
          setPromoBadges(badgeList);
        }
      })
      .catch(err => {
        console.warn("Chưa tải được badges động, sử dụng mặc định", err);
      });
  }, []);

  // Xử lý hiển thị đường dẫn hình ảnh thông minh (Hỗ trợ cả link ngoài và link MinIO)
  const getProductImage = (imageUrl) => {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    const cleanPath = imageUrl.replace(/^\/+/, "");
    return `http://localhost:9000/products/${cleanPath}`;
  };

  const getProductSpecs = (descString) => {
    try {
      const data = JSON.parse(descString);
      if (data && data.specs) {
        return Object.entries(data.specs).slice(0, 3);
      }
    } catch (e) {
      // Bỏ qua nếu lỗi
    }
    return null;
  };

  // Cuộn slide banner chung
  const handleArrowClick = (direction) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const slideWidth = container.clientWidth / 2;
      const targetScroll = container.scrollLeft + (direction === "next" ? slideWidth : -slideWidth);
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const slideWidth = e.target.clientWidth / 2;
    const index = Math.round(scrollLeft / slideWidth);
    setActiveSlide(index);
  };



  // Phân loại sản phẩm theo Tên Danh mục
  const phones = products.filter(prod => {
    const catName = (prod.categoryName || "").toLowerCase();
    return catName.includes("điện thoại") || catName.includes("phone");
  });

  const laptops = products.filter(prod => {
    const catName = (prod.categoryName || "").toLowerCase();
    return catName.includes("laptop") || catName.includes("máy tính");
  });

  const accessories = products.filter(prod => {
    const catName = (prod.categoryName || "").toLowerCase();
    return catName.includes("phụ kiện") || catName.includes("accessory");
  });

  const appliances = products.filter(prod => {
    const catName = (prod.categoryName || "").toLowerCase();
    return prod.categoryId === 4 || catName.includes("điện máy") || catName.includes("điện tử") || catName.includes("appliance");
  });

  // Lọc sản phẩm hiển thị riêng cho khu vực Flash Sale khi bấm tab
  const getFlashSaleProducts = () => {
    if (flashSaleTab === "ALL") return products;
    if (flashSaleTab === "PHONE") return phones;
    if (flashSaleTab === "LAPTOP") return laptops;
    if (flashSaleTab === "ACCESSORY") return accessories;
    if (flashSaleTab === "APPLIANCE") return appliances;
    return products;
  };

  const flashSaleList = getFlashSaleProducts();

  return (
    <div className="home-container">
      
      {/* 1. KHU VỰC 5 KHUNG BADGE QUẢNG CÁO */}
      <section className="promo-badges-row">
        {promoBadges.map((badge, idx) => {
          const content = (
            <div className="badge-item" key={badge.id || idx}>
              <div className="badge-icon-box">
                <img src={getProductImage(badge.iconUrl)} alt={badge.title} />
              </div>
              <span>{badge.title}</span>
            </div>
          );

          if (badge.linkUrl && badge.linkUrl !== "#") {
            return (
              <a href={badge.linkUrl} key={badge.id || idx} style={{ textDecoration: "none", color: "inherit" }}>
                {content}
              </a>
            );
          }
          return content;
        })}
      </section>

      {/* 2. KHU VỰC ĐƯỜNG CHẠY BANNER CHUNG */}
      <section className="single-track-slider-container">
        <button className="slider-arrow-btn left" onClick={() => handleArrowClick("prev")}>
          ⟨
        </button>
        
        <div className="banner-slides-wrapper" ref={sliderRef} onScroll={handleScroll}>
          {banners.map((item, idx) => {
            const imgUrl = typeof item === "string" ? item : (item.imageUrl || item.image);
            const link = typeof item === "object" && item.linkUrl ? item.linkUrl : "#";
            const title = typeof item === "object" && item.title ? item.title : `Banner ${idx + 1}`;
            return (
              <div className="banner-slide" key={item.id || idx}>
                {link && link !== "#" ? (
                  <a href={link}>
                    <img src={getProductImage(imgUrl)} alt={title} />
                  </a>
                ) : (
                  <img src={getProductImage(imgUrl)} alt={title} />
                )}
              </div>
            );
          })}
        </div>
        
        <button className="slider-arrow-btn right" onClick={() => handleArrowClick("next")}>
          ⟩
        </button>

        <div className="slider-indicator-dots">
          {banners.map((_, i) => (
            <span key={i} className={`dot ${activeSlide === i ? 'active' : ''}`}></span>
          ))}
        </div>
      </section>

      {/* 3. DANH MỤC NỔI BẬT */}
      <section className="product-section">
        <h3 className="section-title">Danh mục nổi bật</h3>
        <div className="promo-badges-row" style={{ marginTop: "10px", marginBottom: "10px" }}>
          {[
            { id: 1, name: "Điện thoại", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&q=80" },
            { id: 2, name: "Laptop", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80" },
            { id: 3, name: "Phụ kiện", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" },
            { id: 4, name: "Điện máy", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80" },
          ].map((cat, idx) => (
            <a href={`/category/${cat.id}`} className="badge-item" key={idx}>
              <div className="badge-icon-box" style={{ borderRadius: "50%" }}>
                <img src={cat.img} alt={cat.name} style={{ objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>{cat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 4. SẢN PHẨM NỔI BẬT & BÁN CHẠY (THAY THẾ FLASH SALE) */}
      <section className="shopee-flashsale-section">
        <div className="shopee-flashsale-header">
          <div className="flashsale-title">
            <span className="lightning-icon" style={{ color: "#ef4444" }}>🔥</span>
            <h2>SẢN PHẨM NỔI BẬT</h2>
          </div>
          
          <div className="shopee-tabs">
            <button className={`tab-item ${flashSaleTab === "ALL" ? "active" : ""}`} onClick={() => setFlashSaleTab("ALL")}>
              Tất cả
            </button>
            <button className={`tab-item ${flashSaleTab === "PHONE" ? "active" : ""}`} onClick={() => setFlashSaleTab("PHONE")}>
              Điện thoại hot
            </button>
            <button className={`tab-item ${flashSaleTab === "LAPTOP" ? "active" : ""}`} onClick={() => setFlashSaleTab("LAPTOP")}>
              Laptop bán chạy
            </button>
            <button className={`tab-item ${flashSaleTab === "ACCESSORY" ? "active" : ""}`} onClick={() => setFlashSaleTab("ACCESSORY")}>
              Phụ kiện giá tốt
            </button>
            <button className={`tab-item ${flashSaleTab === "APPLIANCE" ? "active" : ""}`} onClick={() => setFlashSaleTab("APPLIANCE")}>
              Điện máy hot
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Đang kết nối hệ thống dữ liệu...</p>
        ) : flashSaleList.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Không có sản phẩm nào thuộc danh mục này.</p>
        ) : (
          <div className="shopee-product-grid">
            {flashSaleList.map(prod => {
              const specs = getProductSpecs(prod.description);
              const hasDiscount = prod.originalPrice && Number(prod.originalPrice) > Number(prod.price);
              const discountPercent = hasDiscount ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : 0;
              
              return (
                <div className="shopee-product-card" key={prod.id}>
                  {hasDiscount && (
                    <div className="shopee-discount-badge">
                      <span>GIẢM</span>
                      <strong>{discountPercent}%</strong>
                    </div>
                  )}

                  {/* Bấm vào ảnh dẫn tới chi tiết */}
                  <a href={`/product/${prod.id}`} className="shopee-card-img-box">
                    <img
                      src={getProductImage(prod.imageUrl)}
                      alt={prod.name}
                    />
                  </a>

                  {specs && (
                    <div className="shopee-card-specs">
                      {specs.map(([key, value], index) => (
                        <div className="spec-row" key={index}>
                          <span className="spec-key">{key}:</span>
                          <span className="spec-val">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bấm vào tên dẫn tới chi tiết */}
                  <a href={`/product/${prod.id}`} style={{ textDecoration: "none" }}>
                    <h4 className="shopee-card-title">{prod.name}</h4>
                  </a>

                  <div className="shopee-price-container">
                    <span className="shopee-current-price">
                      {prod.price?.toLocaleString()}đ
                    </span>
                    {hasDiscount && (
                      <span className="shopee-original-price">
                        {Number(prod.originalPrice).toLocaleString()}đ
                      </span>
                    )}
                  </div>

                  <div className="shopee-sales-progress-bar">
                    <div className="progress-fill" style={{ width: "70%" }}></div>
                    <span className="progress-text">🔥 ĐÃ BÁN 24</span>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <a href={`/product/${prod.id}`} className="shopee-card-btn">
                      Xem chi tiết
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. PHÂN KHÚC ĐIỆN THOẠI NỔI BẬT */}
      {phones.length > 0 && (
        <section className="product-section">
          <h3 className="section-title">ĐIỆN THOẠI NỔI BẬT</h3>
          <div className="shopee-product-grid">
            {phones.map(prod => {
              const specs = getProductSpecs(prod.description);
              const originalPrice = Math.round(prod.price * 1.35);
              return (
                <div className="shopee-product-card" key={prod.id}>
                  <div className="shopee-discount-badge">
                    <span>GIẢM</span>
                    <strong>35%</strong>
                  </div>
                  <a href={`/product/${prod.id}`} className="shopee-card-img-box">
                    <img src={getProductImage(prod.imageUrl)} alt={prod.name} />
                  </a>
                  {specs && (
                    <div className="shopee-card-specs">
                      {specs.map(([key, value], idx) => (
                        <div className="spec-row" key={idx}>
                          <span className="spec-key">{key}:</span>
                          <span className="spec-val">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href={`/product/${prod.id}`} style={{ textDecoration: "none" }}>
                    <h4 className="shopee-card-title">{prod.name}</h4>
                  </a>
                  <div className="shopee-price-container">
                    <span className="shopee-current-price">{prod.price?.toLocaleString()}đ</span>
                    <span className="shopee-original-price">{originalPrice.toLocaleString()}đ</span>
                  </div>
                  <a href={`/product/${prod.id}`} className="shopee-card-btn">Xem chi tiết</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. PHÂN KHÚC LAPTOP NỔI BẬT */}
      {laptops.length > 0 && (
        <section className="product-section">
          <h3 className="section-title">LAPTOP NỔI BẬT</h3>
          <div className="shopee-product-grid">
            {laptops.map(prod => {
              const specs = getProductSpecs(prod.description);
              const originalPrice = Math.round(prod.price * 1.35);
              return (
                <div className="shopee-product-card" key={prod.id}>
                  <div className="shopee-discount-badge">
                    <span>GIẢM</span>
                    <strong>35%</strong>
                  </div>
                  <a href={`/product/${prod.id}`} className="shopee-card-img-box">
                    <img src={getProductImage(prod.imageUrl)} alt={prod.name} />
                  </a>
                  {specs && (
                    <div className="shopee-card-specs">
                      {specs.map(([key, value], idx) => (
                        <div className="spec-row" key={idx}>
                          <span className="spec-key">{key}:</span>
                          <span className="spec-val">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href={`/product/${prod.id}`} style={{ textDecoration: "none" }}>
                    <h4 className="shopee-card-title">{prod.name}</h4>
                  </a>
                  <div className="shopee-price-container">
                    <span className="shopee-current-price">{prod.price?.toLocaleString()}đ</span>
                    <span className="shopee-original-price">{originalPrice.toLocaleString()}đ</span>
                  </div>
                  <a href={`/product/${prod.id}`} className="shopee-card-btn">Xem chi tiết</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. PHÂN KHÚC PHỤ KIỆN NỔI BẬT */}
      {accessories.length > 0 && (
        <section className="product-section">
          <h3 className="section-title">PHỤ KIỆN NỔI BẬT</h3>
          <div className="shopee-product-grid">
            {accessories.map(prod => {
              const specs = getProductSpecs(prod.description);
              const originalPrice = Math.round(prod.price * 1.35);
              return (
                <div className="shopee-product-card" key={prod.id}>
                  <div className="shopee-discount-badge">
                    <span>GIẢM</span>
                    <strong>35%</strong>
                  </div>
                  <a href={`/product/${prod.id}`} className="shopee-card-img-box">
                    <img src={getProductImage(prod.imageUrl)} alt={prod.name} />
                  </a>
                  {specs && (
                    <div className="shopee-card-specs">
                      {specs.map(([key, value], idx) => (
                        <div className="spec-row" key={idx}>
                          <span className="spec-key">{key}:</span>
                          <span className="spec-val">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href={`/product/${prod.id}`} style={{ textDecoration: "none" }}>
                    <h4 className="shopee-card-title">{prod.name}</h4>
                  </a>
                  <div className="shopee-price-container">
                    <span className="shopee-current-price">{prod.price?.toLocaleString()}đ</span>
                    <span className="shopee-original-price">{originalPrice.toLocaleString()}đ</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <a href={`/product/${prod.id}`} className="shopee-card-btn" style={{ background: "#f1f5f9", color: "#334155", padding: "8px 4px", fontSize: "13px" }}>Xem chi tiết</a>
                    <button 
                      onClick={(e) => handleQuickAddToCart(prod, e)} 
                      className="shopee-card-btn"
                      style={{ padding: "8px 4px", fontSize: "13px" }}
                    >
                      🛒 Thêm giỏ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. PHÂN KHÚC ĐIỆN TỬ - ĐIỆN LẠNH NỔI BẬT */}
      {appliances.length > 0 && (
        <section className="product-section">
          <h3 className="section-title">ĐIỆN TỬ - ĐIỆN LẠNH NỔI BẬT</h3>
          <div className="shopee-product-grid">
            {appliances.map(prod => {
              const specs = getProductSpecs(prod.description);
              const originalPrice = prod.originalPrice || Math.round(prod.price * 1.25);
              const hasDiscount = originalPrice && Number(originalPrice) > Number(prod.price);
              const discountPercent = hasDiscount ? Math.round(((originalPrice - prod.price) / originalPrice) * 100) : 0;
              return (
                <div className="shopee-product-card" key={prod.id}>
                  {hasDiscount && (
                    <div className="shopee-discount-badge">
                      <span>GIẢM</span>
                      <strong>{discountPercent}%</strong>
                    </div>
                  )}
                  <a href={`/product/${prod.id}`} className="shopee-card-img-box">
                    <img src={getProductImage(prod.imageUrl)} alt={prod.name} />
                  </a>
                  {specs && (
                    <div className="shopee-card-specs">
                      {specs.map(([key, value], idx) => (
                        <div className="spec-row" key={idx}>
                          <span className="spec-key">{key}:</span>
                          <span className="spec-val">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href={`/product/${prod.id}`} style={{ textDecoration: "none" }}>
                    <h4 className="shopee-card-title">{prod.name}</h4>
                  </a>
                  <div className="shopee-price-container">
                    <span className="shopee-current-price">{prod.price?.toLocaleString()}đ</span>
                    {hasDiscount && (
                      <span className="shopee-original-price">{Number(originalPrice).toLocaleString()}đ</span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <a href={`/product/${prod.id}`} className="shopee-card-btn" style={{ background: "#f1f5f9", color: "#334155", padding: "8px 4px", fontSize: "13px" }}>Xem chi tiết</a>
                    <button 
                      onClick={(e) => handleQuickAddToCart(prod, e)} 
                      className="shopee-card-btn"
                      style={{ padding: "8px 4px", fontSize: "13px" }}
                    >
                      🛒 Thêm giỏ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TOAST POPUP KHI THÊM VÀO GIỎ HÀNG TỪ TRANG CHỦ */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: "100px",
          right: "24px",
          backgroundColor: "#059669",
          color: "white",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          animation: "slideUp 0.25s ease-out"
        }}>
          <span style={{ fontSize: "28px" }}>🎉</span>
          <div>
            <strong style={{ display: "block", fontSize: "16px", fontWeight: "800" }}>Thêm vào giỏ hàng thành công!</strong>
            <span style={{ fontSize: "14px", opacity: 0.9 }}>{toastMessage}</span>
          </div>
          <a 
            href="/cart" 
            style={{ 
              backgroundColor: "white", 
              color: "#059669", 
              padding: "9px 18px", 
              borderRadius: "10px", 
              textDecoration: "none", 
              fontWeight: "800",
              fontSize: "14px",
              marginLeft: "10px"
            }}
          >
            Xem giỏ hàng →
          </a>
        </div>
      )}



      {/* 9. BANNER PHẢN HỒI Ý KIẾN KHÁCH HÀNG (BẠN CÓ HÀI LÒNG KHÔNG?) */}
      <section className="feedback-section-container">
        <div className="feedback-card">
          <div className="feedback-left">
            <h3>Bạn có hài lòng với trải nghiệm trên trang chủ DungThamMobile không?</h3>
            {!feedbackSubmitted ? (
              <div className="feedback-buttons">
                <button className="btn-satisfied" onClick={() => setFeedbackSubmitted(true)}>
                  Hài lòng
                </button>
                <button className="btn-unsatisfied" onClick={() => setFeedbackSubmitted(true)}>
                  Không hài lòng
                </button>
              </div>
            ) : (
              <p className="feedback-thanks">🎉 Cảm ơn bạn đã đóng góp ý kiến để giúp chúng tôi cải thiện trải nghiệm!</p>
            )}
          </div>
          
          <div className="feedback-right">
            <img 
              src="https://images.unsplash.com/photo-1521791136064-7986c2959d43?w=150&q=80" 
              alt="Feedback stars"
            />
          </div>
        </div>
      </section>

      {/* 10. HÀNG BỐN TIÊU CHÍ CAM KẾT THƯƠNG HIỆU */}
      <section className="brand-commitments-row">
        <div className="commitment-item">
          <div className="commitment-icon-box">🛡️</div>
          <strong>Thương hiệu đảm bảo</strong>
          <span>Nhập khẩu, bảo hành chính hãng</span>
        </div>
        
        <div className="commitment-item">
          <div className="commitment-icon-box">🔄</div>
          <strong>Đổi trả dễ dàng</strong>
          <span>Theo chính sách đổi trả tại DungThamMobile</span>
        </div>

        <div className="commitment-item">
          <div className="commitment-icon-box">🚚</div>
          <strong>Giao hàng tận nơi</strong>
          <span>Trên toàn quốc</span>
        </div>

        <div className="commitment-item">
          <div className="commitment-icon-box">🎖️</div>
          <strong>Sản phẩm chất lượng</strong>
          <span>Đảm bảo tương thích và độ bền cao</span>
        </div>
      </section>

    </div>
  );
}