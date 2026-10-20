"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Bộ lọc khoảng giá & Sắp xếp
  const [priceFilter, setPriceFilter] = useState("ALL"); // ALL | UNDER_10M | 10M_20M | ABOVE_20M
  const [sortBy, setSortBy] = useState("DEFAULT"); // DEFAULT | PRICE_ASC | PRICE_DESC | NAME_ASC

  const API_GATEWAY = "http://localhost:8082/api";

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    axios
      .get(`${API_GATEWAY}/products?name=${encodeURIComponent(query.trim())}&size=60`)
      .then((res) => {
        const list = res.data?.data?.content || res.data?.data || [];
        setProducts(list);
      })
      .catch((err) => {
        console.error("Lỗi khi tìm kiếm sản phẩm:", err);
        setErrorMsg("Không thể kết nối đến máy chủ để tìm kiếm. Vui lòng thử lại sau!");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  const getProductImage = (imageUrl) => {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    return `http://localhost:9000/products/${imageUrl.replace(/^\/+/, "")}`;
  };

  const getProductSpecs = (descString) => {
    try {
      const data = JSON.parse(descString);
      if (data && data.specs) {
        return Object.entries(data.specs).slice(0, 3);
      }
    } catch (e) {}
    return null;
  };

  const handleQuickAddToCart = (prod, e) => {
    if (e) e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem("dtm_cart_items") || "[]");
      const index = existing.findIndex((item) => item.id === prod.id);
      if (index >= 0) {
        existing[index].quantity += 1;
      } else {
        existing.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 1,
          imageUrl: getProductImage(prod.imageUrl)
        });
      }
      localStorage.setItem("dtm_cart_items", JSON.stringify(existing));
      window.dispatchEvent(new Event("cart_updated"));

      const token = localStorage.getItem("accessToken");
      if (token) {
        axios
          .post(
            `${API_GATEWAY}/cart/items`,
            { productId: prod.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch((err) => console.warn(err));
      }

      showToast(`Đã thêm "${prod.name}" vào giỏ hàng!`);
    } catch (err) {
      console.error(err);
    }
  };

  // Lọc sản phẩm theo khoảng giá
  const filteredProducts = products.filter((prod) => {
    const price = Number(prod.price) || 0;
    if (priceFilter === "UNDER_10M") return price < 10000000;
    if (priceFilter === "10M_20M") return price >= 10000000 && price <= 20000000;
    if (priceFilter === "ABOVE_20M") return price > 20000000;
    return true;
  });

  // Sắp xếp sản phẩm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    if (sortBy === "PRICE_ASC") return priceA - priceB;
    if (sortBy === "PRICE_DESC") return priceB - priceA;
    if (sortBy === "NAME_ASC") return (a.name || "").localeCompare(b.name || "");
    return 0; // Mặc định từ server (mới nhất)
  });

  return (
    <div className="home-container" style={{ padding: "20px 15px 60px 15px" }}>
      {/* Toast thông báo */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: "#10b981",
            color: "white",
            padding: "14px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            fontWeight: "700",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideUp 0.3s ease-out"
          }}
        >
          <span>🛒</span> {toastMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "18px" }}>
        <a href="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>Trang chủ</a>
        <span style={{ margin: "0 8px" }}>/</span>
        <span>Tìm kiếm</span>
        {query && (
          <>
            <span style={{ margin: "0 8px" }}>/</span>
            <strong style={{ color: "#0f172a" }}>"{query}"</strong>
          </>
        )}
      </div>

      {/* Tiêu đề kết quả & Thống kê */}
      <div style={{
        background: "white",
        padding: "24px 28px",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        border: "1px solid #f1f5f9",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>🔍</span> Kết quả tìm kiếm cho: <span style={{ color: "var(--fpt-red)" }}>"{query || "Tất cả"}"</span>
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
            {loading ? "Đang tra cứu dữ liệu..." : `Tìm thấy ${sortedProducts.length} sản phẩm phù hợp`}
          </p>
        </div>

        {/* Bộ lọc nhanh & Sắp xếp */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {/* Lọc theo mức giá */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { id: "ALL", label: "Tất cả giá" },
              { id: "UNDER_10M", label: "< 10 Triệu" },
              { id: "10M_20M", label: "10 - 20 Triệu" },
              { id: "ABOVE_20M", label: "> 20 Triệu" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPriceFilter(f.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "20px",
                  border: priceFilter === f.id ? "1.5px solid var(--fpt-red)" : "1px solid #cbd5e1",
                  background: priceFilter === f.id ? "#fee2e2" : "white",
                  color: priceFilter === f.id ? "var(--fpt-red)" : "#475569",
                  fontWeight: priceFilter === f.id ? "700" : "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sắp xếp dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#334155",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="DEFAULT">Sắp xếp: Mặc định (Mới nhất)</option>
            <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
            <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
            <option value="NAME_ASC">Tên: A - Z</option>
          </select>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          <p style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Đang tìm kiếm sản phẩm theo yêu cầu của bạn...</p>
        </div>
      ) : errorMsg ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--fpt-red)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
          <p style={{ fontWeight: "700", fontSize: "16px" }}>{errorMsg}</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        /* Trạng thái Không tìm thấy sản phẩm */
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "60px 20px",
          textAlign: "center",
          border: "1px dashed #cbd5e1"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍❌</div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
            Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "500px", margin: "0 auto 24px auto" }}>
            Bạn hãy thử kiểm tra lại chính tả hoặc tìm kiếm bằng các từ khóa ngắn gọn, phổ biến hơn bên dưới:
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
            {["iPhone 16", "iPhone 15", "Samsung Galaxy", "Laptop", "MacBook", "Tai nghe", "iPad"].map(tag => (
              <a
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                style={{
                  background: "#f1f5f9",
                  padding: "8px 18px",
                  borderRadius: "20px",
                  textDecoration: "none",
                  color: "#334155",
                  fontWeight: "600",
                  fontSize: "13px",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#334155"; }}
              >
                🔍 {tag}
              </a>
            ))}
          </div>

          <a
            href="/"
            style={{
              display: "inline-block",
              background: "var(--fpt-red)",
              color: "white",
              padding: "12px 28px",
              borderRadius: "30px",
              fontWeight: "700",
              textDecoration: "none",
              fontSize: "14px",
              boxShadow: "0 4px 15px rgba(205, 28, 34, 0.3)"
            }}
          >
            Quay về Trang chủ
          </a>
        </div>
      ) : (
        /* Lưới kết quả sản phẩm tìm thấy */
        <div className="shopee-product-grid">
          {sortedProducts.map((prod) => {
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
                    {specs.map(([key, value], index) => (
                      <div className="spec-row" key={index}>
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
                  <span className="shopee-current-price">
                    {Number(prod.price || 0).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="shopee-original-price">
                    {originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
                  <button
                    onClick={(e) => handleQuickAddToCart(prod, e)}
                    style={{
                      flex: 1,
                      background: "#fee2e2",
                      color: "var(--fpt-red)",
                      border: "1px solid #fca5a5",
                      borderRadius: "10px",
                      padding: "10px 8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#fecdd3"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                  >
                    <span>🛒</span> Thêm giỏ
                  </button>

                  <a
                    href={`/product/${prod.id}`}
                    className="shopee-card-btn"
                    style={{ flex: 1, textAlign: "center", padding: "10px 8px", fontSize: "13px" }}
                  >
                    Chi tiết
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b", fontSize: "16px" }}>
          ⏳ Đang chuẩn bị kết quả tìm kiếm...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
