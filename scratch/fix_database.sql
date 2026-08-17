-- 1. Cập nhật tên danh mục có dấu tiếng Việt
UPDATE categories SET name = N'Điện thoại' WHERE id = 1;
UPDATE categories SET name = N'Laptop' WHERE id = 2;
UPDATE categories SET name = N'Phụ kiện' WHERE id = 3;

-- 2. Cập nhật tên sản phẩm Sạc dự phòng
UPDATE products SET name = N'Sạc dự phòng Anker PowerCore 20000mAh 22.5W' WHERE id = 6;

-- 3. Cập nhật mô tả chi tiết chứa JSON tiếng Việt không bị lỗi font cho 6 sản phẩm
UPDATE products 
SET description = N'{"specs":{"Màn hình":"6.7 inch Super Retina","CPU":"Apple A17 Pro 6 nhân","RAM":"8GB","Bộ nhớ":"256GB"},"html_desc":"<p>Siêu phẩm iPhone 15 Pro Max với khung viền Titan siêu nhẹ.</p>"}' 
WHERE id = 1;

UPDATE products 
SET description = N'{"specs":{"Màn hình":"6.8 inch Dynamic AMOLED","CPU":"Snapdragon 8 Gen 3","RAM":"12GB","Bộ nhớ":"256GB"},"html_desc":"<p>Quyền năng Galaxy AI đỉnh cao.</p>"}' 
WHERE id = 2;

UPDATE products 
SET description = N'{"specs":{"Màn hình":"13.6 inch Liquid Retina","CPU":"Apple M3 8 nhân","RAM":"8GB","VGA":"Intel Integrated"},"html_desc":"<p>Mỏng nhẹ vượt trội, hiệu năng mạnh mẽ với chip M3.</p>"}' 
WHERE id = 3;

UPDATE products 
SET description = N'{"specs":{"Màn hình":"14.0 inch Full HD","CPU":"Intel Core i3-1315U","RAM":"8GB","Bộ nhớ":"512GB SSD"},"html_desc":"<p>Laptop học tập văn phòng giá tốt.</p>"}' 
WHERE id = 4;

UPDATE products 
SET description = N'{"specs":{"Chống ồn":"Chủ động ANC","Pin":"6 giờ liên tục","Kết nối":"Bluetooth 5.3"},"html_desc":"<p>Chống ồn đỉnh cao, âm thanh vòm sống động.</p>"}' 
WHERE id = 5;

UPDATE products 
SET description = N'{"specs":{"Dung lượng":"20.000 mAh","Công suất":"22.5W Max","Cổng sạc":"2x USB-A, 1x USB-C"},"html_desc":"<p>Sạc dự phòng bền bỉ từ Anker.</p>"}' 
WHERE id = 6;
