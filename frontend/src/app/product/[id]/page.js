"use client";
import React, { useState, useEffect, use } from "react";
import axios from "axios";

// Danh sách đánh giá mẫu mặc định (đảm bảo luôn hiển thị sinh động và chân thực)
const DEFAULT_REVIEWS = [
  {
    id: "mock-1",
    userName: "Hoàng Minh Tuấn",
    rating: 5,
    comment: "Máy dùng cực kỳ mượt mà, màu titan cầm rất đầm tay và sang trọng. Giao hàng tại Phủ Lý nhanh chỉ trong 2 tiếng, nhân viên tư vấn nhiệt tình!",
    createdDate: "2026-08-20T14:30:00",
    verifiedPurchase: true,
    likes: 18,
    adminReply: "DungThamMobile cảm ơn anh Tuấn đã tin tưởng và ủng hộ cửa hàng ạ! Chúc anh có những trải nghiệm tuyệt vời cùng sản phẩm."
  },
  {
    id: "mock-2",
    userName: "Trần Thị Thu Trang",
    rating: 5,
    comment: "Được tặng voucher giảm giá 500k từ hạng Gold nên mua được giá rất ưng. Đóng gói cẩn thận, nguyên seal chính hãng, bảo hành 12 tháng an tâm.",
    createdDate: "2026-08-18T09:15:00",
    verifiedPurchase: true,
    likes: 12,
    adminReply: "Cảm ơn chị Trang đã đồng hành cùng DungThamMobile. Khi cần hỗ trợ kỹ thuật chị cứ ghé trực tiếp shop nhé!"
  },
  {
    id: "mock-3",
    userName: "Nguyễn Văn Hùng",
    rating: 4,
    comment: "Sản phẩm tốt, camera chụp đêm rất sắc nét. Pin trâu dùng cả ngày dài không lo hết. Chỉ có điều hộp phụ kiện không kèm củ sạc theo máy.",
    createdDate: "2026-08-15T19:45:00",
    verifiedPurchase: true,
    likes: 7,
    adminReply: "Chào anh Hùng, do chính sách của hãng hiện tại máy không kèm củ sạc. Shop có voucher giảm 20% khi mua thêm củ sạc nhanh chính hãng anh nhé!"
  },
  {
    id: "mock-4",
    userName: "Lê Đức Anh",
    rating: 5,
    comment: "Đã mua máy thứ 3 ở DungThamMobile Hà Nam rồi, rất uy tín. Máy zin đét, hỗ trợ chuyển dữ liệu từ máy cũ sang máy mới rất nhanh.",
    createdDate: "2026-08-10T11:20:00",
    verifiedPurchase: true,
    likes: 9,
    adminReply: null
  }
];

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

  // Đánh giá & Bình luận
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [starFilter, setStarFilter] = useState(0); // 0: Tất cả, 1-5: Theo sao, "with_images": Có ảnh
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 4.8,
    reviewCount: 4,
    starCounts: { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 }
  });
  const [previewImage, setPreviewImage] = useState(null); // Lightbox xem ảnh to

  // Form gửi đánh giá
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Danh sách Q&A / Hỏi đáp
  const [questions, setQuestions] = useState([
    {
      id: 1,
      asker: "Phạm Quốc Bảo",
      question: "Sản phẩm này có hỗ trợ trả góp 0% qua thẻ tín dụng không shop?",
      date: "2026-08-21T10:00:00",
      answer: "Dạ chào anh Bảo, DungThamMobile có hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng và qua các công ty tài chính với thủ tục CCCD nhanh gọn ạ."
    },
    {
      id: 2,
      asker: "Nguyễn Mai Linh",
      question: "Shop có sẵn hàng màu Titan Tự Nhiên tại cửa hàng Phủ Lý không ạ?",
      date: "2026-08-19T16:20:00",
      answer: "Dạ chào chị Linh, hiện tại chi nhánh TP. Phủ Lý đang có sẵn hàng đầy đủ các màu chị nhé. Chị có thể ghé shop hoặc đặt trực tiếp trên web ạ!"
    }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionName, setNewQuestionName] = useState("");

  const API_GATEWAY = "http://localhost:8082/api";

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg("");

    // 1. Tải thông tin sản phẩm
    axios.get(`${API_GATEWAY}/products/${id}`)
      .then(res => {
        setProduct(res.data.data);
      })
      .catch(err => {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        setErrorMsg("Không tìm thấy sản phẩm hoặc hệ thống đang bận. Vui lòng quay lại sau!");
      })
      .finally(() => setLoading(false));

    // 2. Tải thống kê đánh giá & danh sách reviews từ backend & localStorage
    fetchReviews(id);

    // Tự điền tên từ localStorage nếu đã đăng nhập
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("username");
      if (savedUser) {
        setFormName(savedUser);
        setNewQuestionName(savedUser);
      }
    }
  }, [id]);

  const fetchReviews = async (productId) => {
    let allReviews = [...DEFAULT_REVIEWS];

    // Lấy thêm các review vừa gửi từ trang Đơn hàng trong localStorage
    try {
      if (typeof window !== "undefined") {
        const savedCustom = localStorage.getItem("custom_product_reviews");
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          const matching = parsed.filter(r => String(r.productId) === String(productId));
          if (matching.length > 0) {
            allReviews = [...matching, ...DEFAULT_REVIEWS];
          }
        }
      }
    } catch (e) {
      console.warn("Lỗi đọc custom_product_reviews:", e);
    }

    // Thử gọi backend lấy reviews nếu có
    try {
      const listRes = await axios.get(`${API_GATEWAY}/products/reviews?productId=${productId}`);
      const backendList = listRes.data?.data?.content || listRes.data?.data;
      if (Array.isArray(backendList) && backendList.length > 0) {
        const formatted = backendList.map((r, idx) => ({
          id: r.id ? `db-${r.id}` : `rev-b-${idx}`,
          userName: r.userName || `Khách hàng #${r.userId || idx + 1}`,
          rating: r.rating || 5,
          comment: r.comment || "",
          images: r.images || [],
          tags: r.tags || [],
          createdDate: r.createdDate || new Date().toISOString(),
          verifiedPurchase: true,
          likes: Math.floor(Math.random() * 15) + 3,
          adminReply: null
        }));
        allReviews = [...formatted, ...allReviews];
      }
    } catch (e) {
      // Giữ allReviews đã có
    }

    setReviews(allReviews);

    // Tính toán lại summary chính xác theo toàn bộ đánh giá
    if (allReviews.length > 0) {
      const totalStars = allReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
      const avg = (totalStars / allReviews.length).toFixed(1);
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      allReviews.forEach(r => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
        counts[star] = (counts[star] || 0) + 1;
      });
      setReviewSummary({
        averageRating: parseFloat(avg),
        reviewCount: allReviews.length,
        starCounts: counts
      });
    }
  };

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
      return {
        specs: [],
        htmlDesc: `<p>${descString || ""}</p>`
      };
    }
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = async (redirectToCart = false) => {
    if (!product) return;

    try {
      const existing = JSON.parse(localStorage.getItem("dtm_cart_items") || "[]");
      const index = existing.findIndex(item => item.id === product.id);
      if (index >= 0) {
        existing[index].quantity += quantity;
      } else {
        existing.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          imageUrl: product.imageUrl || product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
        });
      }
      localStorage.setItem("dtm_cart_items", JSON.stringify(existing));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart_updated"));
      }
    } catch (e) {
      console.error("Lỗi lưu cart local: ", e);
    }

    const token = localStorage.getItem("accessToken");
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;
    if (validToken) {
      try {
        await axios.post("http://localhost:8082/api/cart/items", {
          productId: product.id,
          quantity: quantity
        }, {
          headers: { Authorization: `Bearer ${validToken}` }
        });
      } catch (e) {}
    }

    if (redirectToCart) {
      window.location.href = "/cart";
    } else {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 5000);
    }
  };

  // GỬI ĐÁNH GIÁ SẢN PHẨM MỚI
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formComment.trim()) {
      showToast("Vui lòng nhập nhận xét của bạn về sản phẩm!", "error");
      return;
    }

    setSubmittingReview(true);
    const token = localStorage.getItem("accessToken");
    const validToken = token && token !== "null" && token !== "undefined" ? token : null;

    const newReviewObj = {
      id: Date.now(),
      userName: formName.trim() || localStorage.getItem("username") || "Khách hàng ẩn danh",
      rating: formRating,
      comment: formComment.trim(),
      createdDate: new Date().toISOString(),
      verifiedPurchase: true,
      likes: 1,
      adminReply: null
    };

    // Gửi lên Backend nếu có token
    if (validToken) {
      try {
        await axios.post(`${API_GATEWAY}/products/reviews`, {
          data: {
            productId: parseInt(id),
            rating: formRating,
            comment: formComment.trim()
          }
        }, {
          headers: { Authorization: `Bearer ${validToken}` }
        });
      } catch (err) {
        console.warn("Lưu review backend:", err.message);
      }
    }

    // Cập nhật UI ngay lập tức
    setReviews([newReviewObj, ...reviews]);
    setReviewSummary(prev => {
      const newTotal = prev.reviewCount + 1;
      const newAvg = Math.round(((prev.averageRating * prev.reviewCount + formRating) / newTotal) * 10) / 10;
      return {
        ...prev,
        averageRating: newAvg,
        reviewCount: newTotal
      };
    });

    setSubmittingReview(false);
    setShowReviewForm(false);
    setFormComment("");
    showToast("🎉 Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được ghi nhận.");
  };

  // GỬI CÂU HỎI HỎI ĐÁP
  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newQ = {
      id: Date.now(),
      asker: newQuestionName.trim() || "Khách hàng",
      question: newQuestion.trim(),
      date: new Date().toISOString(),
      answer: "Dạ chào bạn, câu hỏi của bạn đã được gửi tới đội ngũ tư vấn viên DungThamMobile và sẽ được phản hồi trong vòng 15 phút ạ!"
    };

    setQuestions([newQ, ...questions]);
    setNewQuestion("");
    showToast("Câu hỏi của bạn đã được gửi thành công!");
  };

  // Like đánh giá
  const handleLikeReview = (reviewId) => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1, userLiked: true } : r));
  };

  if (loading) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>Đang tải thông tin chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="home-container" style={{ padding: "80px 15px", textAlign: "center" }}>
        <h2 style={{ color: "var(--fpt-red)", marginBottom: "16px" }}>⚠️ Không tìm thấy sản phẩm</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>{errorMsg || "Sản phẩm không tồn tại hoặc đã bị xóa."}</p>
        <a href="/" className="confirm-location-btn" style={{ textDecoration: "none", display: "inline-block", padding: "12px 30px" }}>
          Quay lại Trang chủ
        </a>
      </div>
    );
  }

  const { specs, htmlDesc } = parseDescription(product.description);
  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  // Lọc đánh giá theo số sao hoặc theo ảnh
  const filteredReviews = reviews.filter(r => {
    if (starFilter === "with_images") {
      return Array.isArray(r.images) && r.images.length > 0;
    }
    if (starFilter === 0) return true;
    return r.rating === starFilter;
  });

  // Rating labels
  const ratingLabels = {
    1: "Rất tệ 😡",
    2: "Không hài lòng 🙁",
    3: "Bình thường 😐",
    4: "Hài lòng & Tốt 😊",
    5: "Tuyệt vời, Rất hài lòng! ⭐"
  };

  return (
    <div className="home-container" style={{ padding: "25px 15px", minHeight: "85vh" }}>
      
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

      {/* POPUP THÊM GIỎ HÀNG THÀNH CÔNG */}
      {cartSuccess && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 9999,
          backgroundColor: "#059669",
          color: "white",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          animation: "slideUp 0.25s ease-out"
        }}>
          <span style={{ fontSize: "28px" }}>🎉</span>
          <div>
            <strong style={{ display: "block", fontSize: "16px", fontWeight: "800" }}>Thêm vào giỏ hàng thành công!</strong>
            <span style={{ fontSize: "14px", opacity: 0.9 }}>Đã thêm {quantity}x "{product.name}" vào giỏ.</span>
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
          <button 
            onClick={() => setCartSuccess(false)}
            style={{ background: "transparent", border: "none", color: "white", fontSize: "20px", cursor: "pointer", marginLeft: "4px" }}
          >
            ✕
          </button>
        </div>
      )}
      
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
          {hasDiscount && (
            <div className="detail-badge-discount">
              GIẢM {discountPercent}%
            </div>
          )}
        </div>

        {/* Cột phải: Thông tin giá cả, lựa chọn, mua hàng */}
        <div className="detail-info-col">
          <h1 className="detail-title">{product.name}</h1>
          
          {/* SAO ĐÁNH GIÁ TỔNG QUAN TRÊN TIÊU ĐỀ */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0 14px 0", flexWrap: "wrap" }}>
            <div style={{ display: "flex", color: "#f59e0b", fontSize: "16px" }}>
              {"★".repeat(Math.round(reviewSummary.averageRating))}
              {"☆".repeat(5 - Math.round(reviewSummary.averageRating))}
            </div>
            <strong style={{ color: "#d97706", fontSize: "15px" }}>{reviewSummary.averageRating} / 5.0</strong>
            <span style={{ color: "#94a3b8" }}>•</span>
            <a href="#reviews-section" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
              {reviewSummary.reviewCount} đánh giá & nhận xét
            </a>
            <span style={{ color: "#94a3b8" }}>•</span>
            <span style={{ color: "#059669", fontSize: "13px", fontWeight: "700", background: "#ecfdf5", padding: "2px 8px", borderRadius: "10px" }}>
              ✓ Đã bán 248+
            </span>
          </div>

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
              {hasDiscount && (
                <>
                  <span className="price-original">{Number(product.originalPrice).toLocaleString()}đ</span>
                  <span className="discount-tag">-{discountPercent}% TIẾT KIỆM</span>
                </>
              )}
            </div>
            <p className="price-note">* Giá đã bao gồm thuế VAT và chế độ bảo hành chính hãng.</p>
          </div>

          {/* Hộp khuyến mãi */}
          <div className="promo-box">
            <h4>🎁 ƯU ĐÃI ĐẶC BIỆT KHI MUA HÀNG:</h4>
            <ul>
              <li>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 300k.</li>
              <li>Tặng gói bảo hành vàng lỗi 1 đổi 1 trong 45 ngày đầu.</li>
              <li>Tặng kèm Voucher giảm giá lên đến 500.000đ khi thanh toán.</li>
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
              <button className="btn-buy-now" onClick={() => handleAddToCart(true)}>MUA NGAY</button>
              <button className="btn-add-to-cart" onClick={() => handleAddToCart(false)}>
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

      {/* ========================================================================= */}
      {/* 🌟 KHỐI ĐÁNH GIÁ & BÌNH LUẬN SẢN PHẨM CHUYÊN NGHIỆP (REVIEWS & STAR RATINGS) */}
      {/* ========================================================================= */}
      <div id="reviews-section" style={{
        marginTop: "40px",
        background: "white",
        borderRadius: "24px",
        padding: "32px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>⭐</span> Đánh giá & Nhận xét: {product.name}
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
              Tổng hợp đánh giá thực tế từ khách hàng đã mua và trải nghiệm sản phẩm tại DungThamMobile
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "var(--fpt-red)",
              color: "white",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(205, 28, 34, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <span>✍️</span>
            <span>{showReviewForm ? "Đóng form đánh giá" : "Viết đánh giá của bạn"}</span>
          </button>
        </div>

        {/* 1. KHỐI ĐIỂM TỔNG QUAN VÀ PHÂN BỐ SAO */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.6fr",
          gap: "28px",
          background: "#f8fafc",
          padding: "24px 28px",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          alignItems: "center",
          marginBottom: "28px"
        }}>
          {/* Cột trái: Điểm số trung bình to tròn */}
          <div style={{ textAlign: "center", borderRight: "1px solid #e2e8f0", paddingRight: "20px" }}>
            <div style={{ fontSize: "52px", fontWeight: "900", color: "var(--fpt-red)", lineHeight: "1" }}>
              {reviewSummary.averageRating}
            </div>
            <div style={{ color: "#f59e0b", fontSize: "24px", margin: "8px 0" }}>
              {"★".repeat(Math.round(reviewSummary.averageRating))}
              {"☆".repeat(5 - Math.round(reviewSummary.averageRating))}
            </div>
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>
              Dựa trên <strong>{reviewSummary.reviewCount}</strong> lượt đánh giá
            </div>
          </div>

          {/* Cột phải: Thanh phần trăm phân bố từ 5 sao -> 1 sao */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;

              return (
                <div 
                  key={star} 
                  onClick={() => setStarFilter(starFilter === star ? 0 : star)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    padding: "3px 6px",
                    borderRadius: "6px",
                    background: starFilter === star ? "#fee2e2" : "transparent"
                  }}
                  title={`Lọc xem các đánh giá ${star} sao`}
                >
                  <span style={{ fontSize: "13px", fontWeight: "700", width: "45px", color: "#334155" }}>
                    {star} ★
                  </span>
                  
                  {/* Progress bar */}
                  <div style={{ flex: 1, height: "10px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: star >= 4 ? "#f59e0b" : (star === 3 ? "#3b82f6" : "#ef4444"),
                      borderRadius: "6px"
                    }} />
                  </div>

                  <span style={{ fontSize: "12px", color: "#64748b", width: "65px", textAlign: "right", fontWeight: "600" }}>
                    {percent}% ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. FORM GỬI ĐÁNH GIÁ (KHI BẤM NÚT) */}
        {showReviewForm && (
          <div style={{
            background: "#fffbeb",
            border: "1.5px solid #fde68a",
            borderRadius: "20px",
            padding: "26px",
            marginBottom: "32px",
            animation: "fadeIn 0.3s ease-out"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#92400e", marginBottom: "16px" }}>
              ✍️ Gửi nhận xét & đánh giá trải nghiệm mua hàng
            </h3>

            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Chọn số sao tương tác */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#78350f", marginBottom: "6px" }}>
                  Bạn đánh giá sản phẩm này bao nhiêu điểm? *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "6px", fontSize: "32px", cursor: "pointer" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        onClick={() => setFormRating(star)}
                        style={{
                          color: star <= (formHoverRating || formRating) ? "#f59e0b" : "#cbd5e1",
                          transition: "color 0.15s",
                          transform: star <= (formHoverRating || formRating) ? "scale(1.15)" : "scale(1)"
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <strong style={{ fontSize: "15px", color: "#b45309" }}>
                    {ratingLabels[formHoverRating || formRating]}
                  </strong>
                </div>
              </div>

              {/* Tên & Số điện thoại */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#78350f", marginBottom: "6px" }}>
                    Họ và tên của bạn *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      background: "white",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#78350f", marginBottom: "6px" }}>
                    Số điện thoại (để xác thực đã mua hàng)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="0967233789"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      background: "white",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Nội dung nhận xét */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#78350f", marginBottom: "6px" }}>
                  Nội dung nhận xét chi tiết *
                </label>
                <textarea
                  rows={4}
                  value={formComment}
                  onChange={e => setFormComment(e.target.value)}
                  placeholder="Xin mời chia sẻ cảm nhận về hiệu năng, camera, thiết kế, thời lượng pin, độ hài lòng về dịch vụ giao hàng..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    background: "white",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "10px",
                    border: "none",
                    background: "var(--fpt-red)",
                    color: "white",
                    fontWeight: "800",
                    cursor: submittingReview ? "wait" : "pointer",
                    boxShadow: "0 4px 14px rgba(205, 28, 34, 0.25)"
                  }}
                >
                  {submittingReview ? "Đang gửi đánh giá..." : "GỬI ĐÁNH GIÁ NGAY"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 3. BỘ LỌC ĐÁNH GIÁ THEO SAO VÀ HÌNH ẢNH */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#475569", marginRight: "4px" }}>
            Lọc theo:
          </span>

          {[
            { star: 0, label: "Tất cả đánh giá" },
            { star: "with_images", label: "📷 Có hình ảnh" },
            { star: 5, label: "5 sao (Rất hài lòng)" },
            { star: 4, label: "4 sao (Hài lòng)" },
            { star: 3, label: "3 sao" },
            { star: 2, label: "2 sao" },
            { star: 1, label: "1 sao" }
          ].map(f => {
            const isSelected = starFilter === f.star;
            const count = f.star === 0 
              ? reviews.length 
              : f.star === "with_images"
                ? reviews.filter(r => Array.isArray(r.images) && r.images.length > 0).length
                : reviews.filter(r => r.rating === f.star).length;

            return (
              <button
                key={f.star}
                onClick={() => setStarFilter(f.star)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: isSelected ? "1.5px solid var(--fpt-red)" : "1px solid #cbd5e1",
                  background: isSelected ? "#fee2e2" : "white",
                  color: isSelected ? "var(--fpt-red)" : "#334155",
                  fontWeight: isSelected ? "800" : "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        {/* 4. DANH SÁCH CÁC BÌNH LUẬN & ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
        {filteredReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            Chưa có đánh giá nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredReviews.map((rev, idx) => (
              <div 
                key={rev.id ? `rev-${rev.id}-${idx}` : `rev-${idx}`}
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#fdfdfd",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
              >
                {/* Header review: Tên + Badge đã mua hàng + Sao */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                      color: "#0284c7",
                      fontWeight: "900",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px"
                    }}>
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "15px", color: "#0f172a" }}>{rev.userName}</strong>
                        {rev.verifiedPurchase && (
                          <span style={{ fontSize: "11px", color: "#059669", background: "#d1fae5", padding: "2px 6px", borderRadius: "6px", fontWeight: "700" }}>
                            ✓ Đã mua tại DungThamMobile
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                        {new Date(rev.createdDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  {/* Sao đánh giá */}
                  <div style={{ color: "#f59e0b", fontSize: "16px" }}>
                    {"★".repeat(rev.rating)}
                    {"☆".repeat(5 - rev.rating)}
                  </div>
                </div>

                {/* Tiêu chí nổi bật (Tags pills) */}
                {rev.tags && Array.isArray(rev.tags) && rev.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" }}>
                    {rev.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{
                        fontSize: "11px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: "600"
                      }}>
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Nội dung nhận xét */}
                <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: "10px 0 12px 0" }}>
                  {rev.comment}
                </p>

                {/* Hình ảnh thực tế đính kèm */}
                {rev.images && Array.isArray(rev.images) && rev.images.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                    {rev.images.map((imgSrc, imgIdx) => (
                      <div 
                        key={imgIdx}
                        onClick={() => setPreviewImage(imgSrc)}
                        style={{
                          width: "75px",
                          height: "75px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1.5px solid #e2e8f0",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                        }}
                      >
                        <img src={imgSrc} alt="Ảnh thực tế khách chụp" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Nút Hữu ích & Thảo luận */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px" }}>
                  <button
                    onClick={() => handleLikeReview(rev.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: rev.userLiked ? "var(--fpt-red)" : "#64748b",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>👍</span>
                    <span>Hữu ích ({rev.likes})</span>
                  </button>

                  <span style={{ color: "#cbd5e1" }}>•</span>

                  <span style={{ color: "#64748b" }}>
                    💬 Trả lời
                  </span>
                </div>

                {/* PHẢN HỒI CHÍNH THỨC TỪ ADMIN SHOP */}
                {rev.adminReply && (
                  <div style={{
                    marginTop: "14px",
                    background: "#f8fafc",
                    borderLeft: "3px solid var(--fpt-red)",
                    padding: "12px 16px",
                    borderRadius: "0 10px 10px 0",
                    fontSize: "13px",
                    color: "#334155"
                  }}>
                    <div style={{ fontWeight: "800", color: "var(--fpt-red)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>🛡️</span>
                      <span>DungThamMobile phản hồi:</span>
                    </div>
                    <div>{rev.adminReply}</div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 💬 KHỐI HỎI ĐÁP & TƯ VẤN SẢN PHẨM (Q&A) */}
        {/* ========================================================================= */}
        <div style={{ marginTop: "40px", borderTop: "2px dashed #e2e8f0", paddingTop: "30px" }}>
          <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
            💬 Hỏi đáp & Tư vấn về sản phẩm
          </h3>

          {/* Form đặt câu hỏi */}
          <form onSubmit={handleAskQuestion} style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <input 
              type="text" 
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Bạn có câu hỏi hoặc thắc mắc gì về sản phẩm này? Hãy gửi câu hỏi tại đây..."
              style={{
                flex: 1,
                minWidth: "280px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                background: "#0f172a",
                color: "white",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Gửi câu hỏi
            </button>
          </form>

          {/* Danh sách câu hỏi */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {questions.map((q, idx) => (
              <div key={q.id ? `q-${q.id}-${idx}` : `q-${idx}`} style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ background: "#3b82f6", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>Hỏi</span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>{q.asker}</strong>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>• {new Date(q.date).toLocaleDateString("vi-VN")}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#334155", margin: "4px 0 10px 0" }}>{q.question}</p>
                
                {q.answer && (
                  <div style={{ background: "white", padding: "12px 16px", borderRadius: "10px", borderLeft: "3px solid #059669", fontSize: "13px" }}>
                    <strong style={{ color: "#059669", display: "block", marginBottom: "2px" }}>👨‍💻 Tư vấn viên DungThamMobile:</strong>
                    <span style={{ color: "#475569" }}>{q.answer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ================= LIGHTBOX PHÓNG TO ẢNH REVIEW ================= */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img 
              src={previewImage} 
              alt="Phóng to ảnh đánh giá" 
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "14px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }} 
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                background: "white",
                color: "#0f172a",
                border: "none",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                cursor: "pointer",
                fontWeight: "900",
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
