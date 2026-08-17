"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái phản hồi sự hài lòng của khách hàng
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Bộ lọc danh mục của phần Flash Sale
  const [flashSaleTab, setFlashSaleTab] = useState("ALL");

  // Ref điều khiển cuộn cho đường chạy banner chung
  const sliderRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Ref điều khiển cuộn cho danh mục gợi ý "Gợi ý cho bạn"
  const categoriesScrollRef = useRef(null);

  const banners = [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&q=80", 
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80", 
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&q=80", 
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=700&q=80", 
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80", 
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&q=80"  
  ];

  const suggestionCategories = [
    { name: "Camera an ninh", img: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=150&q=80" },
    { name: "Máy sấy quần áo", img: "https://images.unsplash.com/photo-1545173168-9f19472ef7f4?w=150&q=80" },
    { name: "Điện gia dụng", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&q=80" },
    { name: "Quạt máy", img: "https://images.unsplash.com/photo-1618945037805-e970a04944d1?w=150&q=80" },
    { name: "Thiết bị bếp", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&q=80" },
    { name: "Nồi cơm điện", img: "https://images.unsplash.com/photo-1590794056226-79ef3a814c99?w=150&q=80" },
    { name: "Máy xay sinh tố", img: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=150&q=80" },
    { name: "Loa", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=150&q=80" },
    { name: "Sạc cáp", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&q=80" },
    { name: "Tai nghe", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80" },
    { name: "Sạc dự phòng", img: "https://images.unsplash.com/photo-1609592424083-d5d1796d115e?w=150&q=80" },
    { name: "Ốp lưng", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150&q=80" },
    { name: "Bao da", img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=150&q=80" },
    { name: "Chuột", img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&q=80" },
    { name: "Bàn phím", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&q=80" },
    { name: "Nồi chiên không dầu", img: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=150&q=80" },
    { name: "Cây nước nóng lạnh", img: "https://images.unsplash.com/photo-1585620387744-8cbab83215c2?w=150&q=80" },
    { name: "Máy hút ẩm", img: "https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?w=150&q=80" },
    { name: "Máy cũ", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&q=80" }
  ];

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
  }, []);

  // Ánh xạ linh hoạt từ tên danh mục gợi ý sang URL Category ID trong DB
  const getCategoryLink = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes("điện thoại") || name.includes("phone")) return "/category/1";
    if (name.includes("laptop") || name.includes("máy tính")) return "/category/2";
    if (name.includes("phụ kiện") || name.includes("tai nghe") || name.includes("sạc") || name.includes("ốp") || name.includes("bao da") || name.includes("loa") || name.includes("chuột") || name.includes("bàn phím")) return "/category/3";
    return "#";
  };

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

  // Cuộn slide danh mục gợi ý
  const handleScrollCategories = (direction) => {
    if (categoriesScrollRef.current) {
      const container = categoriesScrollRef.current;
      const scrollAmount = container.clientWidth / 2;
      const targetScroll = container.scrollLeft + (direction === "next" ? scrollAmount : -scrollAmount);
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
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

  // Lọc sản phẩm hiển thị riêng cho khu vực Flash Sale khi bấm tab
  const getFlashSaleProducts = () => {
    if (flashSaleTab === "ALL") return products;
    if (flashSaleTab === "PHONE") return phones;
    if (flashSaleTab === "LAPTOP") return laptops;
    if (flashSaleTab === "ACCESSORY") return accessories;
    return products;
  };

  const flashSaleList = getFlashSaleProducts();

  return (
    <div className="home-container">
      
      {/* 1. KHU VỰC 5 KHUNG BADGE QUẢNG CÁO */}
      <section className="promo-badges-row">
        <div className="badge-item">
          <div className="badge-icon-box">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&q=80" alt="App" />
          </div>
          <span>Tải App nhận voucher 10%</span>
        </div>

        <div className="badge-item">
          <div className="badge-icon-box">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&q=80" alt="HSSV" />
          </div>
          <span>HSSV Giảm thêm đến 10%</span>
        </div>

        <div className="badge-item">
          <div className="badge-icon-box">
            <img src="https://images.unsplash.com/photo-1562408590-e32931084e23?w=150&q=80" alt="Sim" />
          </div>
          <span>Rẻ hơn khi mua kèm Sim</span>
        </div>

        <div className="badge-item">
          <div className="badge-icon-box">
            <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&q=80" alt="Gia dung" />
          </div>
          <span>Gia dụng bảo hành 1 đổi 1</span>
        </div>

        <div className="badge-item">
          <div className="badge-icon-box">
            <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&q=80" alt="Thu cu" />
          </div>
          <span>Trợ giá thu cũ đổi mới</span>
        </div>
      </section>

      {/* 2. KHU VỰC ĐƯỜNG CHẠY BANNER CHUNG */}
      <section className="single-track-slider-container">
        <button className="slider-arrow-btn left" onClick={() => handleArrowClick("prev")}>
          ⟨
        </button>
        
        <div className="banner-slides-wrapper" ref={sliderRef} onScroll={handleScroll}>
          {banners.map((url, idx) => (
            <div className="banner-slide" key={idx}>
              <img src={url} alt={`Banner ${idx + 1}`} />
            </div>
          ))}
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

      {/* 4. SẢN PHẨM KHUYẾN MÃI HOT (SHOPEE STYLE - FLASH SALE) */}
      <section className="shopee-flashsale-section">
        <div className="shopee-flashsale-header">
          <div className="flashsale-title">
            <span className="lightning-icon">⚡</span>
            <h2>FLASH SALE</h2>
            <div className="countdown-timer">
              <span>02</span>:<span>45</span>:<span>18</span>
            </div>
          </div>
          
          <div className="shopee-tabs">
            <button className={`tab-item ${flashSaleTab === "ALL" ? "active" : ""}`} onClick={() => setFlashSaleTab("ALL")}>
              Gợi ý cho bạn
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
              const originalPrice = Math.round(prod.price * 1.35);
              
              return (
                <div className="shopee-product-card" key={prod.id}>
                  <div className="shopee-discount-badge">
                    <span>GIẢM</span>
                    <strong>35%</strong>
                  </div>

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
                    <span className="shopee-original-price">
                      {originalPrice.toLocaleString()}đ
                    </span>
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
                  <a href={`/product/${prod.id}`} className="shopee-card-btn">Xem chi tiết</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. GỢI Ý CHO BẠN (DANH MỤC GỢI Ý ĐẶC THÙ CÓ MŨI TÊN DI CHUYỂN KÉO NGANG) */}
      <section className="suggestions-section">
        <h3 className="section-title">Gợi ý cho bạn</h3>
        
        <div className="suggestions-carousel-container">
          <button className="slider-arrow-btn left" onClick={() => handleScrollCategories("prev")}>
            ⟨
          </button>

          <div className="suggestions-carousel-wrapper" ref={categoriesScrollRef}>
            {suggestionCategories.map((cat, idx) => (
              <a 
                href={getCategoryLink(cat.name)} 
                className="suggestion-item" 
                key={idx}
                onClick={(e) => {
                  if (getCategoryLink(cat.name) === "#") {
                    e.preventDefault();
                    alert("Danh mục này đang được cập nhật sản phẩm, vui lòng quay lại sau!");
                  }
                }}
              >
                <div className="suggestion-icon-box">
                  <img src={cat.img} alt={cat.name} />
                </div>
                <span>{cat.name}</span>
              </a>
            ))}
          </div>

          <button className="slider-arrow-btn right" onClick={() => handleScrollCategories("next")}>
            ⟩
          </button>
        </div>
      </section>

      {/* 9. BANNER PHẢN HỒI Ý KIẾN KHÁCH HÀNG (BẠN CÓ HÀI LÒNG KHÔNG?) */}
      <section className="feedback-section-container">
        <div className="feedback-card">
          <div className="feedback-left">
            <h3>Bạn có hài lòng với trải nghiệm trên trang chủ FPT Shop không?</h3>
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
          <span>Theo chính sách đổi trả tại FPT Shop</span>
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