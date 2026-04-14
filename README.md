Dự án Hệ thống Thương mại Điện tử Thu nhỏ (Mini E-Commerce) được xây dựng theo kiến trúc Microservices sử dụng **Spring Boot** và **Spring Cloud**. Hệ thống quản lý toàn bộ luồng nghiệp vụ từ đăng ký người dùng, tìm kiếm sản phẩm, đặt hàng, xử lý thanh toán (VNPAY, MoMo), cho đến cập nhật tồn kho thông qua Event-Driven Architecture (RabbitMQ).

## 🏗️ Kiến trúc Hệ thống (Architecture)
Dự án bao gồm các dịch vụ độc lập sau:

- **API Gateway**: Cổng giao tiếp duy nhất cho toàn bộ hệ thống, xử lý routing các request từ client đến các microservice tương ứng.
- **Auth Service**: Xử lý xác thực và phân quyền người dùng (Authentication & Authorization) sử dụng JWT và Spring Security.
- **User Service**: Quản lý thông tin người dùng.
- **Product Service**: Quản lý danh mục, thông tin sản phẩm và số lượng tồn kho.
- **Order Service**: Xử lý logic đặt hàng, kết nối với dữ liệu người dùng và sản phẩm qua Feign Client.
- **Payment Service**: Xử lý giao dịch thanh toán, tích hợp Multi-provider payment strategy với **VNPAY** .
- **Shared Library (`my-library`)**: Thư viện dùng chung chứa các Base Service, Base Repository, Base Entity, các DTOs, Exceptions và Utils nhằm giảm thiểu mã lặp (code duplication) bằng việc áp dụng Java Generics.

## 🚀 Công nghệ sử dụng (Technologies Stack)
- **Ngôn ngữ**: Java 17+
- **Framework Core**: Spring Boot, Spring Cloud (Gateway, OpenFeign)
- **Service Discovery**: HashiCorp Consul
- **Message Broker**: RabbitMQ (Phục vụ Event-driven communication, ví dụ: `OrderCreatedEvent` để trừ tồn kho)
- **Database**: CSDL quan hệ (MySQL/PostgreSQL) cho mỗi service độc lập nhằm tránh chia sẻ dữ liệu (Database-per-service pattern).
- **Security**: Spring Security, JSON Web Token (JWT)
- **Tài liệu API**: Swagger/OpenAPI 3
- **Thanh toán**: VNPAY Sandbox API (HMAC SHA256 Signature verification)
- **Khác**: Lombok, MapStruct.

## ✨ Chức năng nổi bật
1. **Kiến trúc Microservices tiêu chuẩn**: Router qua API Gateway, gọi nội bộ qua FeignClient, đăng ký phát hiện dịch vụ bằng Consul.
2. **Event-Driven & Xử lý Bất đồng bộ**: 
   - Sau khi đặt hàng thành công, `Order Service` sinh sự kiện qua RabbitMQ, `Product Service` lắng nghe để cập nhật trừ số lượng hàng hóa trong kho.
3. **Mẫu thiết kế (Design Patterns)**: 
   - Áp dụng các *Generic Base Classes* (`BaseService`, `BaseRepository`) cho các CRUD Operations.
   - Quản lý và gom cụm Exception tập trung cho toàn bộ Microservices.
4. **Tích hợp cổng Thanh Toán thực tế**: Luồng tích hợp thanh toán linh hoạt với VNPAY và MoMo (hỗ trợ chiến lược đa dịch vụ thanh toán - Multi-provider payment strategy), xử lý IPN/Callback.
