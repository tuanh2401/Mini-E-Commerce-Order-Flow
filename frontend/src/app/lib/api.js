import axios from "axios";

export const API_BASE_URL = "http://localhost:8082/api";

// 1. Tạo instance axios dùng chung cho toàn bộ dự án
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến quản lý trạng thái refresh & hàng đợi request
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

// =========================================================================
// 2. REQUEST INTERCEPTOR: Tự động đính kèm Access Token vào Header
// =========================================================================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && token !== "null" && token !== "undefined") {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    // Nếu gửi FormData (upload file/ảnh), xóa Content-Type để Axios và trình duyệt tự sinh multipart/form-data boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================================
// 3. RESPONSE INTERCEPTOR: Tự động bắt lỗi 401/403 để Silent Refresh Token
// =========================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ can thiệp khi bị lỗi 401 hoặc 403 và request chưa từng được retry
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Đừng can thiệp nếu chính request refresh hoặc login bị lỗi
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/authenticate")
      ) {
        return Promise.reject(error);
      }

      // Nếu đang có tiến trình refresh chạy dở, đưa request vào hàng đợi
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

      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;

      if (!refreshToken || refreshToken === "null" || refreshToken === "undefined") {
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        // Dùng axios gốc để gọi /api/auth/refresh (tránh loop interceptor)
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const authData = res.data?.data;
        const newAccessToken = authData?.jwt || authData?.accessToken;
        const newRefreshToken = authData?.refreshToken;

        if (newAccessToken) {
          // Lưu token mới vào localStorage
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Cập nhật token cho request hiện tại và các request tiếp theo
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Giải phóng các request đang chờ trong queue
          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Bắn sự kiện ra window để các component khác biết token đã refresh
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("token_refreshed", { detail: { token: newAccessToken } })
            );
          }

          // Gửi lại request ban đầu với token mới
          return api(originalRequest);
        } else {
          throw new Error("Không tìm thấy token mới trong phản hồi từ server");
        }
      } catch (refreshErr) {
        console.warn("Tự động refresh token thất bại (Session hết hạn):", refreshErr.message);
        processQueue(refreshErr, null);
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// Hàm xử lý khi phiên đăng nhập hết hạn hoàn toàn
function handleSessionExpired() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userAvatar");
    window.dispatchEvent(new Event("session_expired"));

    // Chỉ chuyển hướng nếu đang ở các trang cần đăng nhập
    const currentPath = window.location.pathname;
    const protectedPaths = ["/orders", "/profile", "/checkout", "/admin", "/staff"];
    if (protectedPaths.some((path) => currentPath.startsWith(path))) {
      window.location.href = "/auth";
    }
  }
}

export default api;
