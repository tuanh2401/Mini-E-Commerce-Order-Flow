"use client";
import React, { useState, useEffect, use, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// Tách biệt phần hiển thị danh sách sản phẩm để sử dụng hook useSearchParams an toàn
function CategoryProductsContent({ id, category }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const API_GATEWAY = "http://localhost:8082/api";

  // Lấy các tham số lọc từ URL query
  const brand = searchParams.get("brand")?.toLowerCase();
  const series = searchParams.get("series")?.toLowerCase();
  const search = searchParams.get("search")?.toLowerCase();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg("");

    axios.get(`${API_GATEWAY}/products/category/${id}`)
      .then(res => {
        setProducts(res.data.data || []);
      })
      .catch(err => {
        console.error("Lỗi lấy sản phẩm theo danh mục:", err);
        setErrorMsg("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

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
    } catch (e) {
      // Bỏ qua
    }
    return null;
  };

  // Tiến hành lọc sản phẩm động phía Client
  const filteredProducts = products.filter(prod => {
    const name = prod.name.toLowerCase();

    // 1. Lọc theo hãng (Brand)
    if (brand) {
      if (brand === "apple") {
        if (!name.includes("iphone") && !name.includes("macbook") && !name.includes("apple") && !name.includes("ipad") && !name.includes("airpods")) {
          return false;
        }
      } else if (brand === "samsung") {
        if (!name.includes("samsung") && !name.includes("galaxy")) return false;
      } else if (brand === "xiaomi") {
        if (!name.includes("xiaomi") && !name.includes("redmi") && !name.includes("poco")) return false;
      } else {
        if (!name.includes(brand)) return false;
      }
    }

    // 2. Lọc theo dòng máy (Series)
    if (series) {
      // Ví dụ: series=16, sản phẩm phải chứa "16"
      if (!name.includes(series)) return false;
    }

    // 3. Lọc theo từ khóa tìm kiếm bổ sung (Search)
    if (search) {
      if (!name.includes(search)) return false;
    }

    return true;
  });

  return (
    <section className="product-section" style={{ marginTop: "20px" }}>
      <h3 className="section-title">
        {category ? `${category.name.toUpperCase()} NỔI BẬT` : "DANH SÁCH SẢN PHẨM"}
        {brand && <span style={{ color: "var(--fpt-red)", textTransform: "uppercase" }}> - HÃNG {brand}</span>}
        {series && <span style={{ color: "#2563eb", textTransform: "uppercase" }}> ({series.toUpperCase()})</span>}
      </h3>
      
      {category?.description && (
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px", marginTop: "-10px" }}>
          {category.description}
        </p>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "#888", padding: "60px" }}>Đang kết nối hệ thống dữ liệu...</p>
      ) : errorMsg ? (
        <p style={{ textAlign: "center", color: "var(--fpt-red)", padding: "40px" }}>{errorMsg}</p>
      ) : filteredProducts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", padding: "60px" }}>
          Hiện chưa có sản phẩm nào thuộc bộ lọc này. Bạn vui lòng quay lại sau!
        </p>
      ) : (
        <div className="shopee-product-grid">
          {filteredProducts.map(prod => {
            const specs = getProductSpecs(prod.description);
            const originalPrice = Math.round(prod.price * 1.35);
            
            return (
              <div className="shopee-product-card" key={prod.id}>
                <div className="shopee-discount-badge">
                  <span>GIẢM</span>
                  <strong>35%</strong>
                </div>

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

                <div style={{ marginTop: "auto" }}>
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
  );
}

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [category, setCategory] = useState(null);
  const API_GATEWAY = "http://localhost:8082/api";

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_GATEWAY}/categories/${id}`)
      .then(res => {
        setCategory(res.data.data);
      })
      .catch(err => {
        console.error("Lỗi lấy thông tin danh mục:", err);
      });
  }, [id]);

  return (
    <div className="home-container" style={{ paddingTop: "20px" }}>
      
      {/* Breadcrumbs điều hướng */}
      <div className="breadcrumbs">
        <a href="/">Trang chủ</a> <span>/</span> <strong>{category ? category.name : "Danh mục"}</strong>
      </div>

      {/* Bao bọc trong Suspense để tránh lỗi Static Deoptimization do useSearchParams */}
      <Suspense fallback={<p style={{ textAlign: "center", padding: "60px", color: "#888" }}>Đang tải danh sách sản phẩm...</p>}>
        <CategoryProductsContent id={id} category={category} />
      </Suspense>

    </div>
  );
}
