-- Bật chế độ chèn thủ công ID cho bảng tự tăng IDENTITY
SET IDENTITY_INSERT products ON;

-- Chèn thêm các sản phẩm điện thoại mẫu mới để kiểm tra bộ lọc Megamenu
INSERT INTO products (id, category_id, name, price, stock, description, image_url, created_by, created_date, version)
VALUES
(7, 1, N'iPhone 17 Pro Max 256GB', 34990000.00, 50, 
 N'{"specs":{"Màn hình":"6.9 inch Super Retina","CPU":"Apple A19 Pro 6 nhân","RAM":"12GB","Bộ nhớ":"256GB"},"html_desc":"<p>Siêu phẩm iPhone 17 Pro Max thế hệ mới với hiệu năng AI đột phá.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(8, 1, N'iPhone Air Ultra 128GB', 26990000.00, 40, 
 N'{"specs":{"Màn hình":"6.6 inch Super Retina","CPU":"Apple A19 6 nhân","RAM":"8GB","Bộ nhớ":"128GB"},"html_desc":"<p>Dòng iPhone Air mỏng nhẹ kỷ lục, định hình tương lai thiết kế Apple.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(9, 1, N'iPhone 16 Pro 128GB', 28990000.00, 80, 
 N'{"specs":{"Màn hình":"6.3 inch Super Retina","CPU":"Apple A18 Pro 6 nhân","RAM":"8GB","Bộ nhớ":"128GB"},"html_desc":"<p>iPhone 16 Pro sở hữu nút điều khiển camera chuyên nghiệp Camera Control.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(10, 1, N'iPhone 14 128GB', 16990000.00, 100, 
 N'{"specs":{"Màn hình":"6.1 inch Super Retina","CPU":"Apple A15 Bionic 6 nhân","RAM":"6GB","Bộ nhớ":"128GB"},"html_desc":"<p>iPhone 14 bền bỉ, thời lượng pin ấn tượng cả ngày dài.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(11, 1, N'iPhone 13 128GB', 13990000.00, 120, 
 N'{"specs":{"Màn hình":"6.1 inch Super Retina","CPU":"Apple A15 Bionic 6 nhân","RAM":"4GB","Bộ nhớ":"128GB"},"html_desc":"<p>iPhone 13 đem lại trải nghiệm camera kép chéo và chip A15 mượt mà.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(12, 1, N'iPhone 12 64GB', 11990000.00, 90, 
 N'{"specs":{"Màn hình":"6.1 inch Super Retina","CPU":"Apple A14 Bionic 6 nhân","RAM":"4GB","Bộ nhớ":"64GB"},"html_desc":"<p>iPhone 12 thiết kế viền vuông phẳng sang trọng, hỗ trợ 5G siêu tốc.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(13, 1, N'iPhone 11 64GB', 8990000.00, 150, 
 N'{"specs":{"Màn hình":"6.1 inch Liquid Retina LCD","CPU":"Apple A13 Bionic 6 nhân","RAM":"4GB","Bộ nhớ":"64GB"},"html_desc":"<p>iPhone 11 - Chiếc smartphone quốc dân bền bỉ cùng hệ thống camera kép.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(14, 1, N'iPhone XS Max 64GB', 6990000.00, 30, 
 N'{"specs":{"Màn hình":"6.5 inch Super Retina OLED","CPU":"Apple A12 Bionic 6 nhân","RAM":"4GB","Bộ nhớ":"64GB"},"html_desc":"<p>iPhone XS Max thiết kế viền thép cao cấp và màn hình lớn siêu đẹp một thời.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(15, 1, N'OPPO Find X8 Pro 5G', 22990000.00, 35, 
 N'{"specs":{"Màn hình":"6.78 inch AMOLED","CPU":"Dimensity 9400","RAM":"16GB","Bộ nhớ":"512GB"},"html_desc":"<p>OPPO Find X8 Pro nâng tầm nhiếp ảnh di động đỉnh cao với ống kính tiềm vọng kép.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(16, 1, N'OPPO A78 8GB/256GB', 5990000.00, 70, 
 N'{"specs":{"Màn hình":"6.43 inch AMOLED","CPU":"Snapdragon 680","RAM":"8GB","Bộ nhớ":"256GB"},"html_desc":"<p>OPPO A78 nổi bật với thiết kế thời thượng, sạc nhanh SuperVOOC 67W.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(17, 1, N'Xiaomi 14 Ultra 5G', 29990000.00, 25, 
 N'{"specs":{"Màn hình":"6.73 inch AMOLED 120Hz","CPU":"Snapdragon 8 Gen 3","RAM":"16GB","Bộ nhớ":"512GB"},"html_desc":"<p>Xiaomi 14 Ultra đỉnh cao camera Leica và vi xử lý mạnh mẽ nhất thế giới Android.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(18, 1, N'Redmi Note 13 Pro 5G', 7490000.00, 85, 
 N'{"specs":{"Màn hình":"6.67 inch AMOLED 1.5K","CPU":"Snapdragon 7s Gen 2","RAM":"8GB","Bộ nhớ":"256GB"},"html_desc":"<p>Redmi Note 13 Pro 5G trang bị màn hình siêu nét cùng camera 200MP xuất sắc.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(19, 1, N'Samsung Galaxy Z Fold6 5G', 41990000.00, 15, 
 N'{"specs":{"Màn hình":"7.6 inch Foldable Dynamic","CPU":"Snapdragon 8 Gen 3","RAM":"12GB","Bộ nhớ":"256GB"},"html_desc":"<p>Samsung Galaxy Z Fold6 màn hình gập tối tân cùng quyền năng Galaxy AI mở rộng.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1),

(20, 1, N'Samsung Galaxy A55 5G', 9990000.00, 60, 
 N'{"specs":{"Màn hình":"6.6 inch Super AMOLED","CPU":"Exynos 1480","RAM":"8GB","Bộ nhớ":"128GB"},"html_desc":"<p>Samsung Galaxy A55 thiết kế cao cấp, kháng nước chuẩn IP67 bảo vệ tối đa.</p>"}', 
 N'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', N'admin', GETDATE(), 1);

-- Tắt chế độ chèn thủ công ID cho bảng tự tăng
SET IDENTITY_INSERT products OFF;
