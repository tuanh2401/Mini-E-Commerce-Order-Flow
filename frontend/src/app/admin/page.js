"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:8082/api";

// Tạo instance axios riêng cho admin để xử lý tự động tiêm token và refresh token
const api = axios.create({
  baseURL: API,
});

// Request interceptor để tự động chèn JWT vào Header
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý tự động refresh token khi gặp lỗi 401 hoặc 403 (hết hạn token)
// Biến để xếp hàng đợi các request khi đang làm mới token (tránh race condition)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor để xử lý tự động refresh token khi gặp lỗi 401 hoặc 403 (hết hạn token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refToken = localStorage.getItem("refreshToken");
      if (refToken) {
        try {
          // Gọi API refresh token
          const res = await axios.post(`${API}/auth/refresh`, {
            refreshToken: refToken,
          });
          const authData = res.data?.data;
          if (authData && authData.jwt) {
            localStorage.setItem("accessToken", authData.jwt);
            if (authData.refreshToken) {
              localStorage.setItem("refreshToken", authData.refreshToken);
            }
            processQueue(null, authData.jwt);
            isRefreshing = false;

            originalRequest.headers["Authorization"] = `Bearer ${authData.jwt}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          console.error("Refresh token thất bại:", refreshError);
          // Nếu refresh token cũng hết hạn, xóa session và yêu cầu đăng nhập lại
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

function getRoleFromToken() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || payload.roles || null;
  } catch { return null; }
}

const fmt = n => n != null ? Number(n).toLocaleString("vi-VN") : "—";
const fmtMoney = n => n != null ? Number(n).toLocaleString("vi-VN") + "đ" : "—";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="adm-stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="adm-stat-icon" style={{ color }}>{icon}</div>
      <div className="adm-stat-body">
        <div className="adm-stat-value">{value ?? "—"}</div>
        <div className="adm-stat-label">{label}</div>
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    PENDING:   { color: "#f59e0b", bg: "#fef3c7", label: "Chờ xử lý" },
    PAID:      { color: "#10b981", bg: "#d1fae5", label: "Đã thanh toán" },
    CANCELLED: { color: "#ef4444", bg: "#fee2e2", label: "Đã huỷ" },
    SHIPPED:   { color: "#3b82f6", bg: "#dbeafe", label: "Đang giao" },
    DELIVERED: { color: "#8b5cf6", bg: "#ede9fe", label: "Hoàn tất" },
    ACTIVE:    { color: "#10b981", bg: "#d1fae5", label: "Hoạt động" },
    INACTIVE:  { color: "#6b7280", bg: "#f3f4f6", label: "Tạm dừng" },
  };
  const s = map[status?.toUpperCase()] || { color: "#6b7280", bg: "#f3f4f6", label: status };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal-box" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h3>{title}</h3>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Xác nhận" onClose={onCancel}>
      <p style={{ marginBottom: 24, color: "#374151" }}>{message}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Huỷ</button>
        <button className="adm-btn adm-btn-danger" onClick={onConfirm}>Xác nhận xoá</button>
      </div>
    </Modal>
  );
}

// ── TAB: TỔNG QUAN ──────────────────────────────────
function OverviewTab() {
  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [promotionStats, setPromotionStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topSpenders, setTopSpenders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/orders/analytics/summary"),
      api.get("/users/analytics/summary"),
      api.get("/products/analytics/summary"),
      api.get("/payments/analytics/summary"),
      api.get("/promotions/analytics/summary"),
      api.get("/orders/analytics/top-products?limit=5"),
      api.get("/users/analytics/top-spenders?limit=5"),
      api.get("/orders/analytics/recent?limit=8"),
    ]).then(r => {
      if (r[0].status === "fulfilled") setOrderStats(r[0].value.data?.data);
      if (r[1].status === "fulfilled") setUserStats(r[1].value.data?.data);
      if (r[2].status === "fulfilled") setProductStats(r[2].value.data?.data);
      if (r[3].status === "fulfilled") setPaymentStats(r[3].value.data?.data);
      if (r[4].status === "fulfilled") setPromotionStats(r[4].value.data?.data);
      if (r[5].status === "fulfilled") setTopProducts(r[5].value.data?.data || []);
      if (r[6].status === "fulfilled") setTopSpenders(r[6].value.data?.data || []);
      if (r[7].status === "fulfilled") setRecentOrders(r[7].value.data?.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="adm-loading">⏳ Đang tải dữ liệu tổng quan...</div>;

  return (
    <div>
      <h2 className="adm-section-title">📊 Tổng quan hệ thống</h2>
      <div className="adm-stat-grid">
        <StatCard icon="👤" label="Tổng người dùng" value={fmt(userStats?.totalUsers)} color="#6366f1" />
        <StatCard icon="📦" label="Tổng sản phẩm" value={fmt(productStats?.totalProducts)} color="#3b82f6" />
        <StatCard icon="🛒" label="Tổng đơn hàng" value={fmt(orderStats?.totalOrders)} color="#f59e0b" />
        <StatCard icon="💰" label="Doanh thu tổng" value={fmtMoney(paymentStats?.totalRevenue ?? orderStats?.totalRevenue)} color="#10b981" />
        <StatCard icon="🎫" label="Voucher đã dùng" value={fmt(promotionStats?.totalUsed)} color="#ec4899" />
        <StatCard icon="⚠️" label="SP sắp hết hàng" value={fmt(productStats?.lowStockCount)} color="#ef4444" />
      </div>
      <div className="adm-stat-grid" style={{ marginTop: 0 }}>
        <StatCard icon="✅" label="Đơn đã TT" value={fmt(orderStats?.paidOrders)} color="#10b981" />
        <StatCard icon="⏳" label="Đơn đang chờ" value={fmt(orderStats?.pendingOrders)} color="#f59e0b" />
        <StatCard icon="❌" label="Đơn đã huỷ" value={fmt(orderStats?.cancelledOrders)} color="#ef4444" />
        <StatCard icon="💳" label="Tổng giao dịch" value={fmt(paymentStats?.totalTransactions)} color="#8b5cf6" />
        <StatCard icon="⭐" label="Đánh giá TB" value={productStats?.averageRating != null ? productStats.averageRating.toFixed(1) + " ★" : "—"} color="#f59e0b" />
        <StatCard icon="🔖" label="Tiết kiệm voucher" value={fmtMoney(promotionStats?.totalDiscount ?? promotionStats?.totalDiscountGiven)} color="#ec4899" />
      </div>
      <div className="adm-two-col" style={{ marginTop: 24 }}>
        <div className="adm-card">
          <div className="adm-card-header">🏆 Top sản phẩm bán chạy</div>
          {topProducts.length === 0 ? <p className="adm-empty">Chưa có dữ liệu</p> : (
            <table className="adm-table">
              <thead><tr><th>#</th><th>Sản phẩm</th><th>Đã bán</th><th>Doanh thu</th></tr></thead>
              <tbody>{topProducts.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: "#f59e0b" }}>{i + 1}</td>
                  <td>{p.productName || p.name}</td>
                  <td>{fmt(p.totalQuantity || p.soldCount)}</td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>{fmtMoney(p.totalRevenue)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="adm-card">
          <div className="adm-card-header">💎 Top khách hàng chi tiêu</div>
          {topSpenders.length === 0 ? <p className="adm-empty">Chưa có dữ liệu</p> : (
            <table className="adm-table">
              <thead><tr><th>#</th><th>Khách hàng</th><th>Đơn</th><th>Chi tiêu</th></tr></thead>
              <tbody>{topSpenders.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: "#6366f1" }}>{i + 1}</td>
                  <td>{s.fullName || s.username || s.userId}</td>
                  <td>{fmt(s.totalOrders)}</td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>{fmtMoney(s.totalSpent)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <div className="adm-card" style={{ marginTop: 20 }}>
        <div className="adm-card-header">🕐 Đơn hàng gần đây</div>
        {recentOrders.length === 0 ? <p className="adm-empty">Chưa có đơn hàng</p> : (
          <table className="adm-table">
            <thead><tr><th>Mã đơn</th><th>User ID</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th></tr></thead>
            <tbody>{recentOrders.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{String(o.id).slice(0, 16)}...</td>
                <td>{o.userId}</td>
                <td style={{ color: "#10b981", fontWeight: 600 }}>{fmtMoney(o.totalAmount)}</td>
                <td><Badge status={o.status} /></td>
                <td style={{ color: "#6b7280", fontSize: 12 }}>{o.createdDate ? new Date(o.createdDate).toLocaleDateString("vi-VN") : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── TAB: SẢN PHẨM ───────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [catDist, setCatDist] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadProducts = useCallback(() => {
    setLoading(true);
    api.get(`/products?page=${page}&size=12&sort=id,desc`)
      .then(r => { const d = r.data?.data; setProducts(d?.content || []); setTotalPages(d?.totalPages || 1); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadProducts();
    api.get(`/categories?size=100`).then(r => setCategories(r.data?.data?.content || [])).catch(() => { });
    Promise.allSettled([
      api.get(`/products/analytics/low-stock?threshold=5`),
      api.get(`/products/analytics/top-rated?limit=5`),
      api.get(`/products/analytics/category-distribution`),
      api.get(`/products/analytics/summary`),
    ]).then(res => {
      if (res[0].status === "fulfilled") setLowStock(res[0].value.data?.data || []);
      if (res[1].status === "fulfilled") setTopRated(res[1].value.data?.data || []);
      if (res[2].status === "fulfilled") setCatDist(res[2].value.data?.data || []);
      if (res[3].status === "fulfilled") setProductStats(res[3].value.data?.data);
    });
  }, [loadProducts]);

  const openCreate = () => { setForm({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" }); setImageFile(null); setEditId(null); setModal("form"); };
  const openEdit = p => { setForm({ name: p.name || "", description: p.description || "", price: p.price || "", stock: p.stock || "", imageUrl: p.imageUrl || "", categoryId: p.categoryId || "" }); setImageFile(null); setEditId(p.id); setModal("form"); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock || !form.categoryId) { alert("Vui lòng điền đủ thông tin!"); return; }
    setSaving(true);
    try {
      const body = { data: { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), categoryId: parseInt(form.categoryId) } };
      let savedProduct = null;
      if (editId) {
        const response = await api.post(`/products/${editId}`, body);
        savedProduct = response.data?.data || response.data;
      } else {
        const response = await api.post(`/products`, body);
        savedProduct = response.data?.data || response.data;
      }

      const productId = editId || savedProduct?.id;
      if (imageFile && productId) {
        const formData = new FormData();
        formData.append("file", imageFile);
        await api.post(`/products/${productId}/image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      setModal(null); loadProducts();
    } catch (e) { alert(e.response?.data?.message || "Lỗi lưu sản phẩm"); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    try { await api.delete(`/products/${id}`); loadProducts(); }
    catch (e) { alert(e.response?.data?.message || "Lỗi xoá sản phẩm"); }
    setConfirmDelete(null);
  };

  const filtered = products.filter(p => {
    const matchS = !search || (p.name || "").toLowerCase().includes(search.toLowerCase());
    const matchC = !catFilter || String(p.categoryId) === catFilter;
    return matchS && matchC;
  });

  return (
    <div>
      <h2 className="adm-section-title">📦 Quản lý Sản phẩm</h2>
      <div className="adm-stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard icon="📦" label="Tổng sản phẩm" value={fmt(productStats?.totalProducts)} color="#3b82f6" />
        <StatCard icon="⭐" label="Đánh giá TB" value={productStats?.averageRating != null ? productStats.averageRating.toFixed(1) + " ★" : "—"} color="#f59e0b" />
        <StatCard icon="⚠️" label="Sắp hết hàng (≤5)" value={fmt(lowStock.length)} color="#ef4444" />
        <StatCard icon="🏆" label="SP yêu thích" value={fmt(productStats?.totalFavorites)} color="#ec4899" />
      </div>
      {catDist.length > 0 && (
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <div className="adm-card-header">📊 Phân bố sản phẩm theo danh mục</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "12px 16px" }}>
            {catDist.map((c, i) => (
              <div key={i} style={{ background: "#f3f4f6", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: "#6366f1" }}>{fmt(c.count)}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{c.categoryName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="adm-toolbar">
        <input className="adm-search-input" placeholder="🔍 Tìm tên sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="adm-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>
      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-card">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>Không có sản phẩm</td></tr>
                : filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className="adm-tag">{p.categoryName}</span></td>
                    <td style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(p.price)}</td>
                    <td><span style={{ color: p.stock <= 5 ? "#ef4444" : "#374151", fontWeight: p.stock <= 5 ? 700 : 400 }}>{p.stock <= 5 && "⚠️ "}{fmt(p.stock)}</span></td>
                    <td>
                      <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => openEdit(p)}>✏️ Sửa</button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => setConfirmDelete(p.id)} style={{ marginLeft: 6 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="adm-pagination">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="adm-btn adm-btn-ghost adm-btn-sm">← Trước</button>
            <span>Trang {page + 1} / {totalPages || 1}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="adm-btn adm-btn-ghost adm-btn-sm">Sau →</button>
          </div>
        </div>
      )}
      {topRated.length > 0 && (
        <div className="adm-card" style={{ marginTop: 20 }}>
          <div className="adm-card-header">⭐ Top sản phẩm đánh giá cao</div>
          <table className="adm-table">
            <thead><tr><th>#</th><th>Sản phẩm</th><th>Rating</th></tr></thead>
            <tbody>{topRated.map((p, i) => (
              <tr key={p.id}><td style={{ color: "#f59e0b", fontWeight: 700 }}>{i + 1}</td><td>{p.name}</td><td>⭐ {p.averageRating?.toFixed(1) || "—"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="adm-card" style={{ marginTop: 20, borderLeft: "4px solid #ef4444" }}>
          <div className="adm-card-header" style={{ color: "#ef4444" }}>⚠️ Cảnh báo sắp hết hàng</div>
          <table className="adm-table">
            <thead><tr><th>Sản phẩm</th><th>Tồn kho</th><th>Giá</th></tr></thead>
            <tbody>{lowStock.map(p => (
              <tr key={p.id}><td>{p.name}</td><td style={{ color: "#ef4444", fontWeight: 700 }}>{p.stock}</td><td>{fmtMoney(p.price)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal === "form" && (
        <Modal title={editId ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm mới"} onClose={() => setModal(null)}>
          <div className="adm-form-grid">
            <div className="adm-field"><label>Tên sản phẩm *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tên sản phẩm..." /></div>
            <div className="adm-field"><label>Danh mục *</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="adm-field"><label>Giá bán (đ) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="15000000" /></div>
            <div className="adm-field"><label>Tồn kho *</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="100" /></div>
            
            <div className="adm-field" style={{ gridColumn: "span 2" }}>
              <label>Hình ảnh sản phẩm (Upload lên MinIO) {editId && "(Bỏ qua nếu không muốn thay đổi)"}</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImageFile(e.target.files[0])} 
                style={{ border: "1.5px dashed #ccc", padding: "8px", borderRadius: "9px" }}
              />
              {form.imageUrl && (
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280" }}>
                  Ảnh hiện tại: <a href={form.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", textDecoration: "underline" }}>Xem ảnh</a>
                </div>
              )}
            </div>

            <div className="adm-field" style={{ gridColumn: "span 2" }}><label>Mô tả</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả sản phẩm..." /></div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Huỷ</button>
            <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : (editId ? "Cập nhật" : "Tạo mới")}</button>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmModal message="Bạn có chắc muốn xoá sản phẩm này không?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

// ── TAB: DANH MỤC ───────────────────────────────────
function CategoriesTab() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/categories?size=100`).then(r => setCats(r.data?.data?.content || [])).catch(() => setCats([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const openCreate = () => { setForm({ name: "", description: "" }); setEditId(null); setModal(true); };
  const openEdit = c => { setForm({ name: c.name || "", description: c.description || "" }); setEditId(c.id); setModal(true); };
  const handleSave = async () => {
    if (!form.name) { alert("Vui lòng nhập tên danh mục!"); return; }
    setSaving(true);
    try {
      if (editId) await api.post(`/categories/${editId}`, { data: form });
      else await api.post(`/categories`, { data: form });
      setModal(false); load();
    } catch (e) { alert(e.response?.data?.message || "Lỗi lưu danh mục"); }
    finally { setSaving(false); }
  };
  const handleDelete = async id => {
    try { await api.delete(`/categories/${id}`); load(); }
    catch (e) { alert(e.response?.data?.message || "Lỗi xoá danh mục"); }
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="adm-section-title">🏷️ Quản lý Danh mục</h2>
      <div className="adm-toolbar">
        <span style={{ color: "#6b7280" }}>Tổng: <b>{cats.length}</b> danh mục</span>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ Thêm danh mục</button>
      </div>
      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-card">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Tên danh mục</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
            <tbody>{cats.map(c => (
              <tr key={c.id}>
                <td style={{ color: "#9ca3af", fontSize: 12 }}>#{c.id}</td>
                <td style={{ fontWeight: 700 }}>{c.name}</td>
                <td style={{ color: "#6b7280" }}>{c.description}</td>
                <td>
                  <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => openEdit(c)}>✏️ Sửa</button>
                  <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => setConfirmDelete(c.id)} style={{ marginLeft: 6 }}>🗑️</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={editId ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"} onClose={() => setModal(false)}>
          <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="adm-field"><label>Tên danh mục *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Điện thoại, Laptop..." /></div>
            <div className="adm-field"><label>Mô tả</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả danh mục..." /></div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)}>Huỷ</button>
            <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : (editId ? "Cập nhật" : "Tạo mới")}</button>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmModal message="Xoá danh mục này?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

// ── TAB: NGƯỜI DÙNG ──────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [topSpenders, setTopSpenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get(`/users?page=${page}&size=12&sort=id,desc`),
      api.get(`/users/analytics/summary`),
      api.get(`/users/analytics/top-spenders?limit=10`),
    ]).then(res => {
      if (res[0].status === "fulfilled") { const d = res[0].value.data?.data; setUsers(d?.content || []); setTotalPages(d?.totalPages || 1); }
      if (res[1].status === "fulfilled") setStats(res[1].value.data?.data);
      if (res[2].status === "fulfilled") setTopSpenders(res[2].value.data?.data || []);
      setLoading(false);
    });
  }, [page]);

  return (
    <div>
      <h2 className="adm-section-title">👤 Quản lý Người dùng</h2>
      <div className="adm-stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard icon="👥" label="Tổng người dùng" value={fmt(stats?.totalUsers)} color="#6366f1" />
        <StatCard icon="✅" label="Đã xác thực" value={fmt(stats?.verifiedUsers)} color="#10b981" />
        <StatCard icon="🆕" label="Đăng ký tháng này" value={fmt(stats?.newUsersThisMonth)} color="#3b82f6" />
        <StatCard icon="👑" label="Admin" value={fmt(stats?.totalAdmins)} color="#f59e0b" />
      </div>
      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-two-col" style={{ marginTop: 20 }}>
          <div className="adm-card">
            <div className="adm-card-header">📋 Danh sách người dùng</div>
            <table className="adm-table">
              <thead><tr><th>ID</th><th>Username</th><th>Họ tên</th><th>Email</th><th>Địa chỉ</th></tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: "#9ca3af", fontSize: 12 }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>{u.fullName}</td>
                  <td style={{ color: "#6b7280", fontSize: 12 }}>{u.email}</td>
                  <td style={{ color: "#6b7280", fontSize: 12 }}>{u.address || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="adm-pagination">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="adm-btn adm-btn-ghost adm-btn-sm">← Trước</button>
              <span>Trang {page + 1} / {totalPages || 1}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="adm-btn adm-btn-ghost adm-btn-sm">Sau →</button>
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-header">💎 Top khách hàng chi tiêu</div>
            {topSpenders.length === 0 ? <p className="adm-empty">Chưa có dữ liệu</p> : (
              <table className="adm-table">
                <thead><tr><th>#</th><th>Khách hàng</th><th>Đơn</th><th>Chi tiêu</th></tr></thead>
                <tbody>{topSpenders.map((s, i) => (
                  <tr key={i}><td style={{ fontWeight: 700, color: "#6366f1" }}>{i + 1}</td><td>{s.fullName || s.username || s.userId}</td><td>{fmt(s.totalOrders)}</td><td style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(s.totalSpent)}</td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: ĐƠN HÀNG ───────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("day");

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get("/orders"),
      api.get("/orders/analytics/summary"),
      api.get(`/orders/analytics/revenue-over-time?groupBy=${groupBy}`),
    ]).then(res => {
      if (res[0].status === "fulfilled") setOrders(res[0].value.data?.data || []);
      if (res[1].status === "fulfilled") setStats(res[1].value.data?.data);
      if (res[2].status === "fulfilled") setRevenue(res[2].value.data?.data || []);
      setLoading(false);
    });
  }, [groupBy]);

  return (
    <div>
      <h2 className="adm-section-title">🛒 Quản lý Đơn hàng</h2>
      <div className="adm-stat-grid">
        <StatCard icon="📋" label="Tổng đơn hàng" value={fmt(stats?.totalOrders)} color="#6366f1" />
        <StatCard icon="✅" label="Đã thanh toán" value={fmt(stats?.paidOrders)} color="#10b981" />
        <StatCard icon="⏳" label="Đang chờ" value={fmt(stats?.pendingOrders)} color="#f59e0b" />
        <StatCard icon="❌" label="Đã huỷ" value={fmt(stats?.cancelledOrders)} color="#ef4444" />
        <StatCard icon="💰" label="Doanh thu" value={fmtMoney(stats?.totalRevenue)} color="#10b981" />
        <StatCard icon="📦" label="Giá trị TB" value={fmtMoney(stats?.averageOrderValue)} color="#8b5cf6" />
      </div>
      {revenue.length > 0 && (
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>📈 Doanh thu theo thời gian</span>
            <select className="adm-select" style={{ width: "auto" }} value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
            </select>
          </div>
          <table className="adm-table">
            <thead><tr><th>Kỳ</th><th>Doanh thu</th><th>Số đơn</th></tr></thead>
            <tbody>{revenue.slice(-15).map((r, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "monospace" }}>{r.period || r.date || r.label}</td>
                <td style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(r.revenue || r.totalRevenue)}</td>
                <td>{fmt(r.orderCount || r.totalOrders)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-card">
          <div className="adm-card-header">📋 Tất cả đơn hàng ({orders.length})</div>
          <table className="adm-table">
            <thead><tr><th>Mã đơn</th><th>User ID</th><th>Địa chỉ</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th></tr></thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>Chưa có đơn hàng</td></tr>
                : orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{String(o.id).slice(0, 14)}...</td>
                    <td>{o.userId}</td>
                    <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.shippingAddress || o.address || "—"}</td>
                    <td style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(o.totalAmount)}</td>
                    <td><Badge status={o.status} /></td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{o.createdDate ? new Date(o.createdDate).toLocaleDateString("vi-VN") : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── TAB: THANH TOÁN ──────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get(`/payments?page=${page}&size=12&sort=createdDate,desc`),
      api.get(`/payments/analytics/summary`),
    ]).then(res => {
      if (res[0].status === "fulfilled") { const d = res[0].value.data?.data; setPayments(d?.content || []); setTotalPages(d?.totalPages || 1); }
      if (res[1].status === "fulfilled") setStats(res[1].value.data?.data);
      setLoading(false);
    });
  }, [page]);

  return (
    <div>
      <h2 className="adm-section-title">💳 Quản lý Thanh toán</h2>
      <div className="adm-stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard icon="💳" label="Tổng giao dịch" value={fmt(stats?.totalTransactions)} color="#6366f1" />
        <StatCard icon="✅" label="Thành công" value={fmt(stats?.successfulTransactions)} color="#10b981" />
        <StatCard icon="❌" label="Thất bại" value={fmt(stats?.failedTransactions)} color="#ef4444" />
        <StatCard icon="💰" label="Tổng doanh thu" value={fmtMoney(stats?.totalRevenue)} color="#10b981" />
      </div>
      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-card" style={{ marginTop: 20 }}>
          <div className="adm-card-header">📋 Lịch sử thanh toán</div>
          <table className="adm-table">
            <thead><tr><th>Mã GD</th><th>Mã đơn</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th><th>Ngày</th></tr></thead>
            <tbody>
              {payments.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>Chưa có dữ liệu</td></tr>
                : payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{p.transactionId || p.vnpTxnRef || p.id}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{p.orderId ? String(p.orderId).slice(0, 12) + "..." : "—"}</td>
                    <td style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(p.amount)}</td>
                    <td><span className="adm-tag">{p.paymentMethod}</span></td>
                    <td><Badge status={p.status} /></td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{p.createdDate ? new Date(p.createdDate).toLocaleDateString("vi-VN") : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="adm-pagination">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="adm-btn adm-btn-ghost adm-btn-sm">← Trước</button>
            <span>Trang {page + 1} / {totalPages || 1}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="adm-btn adm-btn-ghost adm-btn-sm">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: VOUCHER ─────────────────────────────────────
function VouchersTab() {
  const [vouchers, setVouchers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ code: "", discountType: "PERCENTAGE", discountValue: "", maxUsage: "", minOrderValue: "", expiryDate: "", active: true });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get(`/promotions?size=100`),
      api.get(`/promotions/analytics/summary`),
    ]).then(res => {
      if (res[0].status === "fulfilled") setVouchers(res[0].value.data?.data?.content || []);
      if (res[1].status === "fulfilled") setStats(res[1].value.data?.data);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);
  const openCreate = () => { setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", maxUsage: "", minOrderValue: "", expiryDate: "", active: true }); setEditId(null); setModal(true); };
  const openEdit = v => { setForm({ code: v.code || "", discountType: v.discountType || "PERCENTAGE", discountValue: v.discountValue || "", maxUsage: v.maxUsage || "", minOrderValue: v.minOrderValue || "", expiryDate: v.expiryDate ? v.expiryDate.substring(0, 10) : "", active: v.active ?? true }); setEditId(v.id); setModal(true); };
  const handleSave = async () => {
    if (!form.code || !form.discountValue) { alert("Vui lòng điền đủ thông tin!"); return; }
    setSaving(true);
    try {
      const body = { data: { ...form, discountValue: parseFloat(form.discountValue), maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null, minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : null } };
      if (editId) await api.post(`/promotions/${editId}`, body);
      else await api.post(`/promotions`, body);
      setModal(false); load();
    } catch (e) { alert(e.response?.data?.message || "Lỗi lưu voucher"); }
    finally { setSaving(false); }
  };
  const handleDelete = async id => {
    try { await api.delete(`/promotions/${id}`); load(); }
    catch (e) { alert(e.response?.data?.message || "Lỗi xoá voucher"); }
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="adm-section-title">🎫 Quản lý Voucher</h2>
      <div className="adm-stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard icon="🎫" label="Tổng voucher" value={fmt(stats?.totalVouchers || vouchers.length)} color="#ec4899" />
        <StatCard icon="✅" label="Đang hoạt động" value={fmt(stats?.activeVouchers)} color="#10b981" />
        <StatCard icon="🔖" label="Lượt dùng" value={fmt(stats?.totalUsed)} color="#6366f1" />
        <StatCard icon="💸" label="Đã tiết kiệm" value={fmtMoney(stats?.totalDiscountGiven || stats?.totalDiscount)} color="#f59e0b" />
      </div>
      <div className="adm-toolbar" style={{ marginTop: 20 }}>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>+ Tạo voucher mới</button>
      </div>
      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-card">
          <table className="adm-table">
            <thead><tr><th>Mã code</th><th>Loại</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Lượt dùng</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {vouchers.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>Chưa có voucher</td></tr>
                : vouchers.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#ec4899" }}>{v.code}</td>
                    <td><span className="adm-tag">{v.discountType === "PERCENTAGE" ? "%" : "Số tiền"}</span></td>
                    <td style={{ fontWeight: 700 }}>{v.discountType === "PERCENTAGE" ? `${v.discountValue}%` : fmtMoney(v.discountValue)}</td>
                    <td>{v.minOrderValue ? fmtMoney(v.minOrderValue) : "Không"}</td>
                    <td>{fmt(v.usageCount)}/{v.maxUsage || "∞"}</td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{v.expiryDate ? new Date(v.expiryDate).toLocaleDateString("vi-VN") : "Không hạn"}</td>
                    <td><Badge status={v.active ? "ACTIVE" : "INACTIVE"} /></td>
                    <td>
                      <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => openEdit(v)}>✏️</button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => setConfirmDelete(v.id)} style={{ marginLeft: 6 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={editId ? "✏️ Sửa voucher" : "🎫 Tạo voucher mới"} onClose={() => setModal(false)}>
          <div className="adm-form-grid">
            <div className="adm-field"><label>Mã code *</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER50" /></div>
            <div className="adm-field"><label>Loại giảm giá *</label>
              <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div className="adm-field"><label>Giá trị giảm *</label><input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "PERCENTAGE" ? "20" : "50000"} /></div>
            <div className="adm-field"><label>Đơn tối thiểu (đ)</label><input type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} placeholder="200000" /></div>
            <div className="adm-field"><label>Số lần dùng tối đa</label><input type="number" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} placeholder="100" /></div>
            <div className="adm-field"><label>Ngày hết hạn</label><input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
            <div className="adm-field" style={{ gridColumn: "span 2" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 16, height: 16 }} />
                Kích hoạt ngay
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)}>Huỷ</button>
            <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : (editId ? "Cập nhật" : "Tạo mới")}</button>
          </div>
        </Modal>
      )}
      {confirmDelete && <ConfirmModal message="Xoá voucher này?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

// ── TAB: PHÂN QUYỀN ──────────────────────────────────
function RolesTab() {
  const [permForm, setPermForm] = useState({ name: "", description: "" });
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [permMsg, setPermMsg] = useState({ text: "", isError: false });
  const [roleMsg, setRoleMsg] = useState({ text: "", isError: false });
  const [savingPerm, setSavingPerm] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const createPermission = async () => {
    if (!permForm.name) { setPermMsg({ text: "Vui lòng nhập tên quyền!", isError: true }); return; }
    setSavingPerm(true);
    try {
      await api.post("/auth/admin/permissions", permForm);
      setPermMsg({ text: "✅ Tạo permission thành công!", isError: false });
      setPermForm({ name: "", description: "" });
    } catch (e) { setPermMsg({ text: "❌ " + (e.response?.data?.message || "Lỗi tạo permission"), isError: true }); }
    finally { setSavingPerm(false); }
  };

  const createRole = async () => {
    if (!roleForm.name) { setRoleMsg({ text: "Vui lòng nhập tên role!", isError: true }); return; }
    setSavingRole(true);
    try {
      await api.post("/auth/admin/roles", roleForm);
      setRoleMsg({ text: "✅ Tạo role thành công!", isError: false });
      setRoleForm({ name: "", description: "" });
    } catch (e) { setRoleMsg({ text: "❌ " + (e.response?.data?.message || "Lỗi tạo role"), isError: true }); }
    finally { setSavingRole(false); }
  };

  return (
    <div>
      <h2 className="adm-section-title">🔐 Phân quyền &amp; Vai trò</h2>
      <div className="adm-two-col">
        <div className="adm-card">
          <div className="adm-card-header">🔑 Tạo Permission mới</div>
          <div style={{ padding: "20px" }}>
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>Permission quyết định hành động user được phép (VD: PRODUCT_CREATE, ORDER_VIEW...).</p>
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="adm-field">
                <label>Tên permission * <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 11 }}>(SCREAMING_SNAKE_CASE)</span></label>
                <input value={permForm.name} onChange={e => setPermForm({ ...permForm, name: e.target.value.toUpperCase() })} placeholder="PRODUCT_CREATE" />
              </div>
              <div className="adm-field"><label>Mô tả</label><input value={permForm.description} onChange={e => setPermForm({ ...permForm, description: e.target.value })} placeholder="Quyền tạo sản phẩm mới" /></div>
            </div>
            {permMsg.text && <div style={{ padding: "10px 14px", borderRadius: 8, marginTop: 12, background: permMsg.isError ? "#fee2e2" : "#d1fae5", color: permMsg.isError ? "#dc2626" : "#065f46", fontSize: 13 }}>{permMsg.text}</div>}
            <button className="adm-btn adm-btn-primary" onClick={createPermission} disabled={savingPerm} style={{ marginTop: 16, width: "100%" }}>{savingPerm ? "Đang tạo..." : "Tạo Permission"}</button>
          </div>
        </div>
        <div className="adm-card">
          <div className="adm-card-header">👑 Tạo Role mới</div>
          <div style={{ padding: "20px" }}>
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>Role là nhóm vai trò gán cho người dùng (VD: ROLE_ADMIN, ROLE_MANAGER...). Sau khi tạo sẽ đồng bộ vào Redis.</p>
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="adm-field">
                <label>Tên role * <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 11 }}>(ROLE_XXXXX)</span></label>
                <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })} placeholder="ROLE_MANAGER" />
              </div>
              <div className="adm-field"><label>Mô tả</label><input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Vai trò quản lý cấp trung" /></div>
            </div>
            {roleMsg.text && <div style={{ padding: "10px 14px", borderRadius: 8, marginTop: 12, background: roleMsg.isError ? "#fee2e2" : "#d1fae5", color: roleMsg.isError ? "#dc2626" : "#065f46", fontSize: 13 }}>{roleMsg.text}</div>}
            <button className="adm-btn adm-btn-primary" onClick={createRole} disabled={savingRole} style={{ marginTop: 16, width: "100%" }}>{savingRole ? "Đang tạo..." : "Tạo Role"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN: ADMIN PAGE ─────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const role = getRoleFromToken();
    setIsAdmin(role === "ADMIN");
  }, []);

  if (isAdmin === null) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "#6b7280", fontSize: 16 }}>
      ⏳ Đang kiểm tra quyền truy cập...
    </div>
  );

  if (!isAdmin) return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: 16, textAlign: "center" }}>
      <div style={{ fontSize: 80 }}>🚫</div>
      <h1 style={{ fontSize: 32, color: "#ef4444", fontWeight: 800 }}>403 — Truy cập bị từ chối</h1>
      <p style={{ color: "#6b7280", fontSize: 16 }}>Bạn không có quyền truy cập trang quản trị.<br />Vui lòng đăng nhập bằng tài khoản Admin.</p>
      <a href="/auth" style={{ background: "#ef4444", color: "#fff", padding: "12px 28px", borderRadius: 30, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>Đăng nhập ngay</a>
    </div>
  );

  const tabs = [
    { id: "overview",    icon: "📊", label: "Tổng quan" },
    { id: "products",    icon: "📦", label: "Sản phẩm" },
    { id: "categories",  icon: "🏷️", label: "Danh mục" },
    { id: "users",       icon: "👤", label: "Người dùng" },
    { id: "orders",      icon: "🛒", label: "Đơn hàng" },
    { id: "payments",    icon: "💳", label: "Thanh toán" },
    { id: "vouchers",    icon: "🎫", label: "Voucher" },
    { id: "roles",       icon: "🔐", label: "Phân quyền" },
  ];

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-brand-icon">⚙️</span>
          <div>
            <div className="adm-brand-name">Admin Portal</div>
            <div className="adm-brand-sub">Mini E-Commerce</div>
          </div>
        </div>
        <nav className="adm-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`adm-nav-item${activeTab === t.id ? " adm-nav-item-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="adm-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <a href="/" className="adm-back-link">← Về trang chủ</a>
        </div>
      </aside>
      <main className="adm-main">
        <div className="adm-topbar">
          <h1 className="adm-topbar-title">{tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}</h1>
          <div className="adm-topbar-right">
            <span className="adm-admin-badge">👑 ADMIN</span>
            <span style={{ color: "#6b7280", fontSize: 13 }}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
        <div className="adm-content">
          {activeTab === "overview"   && <OverviewTab />}
          {activeTab === "products"   && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "users"      && <UsersTab />}
          {activeTab === "orders"     && <OrdersTab />}
          {activeTab === "payments"   && <PaymentsTab />}
          {activeTab === "vouchers"   && <VouchersTab />}
          {activeTab === "roles"      && <RolesTab />}
        </div>
      </main>
    </div>
  );
}
