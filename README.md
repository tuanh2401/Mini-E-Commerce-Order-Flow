# 🛒 Mini E-Commerce Order Flow

Hệ thống thương mại điện tử thu nhỏ được xây dựng theo kiến trúc **Microservices** sử dụng **Spring Boot** và **Spring Cloud**. Hệ thống quản lý toàn bộ luồng nghiệp vụ từ đăng ký người dùng, tìm kiếm sản phẩm, đặt hàng, xử lý thanh toán (VNPAY, MoMo), cho đến cập nhật tồn kho tự động thông qua kiến trúc hướng sự kiện (Event-Driven Architecture).

---

## 🏗️ Kiến trúc Tổng thể

```
                          ┌─────────────────┐
                          │   Client / UI   │
                          └────────┬────────┘
                                   │ HTTP
                          ┌────────▼────────┐
                          │   API Gateway   │  :8082
                          │  (RSA JWT Auth) │
                          └──┬──┬──┬──┬──┬─┘
                 ┌───────────┘  │  │  │  └─────────────┐
           ┌─────▼─────┐  ┌────▼──┴─┐  ┌──────▼──────┐  ┌────▼──────┐
           │auth-service│  │  user-  │  │   order-    │  │ product-  │
           │   :8081    │  │ service │  │   service   │  │  service  │
           └────────────┘  │  :8084  │  │    :8083    │  │   :8086   │
                           └─────────┘  └──────┬──────┘  └─────┬─────┘
                                               │               │
                           ┌───────────────────▼───────────────▼──────┐
                           │              RabbitMQ                     │
                           │  OrderCreatedEvent → PaymentProcessedEvent│
                           └───────────────────┬───────────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   payment-service   │
                                    │  :8085  (VNPAY/MoMo)│
                                    └─────────────────────┘
```

**Giao tiếp nội bộ:**
- **Đồng bộ:** OpenFeign (payment → order, auth → user)
- **Bất đồng bộ:** RabbitMQ Events
- **Service Discovery:** HashiCorp Consul

---

## 🧩 Danh sách Microservices

| Service | Port | Mô tả |
|---------|------|--------|
| `api-gateway` | 8082 | Cổng vào duy nhất, xác thực JWT bằng RSA Public Key |
| `auth-service` | 8081 | Đăng ký/Đăng nhập, cấp JWT bằng RSA Private Key |
| `user-service` | 8084 | Quản lý hồ sơ người dùng (Profile, địa chỉ) |
| `order-service` | 8083 | Tạo và quản lý đơn hàng |
| `product-service` | 8086 | Quản lý sản phẩm, tồn kho |
| `payment-service` | 8085 | Xử lý thanh toán VNPAY & MoMo |
| `my-library` | — | Thư viện dùng chung (Base Classes, DTOs, Events, Utils) |

---

## 🚀 Công nghệ sử dụng

| Hạng mục | Công nghệ |
|----------|-----------|
| Ngôn ngữ | Java 21 |
| Framework | Spring Boot 3.2.4, Spring Cloud 2023.x |
| API Gateway | Spring Cloud Gateway (WebFlux) |
| Service Discovery | HashiCorp Consul |
| Giao tiếp nội bộ | OpenFeign (đồng bộ), RabbitMQ (bất đồng bộ) |
| Bảo mật | Spring Security + JWT (RSA RS256 — Asymmetric) |
| Cơ sở dữ liệu | Microsoft SQL Server (Database-per-service) |
| Tài liệu API | Swagger / OpenAPI 3 (SpringDoc) |
| Thanh toán | VNPAY Sandbox API, MoMo API |
| Khác | Lombok, Spring Boot DevTools |

---

## ✨ Tính năng nổi bật

### 🔐 Bảo mật RSA JWT (Asymmetric Authentication)
Hệ thống sử dụng cặp khóa bất đối xứng RSA:
- `auth-service` giữ **Private Key** (`keystore.jks`) → duy nhất có quyền **tạo** JWT
- `api-gateway` chỉ dùng **Public Key** (`public.pem`) → chỉ **xác thực** JWT, không thể tạo giả
- Các service nội bộ (order, payment...) nhận thông tin user qua **Header** (`userId`, `username`, `X-User-Role`) do Gateway forward

### 📦 Shared Library (`my-library`)
Thư viện dùng chung áp dụng Java Generics, giảm thiểu code lặp:
- `BaseEntity`, `BaseRepository`, `BaseService`, `AbstractBaseService` — CRUD tái sử dụng
- `JwtAuthFilter` — Filter bảo mật dùng chung cho tất cả service (Auto-Configuration)
- `RsaJwtHelper`, `JwtHelper` — Tiện ích xử lý JWT
- `OrderCreatedEvent`, `PaymentProcessedEvent` — Event DTOs cho RabbitMQ
- `ApiResponse` — Chuẩn hóa định dạng response

### 📨 Event-Driven Architecture (RabbitMQ)
```
User đặt hàng
    → order-service lưu DB
    → Publish OrderCreatedEvent
        → payment-service tạo bản ghi Payment PENDING
User thanh toán xong (VNPAY/MoMo callback)
    → payment-service xác thực chữ ký
    → Cập nhật Payment → SUCCESS
    → Publish PaymentProcessedEvent
        → product-service trừ tồn kho
        → order-service cập nhật trạng thái đơn
```

### 💳 Tích hợp đa cổng thanh toán
- **VNPAY:** Tạo URL thanh toán, xác thực chữ ký HMAC SHA512, xử lý IPN callback
- **MoMo:** HMAC SHA256 signature, Multi-provider payment strategy pattern
- Ngrok dùng để expose localhost cho webhook callback khi phát triển

---

## ⚙️ Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống
- Java JDK 21+
- Apache Maven 3.8+
- Microsoft SQL Server
- Docker (khuyến nghị cho Consul và RabbitMQ)

### Bước 1 — Khởi động Infrastructure

```bash
# Consul (Service Discovery)
docker run -d -p 8500:8500 --name consul consul agent -dev -client=0.0.0.0

# RabbitMQ (Message Broker)
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management
```

### Bước 2 — Cài đặt Shared Library

```bash
cd my-library
mvn clean install
```
> ⚠️ **Bắt buộc phải chạy bước này trước** khi build bất kỳ service nào khác.

### Bước 3 — Cấu hình Database

Tạo các database trống trong SQL Server:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE order_db;
CREATE DATABASE product_db;
CREATE DATABASE payment_db;
```

Cập nhật thông tin kết nối trong file `application.properties` / `application.yml` của từng service tương ứng.

### Bước 4 — Khởi động các Services

Khởi động theo đúng thứ tự sau:

```
1. api-gateway
2. auth-service
3. user-service
4. product-service
5. order-service
6. payment-service
```

Dùng IDE (IntelliJ IDEA) hoặc chạy lệnh:
```bash
cd <tên-service>
mvn spring-boot:run
```

### Bước 5 — Truy cập hệ thống

| Địa chỉ | Mô tả |
|---------|--------|
| `http://localhost:8082` | API Gateway (endpoint chính) |
| `http://localhost:8082/swagger-ui.html` | Swagger UI tổng hợp (tất cả service) |
| `http://localhost:8500` | Consul Dashboard |
| `http://localhost:15672` | RabbitMQ Management (guest/guest) |

---

## 📡 Luồng API cơ bản

```
# 1. Đăng ký tài khoản
POST /api/auth/register
Body: { "username": "user1", "password": "123456" }

# 2. Đăng nhập lấy JWT Token
POST /api/auth/authenticate
Body: { "username": "user1", "password": "123456" }
→ Nhận: { "jwt": "eyJhbGci..." }

# 3. Tạo đơn hàng (cần Bearer Token)
POST /api/orders
Authorization: Bearer <token>
Body: { "address": "...", "orderItems": [...] }

# 4. Tạo URL thanh toán
POST /api/payments/create
Authorization: Bearer <token>
Body: { "orderId": "...", "paymentMethod": "VNPAY" }
→ Nhận: URL thanh toán VNPAY

# 5. VNPAY/MoMo callback (tự động)
GET/POST /api/payments/vnpay-ipn?vnp_ResponseCode=00&...
→ payment-service cập nhật DB + bắn event RabbitMQ
```

---

## 🗂️ Cấu trúc thư mục

```
Mini E-commerce Orders/
├── api-gateway/          # Spring Cloud Gateway + RSA JWT Validation
├── auth-service/         # Authentication + JWT Generation (Private Key)
├── user-service/         # User Profile Management
├── order-service/        # Order Management + Feign Client
├── product-service/      # Product & Inventory Management
├── payment-service/      # VNPAY & MoMo Integration
├── my-library/           # Shared Library (Base Classes, Filter, DTOs)
├── keystore.jks          # RSA Private Key (auth-service)
├── public.pem            # RSA Public Key (api-gateway)
└── README.md
```

---

## 📝 Ghi chú phát triển

- Khi thay đổi code trong `my-library`, phải chạy `mvn clean install` rồi restart service liên quan
- Để test VNPAY/MoMo callback ở local, dùng **Ngrok**: `ngrok http 8082`
- `auth-service` được cấu hình loại trừ `LibSecurityAutoConfig` vì không cần `JwtAuthFilter`
- Tất cả service nội bộ không tự decode JWT — chỉ tin tưởng các Header do `api-gateway` forward

---

## 📄 License

Dự án được phân phối dưới giấy phép **MIT**.
