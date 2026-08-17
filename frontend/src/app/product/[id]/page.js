"use client";
import React, { useState, useEffect, use } from "react";
import axios from "axios";

export default function ProductDetailPage({ params }) {
  // Giải nén async params trong Next.js 15/16
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Trạng thái mua hàng
  const [cartSuccess, setCartSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const API_GATEWAY = "http://localhost:8082/api";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg("");

    axios.get(`${API_GATEWAY}/products/${id}`)
      .then(res => {
        setProduct(res.data.data);
      })
      .catch(err => {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        setErrorMsg("Không tìm thấy sản phẩm hoặc hệ thống đang bận. Vui lòng quay lại sau!");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getProductImage = (imageUrl) => {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80";
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    return `http://localhost:9000/products/${imageUrl.replace(/^\/+/, "")}`;
  };

  // Trích xuất cấu hình (specs) và mô tả HTML từ JSON trường description
  const parseDescription = (descString) => {
    try {
      const parsed = JSON.parse(descString);
      return {
        specs: parsed.specs ? Object.entries(parsed.specs) : [],
        htmlDesc: parsed.html_desc || ""
      };
    } catch (e) {
      // Nếu không phải là chuỗi JSON hợp lệ, coi như chuỗi mô tả thuần
      return {
        specs: [],
        htmlDesc: `<p>${descString || ""}</p>`
      };
    }
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 3000);
    // Trong thực tế, bạn có thể gọi API giỏ hàng: POST /api/carts/items
    alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng thành công!`);
  };

  if (loading) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ color: "#888", fontSize: "16px" }}>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ color: "var(--fpt-red)", fontSize: "16px", fontWeight: "700" }}>{errorMsg || "Sản phẩm không tồn tại."}</p>
        <a href="/" className="auth-link" style={{ marginTop: "20px", display: "inline-block" }}>Quay lại Trang chủ</a>
      </div>
    );
  }

  const { specs, htmlDesc } = parseDescription(product.description);
  const originalPrice = Math.round(product.price * 1.35);

  return (
    <div className="home-container" style={{ paddingTop: "20px" }}>
      
      {/* Breadcrumbs điều hướng */}
      <div className="breadcrumbs">
        <a href="/">Trang chủ</a> <span>/</span> 
        <a href={`/category/${product.categoryId}`}>{product.categoryName || "Danh mục"}</a> <span>/</span>
        <strong>{product.name}</strong>
      </div>

      {/* THÔNG TIN CHI TIẾT SẢN PHẨM (2 CỘT) */}
      <div className="product-detail-wrapper" style={{ marginTop: "20px" }}>
        
        {/* Cột trái: Hình ảnh sản phẩm lớn */}
        <div className="detail-img-col">
          <div className="detail-image-box">
            <img src={getProductImage(product.imageUrl)} alt={product.name} />
          </div>
          <div className="detail-badge-discount">
            GIẢM 35%
          </div>
        </div>

        {/* Cột phải: Thông tin giá cả, lựa chọn, mua hàng */}
        <div className="detail-info-col">
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-meta">
            <span className="meta-category">Danh mục: <strong>{product.categoryName}</strong></span>
            <span className="meta-divider">|</span>
            <span className="meta-stock">Tình trạng: <strong style={{ color: product.stock > 0 ? "#059669" : "var(--fpt-red)" }}>
              {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : "Hết hàng"}
            </strong></span>
          </div>

          <div className="detail-price-box">
            <div className="price-row-main">
              <span className="price-current">{product.price?.toLocaleString()}đ</span>
              <span className="price-original">{originalPrice.toLocaleString()}đ</span>
              <span className="discount-tag">-35% FLASH SALE</span>
            </div>
            <p className="price-note">* Giá đã bao gồm thuế VAT và chế độ bảo hành 12 tháng chính hãng.</p>
          </div>

          {/* Hộp khuyến mãi ảo */}
          <div className="promo-box">
            <h4>🎁 ƯU ĐÃI ĐẶC BIỆT KHI MUA HÀNG:</h4>
            <ul>
              <li>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500k.</li>
              <li>Tặng gói bảo hành vàng lỗi 1 đổi 1 trong 30 ngày.</li>
              <li>Giảm thêm 5% khi thanh toán qua ví điện tử hoặc chuyển khoản.</li>
            </ul>
          </div>

          {/* Chọn số lượng & Nút mua */}
          <div className="purchase-section">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
              <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
              <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
            </div>

            <div className="purchase-buttons">
              <button className="btn-buy-now" onClick={handleAddToCart}>MUA NGAY</button>
              <button className="btn-add-to-cart" onClick={handleAddToCart}>
                🛒 THÊM VÀO GIỎ
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CHI TIẾT MÔ TẢ & BẢNG THÔNG SỐ KỸ THUẬT (2 CỘT DƯỚI) */}
      <div className="product-bottom-section">
        
        {/* Cột trái: Mô tả chi tiết HTML */}
        <div className="description-col">
          <h3 className="section-title" style={{ borderLeft: "4px solid var(--fpt-red)", paddingLeft: "12px", marginBottom: "20px" }}>
            ĐẶC ĐIỂM NỔI BẬT
          </h3>
          <div 
            className="html-description-content" 
            dangerouslySetInnerHTML={{ __html: htmlDesc }}
          />
        </div>

        {/* Cột phải: Bảng thông số kỹ thuật chi tiết */}
        {specs.length > 0 && (
          <div className="specs-col">
            <h3 className="section-title" style={{ borderLeft: "4px solid var(--fpt-red)", paddingLeft: "12px", marginBottom: "20px" }}>
              THÔNG SỐ KỸ THUẬT
            </h3>
            <table className="specs-table">
              <tbody>
                {specs.map(([key, value], idx) => (
                  <tr key={idx}>
                    <td className="spec-table-key">{key}</td>
                    <td className="spec-table-val">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
