"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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

function StatCard({ icon, label, value, color, subText }) {
  return (
    <div className="adm-stat-card" style={{ borderTop: `4px solid ${color}`, background: "white" }}>
      <div className="adm-stat-icon" style={{ color }}>{icon}</div>
      <div className="adm-stat-body">
        <div className="adm-stat-value" style={{ fontSize: 24, fontWeight: 800 }}>{value ?? "—"}</div>
        <div className="adm-stat-label" style={{ fontWeight: 600, color: "#4b5563" }}>{label}</div>
        {subText && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{subText}</div>}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    PENDING:    { color: "#f59e0b", bg: "#fef3c7", label: "⏳ Chờ xác nhận" },
    PAID:       { color: "#10b981", bg: "#d1fae5", label: "✅ Đã thanh toán" },
    PROCESSING: { color: "#2563eb", bg: "#eff6ff", label: "⚙️ Chờ lấy hàng" },
    SHIPPING:   { color: "#0284c7", bg: "#e0f2fe", label: "🚚 Đang đi giao" },
    DELIVERED:  { color: "#059669", bg: "#d1fae5", label: "🎉 Đã giao hàng" },
    CANCELLED:  { color: "#ef4444", bg: "#fee2e2", label: "❌ Đã huỷ" },
  };
  const s = map[status?.toUpperCase()] || { color: "#6b7280", bg: "#f3f4f6", label: status };
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// Các huyện thị tại tỉnh Hà Nam để gom nhóm tuyến giao hàng
const HA_NAM_DISTRICTS = [
  { key: "phuly", name: "TP. Phủ Lý", keywords: ["phủ lý", "phu ly", "minh khai", "liêm chính", "trần hưng đạo", "châu sơn", "quang trung", "lê hồng phong"] },
  { key: "duytien", name: "Thị xã Duy Tiên", keywords: ["duy tiên", "duy tien", "đồng văn", "dong van", "hòa mạc", "châu giang"] },
  { key: "kimbang", name: "Huyện Kim Bảng", keywords: ["kim bảng", "kim bang", "quế", "ba sao", "tam chúc"] },
  { key: "thanhliem", name: "Huyện Thanh Liêm", keywords: ["thanh liêm", "thanh liem", "kiện khê", "liêm cần"] },
  { key: "lynhan", name: "Huyện Lý Nhân", keywords: ["lý nhân", "ly nhan", "vĩnh trụ", "hòa hậu"] },
  { key: "binhluc", name: "Huyện Bình Lục", keywords: ["bình lục", "binh luc", "bình mỹ", "an mỹ"] },
];

function detectDistrict(address = "") {
  const lower = address.toLowerCase();
  for (const d of HA_NAM_DISTRICTS) {
    if (d.keywords.some(k => lower.includes(k))) return d.name;
  }
  return "Khu vực khác (Hà Nam)";
}

export default function StaffPortalPage() {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'orders'
  const [userRole, setUserRole] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // 'ACTIVE' (Cần giao) | 'ALL' | 'DELIVERED'

  // Kiểm tra quyền truy cập: Chỉ STAFF hoặc ADMIN
  useEffect(() => {
    const role = getRoleFromToken();
    if (role === "STAFF" || role === "ROLE_STAFF" || role === "ADMIN" || role === "ROLE_ADMIN") {
      setUserRole(role.replace("ROLE_", ""));
    } else {
      setUserRole("UNAUTHORIZED");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng cho Staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userRole && userRole !== "UNAUTHORIZED") {
      fetchOrders();
    }
  }, [userRole, fetchOrders]);

  // Cập nhật trạng thái đơn hàng (Bắt đầu giao, Đã giao thành công...)
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      alert(`✅ Cập nhật thành công đơn hàng #${orderId} sang trạng thái: ${newStatus}`);
    } catch (err) {
      console.error("Lỗi cập nhật đơn hàng:", err);
      alert(err.response?.data?.message || "❌ Không thể cập nhật trạng thái đơn!");
    } finally {
      setUpdatingId(null);
    }
  };

  // Tính toán số liệu thống kê tác nghiệp của Shipper
  const stats = useMemo(() => {
    let processing = 0;
    let shipping = 0;
    let delivered = 0;
    let codTotal = 0;

    orders.forEach(o => {
      const st = (o.status || "").toUpperCase();
      if (st === "PROCESSING" || st === "PAID") processing++;
      if (st === "SHIPPING") shipping++;
      if (st === "DELIVERED") {
        delivered++;
        // Đơn giao thành công hình thức COD là tiền mặt shipper đang giữ nộp lại shop
        if (o.paymentMethod === "COD" || !o.paymentMethod) {
          codTotal += Number(o.totalAmount || o.totalPrice || 0);
        }
      }
    });

    return { processing, shipping, delivered, codTotal, total: orders.length };
  }, [orders]);

  // Gom nhóm đơn hàng theo các huyện/thị trong tỉnh Hà Nam
  const routeGroups = useMemo(() => {
    const groups = {};
    HA_NAM_DISTRICTS.forEach(d => { groups[d.name] = []; });
    groups["Khu vực khác (Hà Nam)"] = [];

    orders.forEach(o => {
      const st = (o.status || "").toUpperCase();
      // Chỉ gom các đơn đang cần tác nghiệp (chờ lấy hoặc đang giao)
      if (st === "PROCESSING" || st === "PAID" || st === "SHIPPING") {
        const district = detectDistrict(o.shippingAddress || o.address || "");
        if (!groups[district]) groups[district] = [];
        groups[district].push(o);
      }
    });

    return groups;
  }, [orders]);

  // Lọc danh sách đơn hiển thị
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const st = (o.status || "").toUpperCase();
      if (statusFilter === "ACTIVE") {
        if (st === "DELIVERED" || st === "CANCELLED") return false;
      } else if (statusFilter === "DELIVERED") {
        if (st !== "DELIVERED") return false;
      }

      if (selectedRoute !== "ALL") {
        const district = detectDistrict(o.shippingAddress || o.address || "");
        if (district !== selectedRoute) return false;
      }
      return true;
    });
  }, [orders, statusFilter, selectedRoute]);

  if (userRole === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "#6b7280", fontSize: 16 }}>
        ⏳ Đang kiểm tra quyền nhân viên...
      </div>
    );
  }

  if (userRole === "UNAUTHORIZED") {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: 16, textAlign: "center" }}>
        <div style={{ fontSize: 80 }}>🚫</div>
        <h1 style={{ fontSize: 30, color: "#ef4444", fontWeight: 800 }}>403 — Quyền truy cập bị từ chối</h1>
        <p style={{ color: "#6b7280", fontSize: 15 }}>Trang làm việc này chỉ dành cho Nhân viên kiêm Shipper của DungThamMobile.<br />Vui lòng đăng nhập tài khoản Nhân viên để tiếp tục.</p>
        <a href="/auth" style={{ background: "#0284c7", color: "#fff", padding: "10px 24px", borderRadius: 24, fontWeight: 700, textDecoration: "none" }}>Đăng nhập nhân viên</a>
      </div>
    );
  }

  return (
    <div className="adm-layout">
      {/* Sidebar riêng cho Nhân viên */}
      <aside className="adm-sidebar" style={{ background: "#0f172a" }}>
        <div className="adm-sidebar-brand" style={{ borderBottom: "1px solid #1e293b" }}>
          <span className="adm-brand-icon">🛵</span>
          <div>
            <div className="adm-brand-name" style={{ color: "#38bdf8" }}>Shipper Hub</div>
            <div className="adm-brand-sub" style={{ color: "#94a3b8" }}>DungThamMobile Hà Nam</div>
          </div>
        </div>
        <nav className="adm-nav">
          <button
            className={`adm-nav-item${activeTab === "dashboard" ? " adm-nav-item-active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="adm-nav-icon">📊</span>
            <span>Ca trực & Tổng quan</span>
          </button>
          <button
            className={`adm-nav-item${activeTab === "orders" ? " adm-nav-item-active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="adm-nav-icon">📦</span>
            <span>Danh sách Giao nhận</span>
          </button>
        </nav>
        <div className="adm-sidebar-footer" style={{ borderTop: "1px solid #1e293b" }}>
          <a href="/" className="adm-back-link">← Về trang chủ Shop</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="adm-main">
        {/* Topbar */}
        <div className="adm-topbar">
          <h1 className="adm-topbar-title">
            {activeTab === "dashboard" ? "📊 Ca trực Giao hàng Nội tỉnh (Hà Nam)" : "📦 Quản lý Giao nhận Đơn hàng"}
          </h1>
          <div className="adm-topbar-right">
            <span className="adm-admin-badge" style={{ background: "#0284c7", color: "white" }}>
              🛵 NHÂN VIÊN / SHIPPER
            </span>
            <span style={{ color: "#6b7280", fontSize: 13 }}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="adm-content">
          {/* TAB 1: DASHBOARD TỔNG QUAN CA TRỰC */}
          {activeTab === "dashboard" && (
            <div>
              {/* Thẻ chỉ số tác nghiệp */}
              <div className="adm-stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <StatCard
                  icon="📦"
                  label="Chờ lấy đóng gói"
                  value={fmt(stats.processing)}
                  color="#2563eb"
                  subText="Đơn đã xác nhận cần đóng gói"
                />
                <StatCard
                  icon="🚚"
                  label="Đang đi giao"
                  value={fmt(stats.shipping)}
                  color="#0284c7"
                  subText="Đơn đang vận chuyển trên đường"
                />
                <StatCard
                  icon="🎉"
                  label="Đã giao thành công"
                  value={fmt(stats.delivered)}
                  color="#059669"
                  subText="Hoàn tất trong hệ thống"
                />
                <StatCard
                  icon="💵"
                  label="Tiền COD cần nộp"
                  value={fmtMoney(stats.codTotal)}
                  color="#d97706"
                  subText="Tổng tiền mặt thu hộ đang cầm"
                />
              </div>

              {/* Phân nhóm tuyến đường giao nhận tại Hà Nam */}
              <div className="adm-card" style={{ marginTop: 20 }}>
                <div className="adm-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📍 Tuyến đường giao hàng trong tỉnh Hà Nam hôm nay</span>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: "normal" }}>
                    Tự động phân bổ theo địa chỉ khách hàng
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 14 }}>
                  {Object.entries(routeGroups).map(([district, orderList]) => (
                    <div
                      key={district}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 14,
                        background: orderList.length > 0 ? "#f0f9ff" : "#f8fafc",
                        cursor: orderList.length > 0 ? "pointer" : "default",
                        transition: "all 0.2s"
                      }}
                      onClick={() => {
                        if (orderList.length > 0) {
                          setSelectedRoute(district);
                          setActiveTab("orders");
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{district}</span>
                        <span style={{
                          background: orderList.length > 0 ? "#0284c7" : "#cbd5e1",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {orderList.length} đơn
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                        {orderList.length > 0
                          ? `👉 Bấm để xem ${orderList.length} đơn cần giao tuyến này`
                          : "Hiện chưa có đơn tuyến này"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danh sách đơn cần ưu tiên đi giao ngay */}
              <div className="adm-card" style={{ marginTop: 20 }}>
                <div className="adm-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>⚡ Đơn hàng cần xử lý gấp (Đang chuẩn bị & Đang giao)</span>
                  <button
                    className="adm-btn adm-btn-primary"
                    onClick={() => setActiveTab("orders")}
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    Xem tất cả đơn →
                  </button>
                </div>
                {loading ? (
                  <div className="adm-loading">⏳ Đang tải dữ liệu đơn hàng...</div>
                ) : (
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Địa chỉ giao (Hà Nam)</th>
                        <th>Khu vực</th>
                        <th>Tổng tiền / COD</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: "center" }}>Thao tác nhanh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => ["PROCESSING", "PAID", "SHIPPING"].includes((o.status || "").toUpperCase()))
                        .slice(0, 8)
                        .map(o => {
                          const s = (o.status || "PENDING").toUpperCase();
                          const district = detectDistrict(o.shippingAddress || o.address || "");
                          const isUpdating = updatingId === o.id;

                          return (
                            <tr key={o.id}>
                              <td style={{ fontFamily: "monospace", fontWeight: 700 }}>#{String(o.id).slice(0, 8)}</td>
                              <td style={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {o.shippingAddress || o.address || "—"}
                              </td>
                              <td><span style={{ fontSize: 12, fontWeight: 600, color: "#0284c7" }}>{district}</span></td>
                              <td style={{ fontWeight: 700, color: "#059669" }}>{fmtMoney(o.totalAmount || o.totalPrice)}</td>
                              <td><Badge status={o.status} /></td>
                              <td style={{ textAlign: "center" }}>
                                {(s === "PROCESSING" || s === "PAID") && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(o.id, "SHIPPING")}
                                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#0284c7", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                  >
                                    🚚 Nhận đi giao
                                  </button>
                                )}
                                {s === "SHIPPING" && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(o.id, "DELIVERED")}
                                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#059669", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                  >
                                    🎉 Đã giao & Thu COD
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {orders.filter(o => ["PROCESSING", "PAID", "SHIPPING"].includes((o.status || "").toUpperCase())).length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>
                            Hiện tại không có đơn nào đang chờ giao. Tất cả đã hoàn tất! 🎉
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DANH SÁCH TẤT CẢ ĐƠN GIAO NHẬN */}
          {activeTab === "orders" && (
            <div>
              {/* Bộ lọc đơn hàng */}
              <div className="adm-card" style={{ marginBottom: 16, padding: "14px 20px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Trạng thái:</span>
                    <select
                      className="adm-select"
                      style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="ACTIVE">⚡ Đơn cần giao (Đang chuẩn bị / Đang giao)</option>
                      <option value="DELIVERED">🎉 Đã giao thành công</option>
                      <option value="ALL">📋 Tất cả đơn hàng</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Tuyến huyện/thị:</span>
                    <select
                      className="adm-select"
                      style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
                      value={selectedRoute}
                      onChange={e => setSelectedRoute(e.target.value)}
                    >
                      <option value="ALL">Toàn tỉnh Hà Nam (Tất cả)</option>
                      {HA_NAM_DISTRICTS.map(d => (
                        <option key={d.key} value={d.name}>{d.name}</option>
                      ))}
                      <option value="Khu vực khác (Hà Nam)">Khu vực khác</option>
                    </select>
                  </div>

                  <button
                    className="adm-btn adm-btn-ghost adm-btn-sm"
                    onClick={() => { setStatusFilter("ACTIVE"); setSelectedRoute("ALL"); }}
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>

              {/* Bảng đơn hàng chi tiết */}
              <div className="adm-card">
                <div className="adm-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📋 Danh sách đơn hàng ({filteredOrders.length})</span>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={fetchOrders}>
                    🔄 Tải lại đơn
                  </button>
                </div>

                {loading ? (
                  <div className="adm-loading">⏳ Đang tải dữ liệu...</div>
                ) : (
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Địa chỉ người nhận</th>
                        <th>Tuyến giao</th>
                        <th>Tiền đơn / COD</th>
                        <th>Hình thức TT</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: "center", minWidth: 200 }}>Thao tác giao hàng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: "center", color: "#9ca3af", padding: 36 }}>Không tìm thấy đơn hàng phù hợp bộ lọc</td></tr>
                      ) : (
                        filteredOrders.map(o => {
                          const s = (o.status || "PENDING").toUpperCase();
                          const district = detectDistrict(o.shippingAddress || o.address || "");
                          const isUpdating = updatingId === o.id;

                          return (
                            <tr key={o.id}>
                              <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>#{String(o.id).slice(0, 10)}</td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{o.shippingAddress || o.address || "—"}</div>
                                {o.phone && <div style={{ fontSize: 11, color: "#64748b" }}>📞 {o.phone}</div>}
                              </td>
                              <td>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#0284c7", background: "#e0f2fe", padding: "2px 8px", borderRadius: 8 }}>
                                  {district}
                                </span>
                              </td>
                              <td style={{ color: "#059669", fontWeight: 700, fontSize: 14 }}>
                                {fmtMoney(o.totalAmount || o.totalPrice)}
                              </td>
                              <td>
                                <span style={{ fontSize: 12, fontWeight: 600, color: o.paymentMethod === "VNPAY" ? "#2563eb" : "#d97706" }}>
                                  {o.paymentMethod || "COD"}
                                </span>
                              </td>
                              <td><Badge status={o.status} /></td>
                              <td>
                                <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                                  {/* Chuẩn bị hàng -> Đang giao */}
                                  {(s === "PROCESSING" || s === "PAID") && (
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateStatus(o.id, "SHIPPING")}
                                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#0284c7", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                    >
                                      🚚 Bắt đầu giao
                                    </button>
                                  )}

                                  {/* Đang giao -> Giao thành công */}
                                  {s === "SHIPPING" && (
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateStatus(o.id, "DELIVERED")}
                                      style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#059669", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                                    >
                                      🎉 Đã giao & Thu tiền
                                    </button>
                                  )}

                                  {/* Nút hủy đơn nếu khách không nhận */}
                                  {(s === "PROCESSING" || s === "SHIPPING") && (
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc muốn báo hủy hoặc hoãn giao đơn #${o.id}?`)) {
                                          handleUpdateStatus(o.id, "CANCELLED");
                                        }
                                      }}
                                      style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                    >
                                      ❌ Hủy/Hoãn
                                    </button>
                                  )}

                                  {s === "DELIVERED" && (
                                    <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>✅ Đã hoàn tất</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}