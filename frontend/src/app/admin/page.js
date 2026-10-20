"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/app/lib/api";

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
    PENDING:    { color: "#f59e0b", bg: "#fef3c7", label: "⏳ Chờ xử lý" },
    PAID:       { color: "#10b981", bg: "#d1fae5", label: "✅ Đã thanh toán" },
    PROCESSING: { color: "#2563eb", bg: "#eff6ff", label: "⚙️ Chuẩn bị hàng" },
    SHIPPING:   { color: "#0284c7", bg: "#e0f2fe", label: "🚚 Đang giao" },
    SHIPPED:    { color: "#0284c7", bg: "#e0f2fe", label: "🚚 Đang giao" },
    DELIVERED:  { color: "#059669", bg: "#d1fae5", label: "🎉 Đã giao hàng" },
    COMPLETED:  { color: "#059669", bg: "#d1fae5", label: "🎉 Hoàn tất" },
    CANCELLED:  { color: "#ef4444", bg: "#fee2e2", label: "❌ Đã huỷ" },
    ACTIVE:     { color: "#10b981", bg: "#d1fae5", label: "Hoạt động" },
    INACTIVE:   { color: "#6b7280", bg: "#f3f4f6", label: "Tạm dừng" },
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
  const [form, setForm] = useState({ name: "", description: "", price: "", originalPrice: "", stock: "", imageUrl: "", categoryId: "" });
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

  const openCreate = () => { setForm({ name: "", description: "", price: "", originalPrice: "", stock: "", imageUrl: "", categoryId: "" }); setImageFile(null); setEditId(null); setModal("form"); };
  const openEdit = p => { setForm({ name: p.name || "", description: p.description || "", price: p.price || "", originalPrice: p.originalPrice || "", stock: p.stock || "", imageUrl: p.imageUrl || "", categoryId: p.categoryId || "" }); setImageFile(null); setEditId(p.id); setModal("form"); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock || !form.categoryId) { alert("Vui lòng điền đủ thông tin!"); return; }
    setSaving(true);
    try {
      const body = {
        data: {
          ...form,
          price: parseFloat(form.price),
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
          stock: parseInt(form.stock),
          categoryId: parseInt(form.categoryId)
        }
      };
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
        await api.post(`/products/${productId}/image`, formData);
      }

      setModal(null); loadProducts();
    } catch (e) {
      console.error("Lỗi khi lưu sản phẩm:", e);
      alert(e.response?.data?.message || e.message || "Lỗi lưu sản phẩm");
    }
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
                    <td>
                      <div style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(p.price)}</div>
                      {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                        <div style={{ fontSize: "11.5px", color: "#9ca3af" }}>
                          <span style={{ textDecoration: "line-through" }}>{fmtMoney(p.originalPrice)}</span>
                          <span style={{ color: "#ef4444", marginLeft: "4px", fontWeight: "bold" }}>
                            -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </td>
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
            <div className="adm-field"><label>Giá bán thực tế (đ) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Ví dụ: 26990000" /></div>
            <div className="adm-field"><label>Giá gốc niêm yết (đ) (Để trống nếu không giảm)</label><input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="Ví dụ: 30000000" /></div>
            <div className="adm-field" style={{ gridColumn: "span 2" }}><label>Tồn kho *</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="100" /></div>
            
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

  // State cho Modal tạo nhân viên (ROLE_STAFF)
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ username: "", password: "", fullname: "", email: "", age: 25 });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMsg, setStaffMsg] = useState({ text: "", isError: false });

  const loadUsers = useCallback(() => {
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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffMsg({ text: "", isError: false });
    try {
      await api.post("/auth/register-staff", staffForm);
      setStaffMsg({ text: "🎉 Tạo tài khoản nhân viên thành công!", isError: false });
      setStaffForm({ username: "", password: "", fullname: "", email: "", age: 25 });
      setTimeout(() => {
        setShowStaffModal(false);
        setStaffMsg({ text: "", isError: false });
        loadUsers();
      }, 1500);
    } catch (err) {
      console.error("Lỗi tạo nhân viên:", err);
      setStaffMsg({
        text: err.response?.data?.message || "❌ Không thể tạo tài khoản nhân viên. Vui lòng kiểm tra lại!",
        isError: true
      });
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="adm-section-title" style={{ margin: 0 }}>👤 Quản lý Người dùng</h2>
        <button
          className="adm-btn adm-btn-primary"
          onClick={() => { setShowStaffModal(true); setStaffMsg({ text: "", isError: false }); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 14, fontWeight: 700 }}
        >
          <span>➕</span> Thêm nhân viên (Shipper)
        </button>
      </div>

      <div className="adm-stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard icon="👥" label="Tổng người dùng" value={fmt(stats?.totalUsers)} color="#6366f1" />
        <StatCard icon="✅" label="Đã xác thực" value={fmt(stats?.verifiedUsers)} color="#10b981" />
        <StatCard icon="🆕" label="Đăng ký tháng này" value={fmt(stats?.newUsersThisMonth)} color="#3b82f6" />
        <StatCard icon="👑" label="Admin" value={fmt(stats?.totalAdmins)} color="#f59e0b" />
      </div>

      {loading ? <div className="adm-loading">⏳ Đang tải...</div> : (
        <div className="adm-two-col" style={{ marginTop: 20 }}>
          <div className="adm-card">
            <div className="adm-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>📋 Danh sách người dùng</span>
            </div>
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

      {/* Modal Thêm Nhân viên */}
      {showStaffModal && (
        <Modal title="➕ Thêm Nhân viên mới (Kiêm Shipper)" onClose={() => setShowStaffModal(false)}>
          <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="adm-field">
              <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: "block" }}>Họ và tên nhân viên *</label>
              <input
                required
                className="adm-input"
                placeholder="VD: Nguyễn Văn Giao Hàng"
                value={staffForm.fullname}
                onChange={e => setStaffForm({ ...staffForm, fullname: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="adm-field">
                <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: "block" }}>Tên đăng nhập (Username) *</label>
                <input
                  required
                  className="adm-input"
                  placeholder="VD: shipper01"
                  value={staffForm.username}
                  onChange={e => setStaffForm({ ...staffForm, username: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </div>
              <div className="adm-field">
                <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: "block" }}>Mật khẩu khởi tạo *</label>
                <input
                  required
                  type="password"
                  className="adm-input"
                  placeholder="VD: Admin@123"
                  value={staffForm.password}
                  onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
                <span style={{ fontSize: 11, color: "#6b7280", marginTop: 4, display: "block" }}>
                  Ít nhất 8 ký tự: gồm chữ HOA, số & ký tự đặc biệt (@#$...)
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div className="adm-field">
                <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: "block" }}>Email liên hệ *</label>
                <input
                  required
                  type="email"
                  className="adm-input"
                  placeholder="VD: shipper01@dungthammobile.vn"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </div>
              <div className="adm-field">
                <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: "block" }}>Tuổi</label>
                <input
                  type="number"
                  className="adm-input"
                  min="18"
                  max="70"
                  value={staffForm.age}
                  onChange={e => setStaffForm({ ...staffForm, age: parseInt(e.target.value) || 20 })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#166534" }}>
              💡 <strong>Lưu ý:</strong> Tài khoản này sẽ được cấp vai trò <strong>ROLE_STAFF</strong> (được kích hoạt ngay không cần xác thực email), có quyền quản lý và giao đơn hàng trong tỉnh.
            </div>

            {staffMsg.text && (
              <div style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: staffMsg.isError ? "#fee2e2" : "#d1fae5",
                color: staffMsg.isError ? "#dc2626" : "#065f46",
                fontSize: 13,
                fontWeight: 600
              }}>
                {staffMsg.text}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={() => setShowStaffModal(false)}
                disabled={staffLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="adm-btn adm-btn-primary"
                disabled={staffLoading}
                style={{ minWidth: 120 }}
              >
                {staffLoading ? "Đang tạo..." : "Xác nhận tạo"}
              </button>
            </div>
          </form>
        </Modal>
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
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrdersData = useCallback(() => {
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

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Hàm Admin cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!newStatus) return;
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      alert(`✅ Cập nhật thành công! Đơn hàng đã chuyển sang trạng thái: ${newStatus}`);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đơn:", err);
      alert(err.response?.data?.message || "❌ Không thể cập nhật trạng thái đơn hàng!");
    } finally {
      setUpdatingId(null);
    }
  };

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
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>User ID</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th style={{ textAlign: "center", minWidth: 260 }}>Thao tác đổi trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>Chưa có đơn hàng</td></tr>
                : orders.map(o => {
                  const s = (o.status || "PENDING").toUpperCase();
                  const isUpdating = updatingId === o.id;

                  return (
                    <tr key={o.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{String(o.id).slice(0, 14)}...</td>
                      <td>{o.userId}</td>
                      <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.shippingAddress || o.address || "—"}</td>
                      <td style={{ color: "#10b981", fontWeight: 700 }}>{fmtMoney(o.totalAmount || o.totalPrice)}</td>
                      <td><Badge status={o.status} /></td>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>{o.createdDate ? new Date(o.createdDate).toLocaleDateString("vi-VN") : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                          
                          {/* Nút hành động nhanh theo bước quy trình */}
                          {s === "PENDING" && (
                            <>
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(o.id, "PROCESSING")}
                                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "#3b82f6", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                              >
                                ⚙️ Chuẩn bị hàng
                              </button>
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(o.id, "CANCELLED")}
                                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                              >
                                ❌ Hủy
                              </button>
                            </>
                          )}

                          {s === "PAID" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(o.id, "PROCESSING")}
                              style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" }}
                            >
                              ⚙️ Chuẩn bị hàng
                            </button>
                          )}

                          {s === "PROCESSING" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(o.id, "SHIPPING")}
                              style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "#0284c7", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(2, 132, 199, 0.2)" }}
                            >
                              🚚 Giao hàng
                            </button>
                          )}

                          {s === "SHIPPING" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(o.id, "DELIVERED")}
                              style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "#059669", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)" }}
                            >
                              🎉 Giao thành công
                            </button>
                          )}

                          {/* Dropdown chuyển trực tiếp bất kỳ trạng thái nào */}
                          <select
                            value={s}
                            disabled={isUpdating}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "600",
                              border: "1px solid #cbd5e1",
                              background: "white",
                              cursor: "pointer",
                              outline: "none"
                            }}
                          >
                            <option value="PENDING">Chờ xử lý (PENDING)</option>
                            <option value="PAID">Đã thanh toán (PAID)</option>
                            <option value="PROCESSING">Chuẩn bị hàng (PROCESSING)</option>
                            <option value="SHIPPING">Đang giao (SHIPPING)</option>
                            <option value="DELIVERED">Giao thành công (DELIVERED)</option>
                            <option value="CANCELLED">Hủy đơn (CANCELLED)</option>
                          </select>

                        </div>
                      </td>
                    </tr>
                  );
                })}
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

// ── TAB: QUẢN LÝ BANNER (MINIO) ──────────────────────
function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", linkUrl: "", displayOrder: 0, active: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/banners/all");
      const list = res.data?.data || [];
      setBanners(list);
    } catch (e) {
      try {
        const res2 = await api.get("/products/banners");
        setBanners(res2.data?.data || []);
      } catch (err) {
        console.error("Lỗi tải banners:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const openCreate = () => {
    setForm({ title: "", linkUrl: "", displayOrder: (banners.length + 1), active: true });
    setImageFile(null);
    setImagePreview(null);
    setMsg(null);
    setModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!imageFile) {
      alert("Vui lòng chọn file hình ảnh cho Banner!");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      if (form.title) formData.append("title", form.title);
      if (form.linkUrl) formData.append("linkUrl", form.linkUrl);
      formData.append("displayOrder", String(form.displayOrder || 0));
      formData.append("active", String(form.active));

      await api.post("/products/banners", formData);
      setModal(false);
      loadBanners();
    } catch (e) {
      console.error("Lỗi khi lưu banner:", e);
      setMsg(e.response?.data?.message || "Không thể upload banner lên MinIO. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/products/banners/${id}/toggle`);
      loadBanners();
    } catch (e) {
      alert("Không thể đổi trạng thái banner: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/banners/${id}`);
      setConfirmDelete(null);
      setBanners(prev => prev.filter(b => b.id !== id));
      alert("✅ Đã xóa banner thành công!");
      loadBanners();
    } catch (e) {
      alert("Lỗi khi xóa banner: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div>
      <div className="adm-actions-bar">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Danh sách Banner Trang chủ</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            Ảnh banner được lưu trữ trực tiếp trên <strong>MinIO</strong> và đồng bộ tự động lên Trang chủ.
          </p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>
          + Thêm Banner mới (Upload MinIO)
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#ID</th>
                <th style={{ width: 220 }}>Hình ảnh (MinIO)</th>
                <th>Tiêu đề &amp; Liên kết</th>
                <th style={{ width: 100, textAlign: "center" }}>Thứ tự</th>
                <th style={{ width: 140, textAlign: "center" }}>Trạng thái</th>
                <th style={{ width: 120, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Đang tải danh sách banner từ MinIO &amp; Database...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Chưa có banner nào. Hãy bấm "+ Thêm Banner mới" để upload ảnh lên MinIO!</td></tr>
              ) : (
                banners.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: "#9ca3af", fontWeight: 700 }}>#{b.id}</td>
                    <td>
                      <div style={{ width: 190, height: 75, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                        <img 
                          src={b.imageUrl} 
                          alt={b.title || "Banner"} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                        {b.title || "(Không có tiêu đề)"}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Liên kết: {b.linkUrl ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>{b.linkUrl}</a> : <span style={{ color: "#9ca3af" }}>Không có</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#475569" }}>
                      {b.displayOrder}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button 
                        onClick={() => handleToggle(b.id)}
                        className={`adm-badge ${b.active ? "adm-badge-success" : "adm-badge-neutral"}`}
                        style={{ cursor: "pointer", border: "none", padding: "5px 12px", borderRadius: 20 }}
                        title="Bấm để Bật/Tắt hiển thị"
                      >
                        {b.active ? "● Đang hiển thị" : "○ Đã ẩn"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="adm-btn adm-btn-sm adm-btn-danger" 
                        onClick={() => setConfirmDelete(b.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none" }}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Banner mới */}
      {modal && (
        <div className="adm-modal-overlay" onClick={() => !saving && setModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>🖼️ Upload Banner mới lên MinIO</h3>
              <button className="adm-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr", gap: 14 }}>
              <div className="adm-field">
                <label>File hình ảnh Banner * (Lưu vào MinIO bucket 'products/banners')</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ border: "1.5px dashed #cbd5e1", padding: 10, borderRadius: 8, background: "#f8fafc" }}
                />
              </div>

              {imagePreview && (
                <div style={{ marginTop: 4, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, padding: "4px 8px", background: "#f1f5f9", color: "#64748b" }}>Xem trước ảnh:</div>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover" }} />
                </div>
              )}

              <div className="adm-field">
                <label>Tiêu đề Banner</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="Ví dụ: Đại tiệc iPhone 16 Pro Max - Giảm ngay 2 triệu" 
                />
              </div>

              <div className="adm-field">
                <label>Đường dẫn khi click (URL hoặc đường dẫn nội bộ)</label>
                <input 
                  value={form.linkUrl} 
                  onChange={e => setForm({ ...form, linkUrl: e.target.value })} 
                  placeholder="Ví dụ: /category/1 hoặc /product/14" 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="adm-field">
                  <label>Thứ tự hiển thị (Số nhỏ hiện trước)</label>
                  <input 
                    type="number" 
                    value={form.displayOrder} 
                    onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} 
                  />
                </div>
                <div className="adm-field" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
                    <input 
                      type="checkbox" 
                      checked={form.active} 
                      onChange={e => setForm({ ...form, active: e.target.checked })} 
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Hiển thị ngay trên Trang chủ</span>
                  </label>
                </div>
              </div>

              {msg && (
                <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                  ⚠️ {msg}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)} disabled={saving}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang upload MinIO..." : "☁️ Upload & Lưu Banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ color: "#ef4444" }}>🗑️ Xác nhận xóa Banner</h3>
              <button className="adm-modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ color: "#4b5563", fontSize: 14 }}>
              Bạn có chắc chắn muốn xóa banner <strong>#{confirmDelete}</strong>? File ảnh trên MinIO cũng sẽ được thu hồi.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(confirmDelete)}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: QUẢN LÝ BADGE QUẢNG CÁO (MINIO) ───────────
function PromoBadgesTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", linkUrl: "", displayOrder: 1, active: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState(null);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/badges/all");
      setBadges(res.data?.data || []);
    } catch (e) {
      try {
        const res2 = await api.get("/products/badges");
        setBadges(res2.data?.data || []);
      } catch (err) {
        console.error("Lỗi tải badges:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBadges(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ title: "", linkUrl: "#", displayOrder: (badges.length + 1), active: true });
    setImageFile(null);
    setImagePreview(null);
    setMsg(null);
    setModal(true);
  };

  const openEdit = (b) => {
    setEditId(b.id);
    setForm({ title: b.title, linkUrl: b.linkUrl || "#", displayOrder: b.displayOrder, active: b.active });
    setImageFile(null);
    setImagePreview(b.iconUrl);
    setMsg(null);
    setModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!editId && !imageFile) {
      alert("Vui lòng chọn file hình ảnh/icon cho Badge!");
      return;
    }
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề cho Badge!");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const formData = new FormData();
      if (imageFile) formData.append("file", imageFile);
      formData.append("title", form.title);
      if (form.linkUrl) formData.append("linkUrl", form.linkUrl);
      formData.append("displayOrder", String(form.displayOrder || 0));
      formData.append("active", String(form.active));

      if (editId) {
        await api.put(`/products/badges/${editId}`, formData);
        alert("✅ Cập nhật badge thành công!");
      } else {
        await api.post("/products/badges", formData);
        alert("✅ Thêm mới badge MinIO thành công!");
      }
      setModal(false);
      loadBadges();
    } catch (e) {
      console.error("Lỗi khi lưu badge:", e);
      setMsg(e.response?.data?.message || "Không thể upload badge lên MinIO. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/products/badges/${id}/toggle`);
      loadBadges();
    } catch (e) {
      alert("Không thể đổi trạng thái badge: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/badges/${id}`);
      setConfirmDelete(null);
      setBadges(prev => prev.filter(b => b.id !== id));
      alert("✅ Đã xóa badge thành công!");
      loadBadges();
    } catch (e) {
      alert("Lỗi khi xóa badge: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div>
      <div className="adm-actions-bar">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Quản lý Khung Badge Quảng Cáo Trang Chủ</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            Ảnh icon badge được lưu trữ trực tiếp trên <strong>MinIO</strong> và đồng bộ trên 5 ô đầu Trang chủ.
          </p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openCreate}>
          + Thêm Badge mới (Upload MinIO)
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#ID</th>
                <th style={{ width: 100, textAlign: "center" }}>Icon (MinIO)</th>
                <th>Tiêu đề &amp; Liên kết</th>
                <th style={{ width: 90, textAlign: "center" }}>Thứ tự</th>
                <th style={{ width: 140, textAlign: "center" }}>Trạng thái</th>
                <th style={{ width: 150, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Đang tải danh sách badge từ MinIO &amp; Database...</td></tr>
              ) : badges.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Chưa có badge nào. Bấm "+ Thêm Badge mới" để upload ảnh icon lên MinIO!</td></tr>
              ) : (
                badges.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: "#9ca3af", fontWeight: 700 }}>#{b.id}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img 
                          src={b.iconUrl} 
                          alt={b.title} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Liên kết: {b.linkUrl && b.linkUrl !== "#" ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>{b.linkUrl}</a> : <span style={{ color: "#9ca3af" }}>Mặc định (#)</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#475569" }}>
                      {b.displayOrder}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button 
                        onClick={() => handleToggle(b.id)}
                        className={`adm-badge ${b.active ? "adm-badge-success" : "adm-badge-neutral"}`}
                        style={{ cursor: "pointer", border: "none", padding: "5px 12px", borderRadius: 20 }}
                        title="Bấm để Bật/Tắt hiển thị"
                      >
                        {b.active ? "● Đang hiển thị" : "○ Đã ẩn"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button 
                          className="adm-btn adm-btn-sm adm-btn-ghost" 
                          onClick={() => openEdit(b)}
                        >
                          ✏️ Sửa
                        </button>
                        <button 
                          className="adm-btn adm-btn-sm adm-btn-danger" 
                          onClick={() => setConfirmDelete(b.id)}
                          style={{ background: "#fee2e2", color: "#dc2626", border: "none" }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Badge */}
      {modal && (
        <div className="adm-modal-overlay" onClick={() => !saving && setModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editId ? "✏️ Chỉnh sửa Badge Quảng Cáo" : "🖼️ Upload Badge mới lên MinIO"}</h3>
              <button className="adm-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr", gap: 14 }}>
              <div className="adm-field">
                <label>File hình ảnh Icon * (Lưu vào MinIO bucket 'products/badges')</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ border: "1.5px dashed #cbd5e1", padding: 10, borderRadius: 8, background: "#f8fafc" }}
                />
              </div>

              {imagePreview && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>Xem trước hiển thị Icon</span>
                </div>
              )}

              <div className="adm-field">
                <label>Tiêu đề Badge * (Dòng chữ hiển thị dưới Icon)</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="Ví dụ: Tải App nhận voucher 10%" 
                />
              </div>

              <div className="adm-field">
                <label>Đường dẫn khi click (URL hoặc link điều hướng)</label>
                <input 
                  value={form.linkUrl} 
                  onChange={e => setForm({ ...form, linkUrl: e.target.value })} 
                  placeholder="Ví dụ: /category/1 hoặc #" 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="adm-field">
                  <label>Thứ tự hiển thị (1 đến 5)</label>
                  <input 
                    type="number" 
                    value={form.displayOrder} 
                    onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} 
                  />
                </div>
                <div className="adm-field" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
                    <input 
                      type="checkbox" 
                      checked={form.active} 
                      onChange={e => setForm({ ...form, active: e.target.checked })} 
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Hiển thị trên Trang chủ</span>
                  </label>
                </div>
              </div>

              {msg && (
                <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                  ⚠️ {msg}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(false)} disabled={saving}>Hủy</button>
              <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : (editId ? "💾 Cập nhật Badge" : "☁️ Upload & Tạo Badge")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ color: "#ef4444" }}>🗑️ Xác nhận xóa Badge</h3>
              <button className="adm-modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ color: "#4b5563", fontSize: 14 }}>
              Bạn có chắc chắn muốn xóa badge <strong>#{confirmDelete}</strong>? File ảnh trên MinIO cũng sẽ được dọn dẹp.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(confirmDelete)}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN: ADMIN PAGE ─────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState(null); // 'ADMIN' | 'STAFF' | null

  useEffect(() => {
    const role = getRoleFromToken();
    if (role === "ADMIN" || role === "ROLE_ADMIN") {
      setUserRole("ADMIN");
      setActiveTab("overview");
    } else if (role === "STAFF" || role === "ROLE_STAFF") {
      setUserRole("STAFF");
      setActiveTab("orders"); // Nhân viên/Shipper vào thẳng tab Đơn hàng
    } else {
      setUserRole("UNAUTHORIZED");
    }
  }, []);

  if (userRole === null) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "#6b7280", fontSize: 16 }}>
      ⏳ Đang kiểm tra quyền truy cập...
    </div>
  );

  if (userRole === "UNAUTHORIZED") return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: 16, textAlign: "center" }}>
      <div style={{ fontSize: 80 }}>🚫</div>
      <h1 style={{ fontSize: 32, color: "#ef4444", fontWeight: 800 }}>403 — Truy cập bị từ chối</h1>
      <p style={{ color: "#6b7280", fontSize: 16 }}>Bạn không có quyền truy cập trang quản trị.<br />Vui lòng đăng nhập bằng tài khoản Quản trị viên hoặc Nhân viên.</p>
      <a href="/auth" style={{ background: "#ef4444", color: "#fff", padding: "12px 28px", borderRadius: 30, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>Đăng nhập ngay</a>
    </div>
  );

  const allTabs = [
    { id: "overview",    icon: "📊", label: "Tổng quan",      adminOnly: true },
    { id: "banners",     icon: "🖼️", label: "Quản lý Banner", adminOnly: true },
    { id: "badges",      icon: "🏷️", label: "Badge Quảng Cáo", adminOnly: true },
    { id: "products",    icon: "📦", label: "Sản phẩm",       adminOnly: true },
    { id: "categories",  icon: "📂", label: "Danh mục",       adminOnly: true },
    { id: "users",       icon: "👤", label: "Người dùng",     adminOnly: true },
    { id: "orders",      icon: "🛒", label: "Đơn hàng & Giao hàng", adminOnly: false },
    { id: "payments",    icon: "💳", label: "Thanh toán",     adminOnly: true },
    { id: "vouchers",    icon: "🎫", label: "Voucher",        adminOnly: true },
    { id: "roles",       icon: "🔐", label: "Phân quyền",     adminOnly: true },
  ];

  const tabs = userRole === "ADMIN" ? allTabs : allTabs.filter(t => !t.adminOnly);

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-brand-icon">{userRole === "ADMIN" ? "⚙️" : "🚚"}</span>
          <div>
            <div className="adm-brand-name">{userRole === "ADMIN" ? "Admin Portal" : "Shipper / Staff"}</div>
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
        <div className="adm-sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <a href="/staff" className="adm-back-link" style={{ color: "#38bdf8" }}>🛵 Xem cổng Shipper Hub →</a>
          <a href="/" className="adm-back-link">← Về trang chủ</a>
        </div>
      </aside>
      <main className="adm-main">
        <div className="adm-topbar">
          <h1 className="adm-topbar-title">{tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}</h1>
          <div className="adm-topbar-right">
            <span className={userRole === "ADMIN" ? "adm-admin-badge" : "adm-admin-badge"} style={userRole === "STAFF" ? { background: "#0284c7" } : {}}>
              {userRole === "ADMIN" ? "👑 ADMIN" : "🛵 NHÂN VIÊN / SHIPPER"}
            </span>
            <span style={{ color: "#6b7280", fontSize: 13 }}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
        <div className="adm-content">
          {activeTab === "overview"   && <OverviewTab />}
          {activeTab === "banners"    && <BannersTab />}
          {activeTab === "badges"     && <PromoBadgesTab />}
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
