-- Cập nhật thông tin fullname và address bị lỗi font của bảng users trong mini_ecommerce_user
UPDATE users SET fullname = N'Tuấn Anh Nguyễn' WHERE id = 8;
UPDATE users SET fullname = N'Nguyễn Tuấn Anh' WHERE id = 12;
UPDATE users SET fullname = N'Nguyễn Tuấn Anh' WHERE id = 14;
UPDATE users SET fullname = N'Tuấn Anh' WHERE id = 16;
UPDATE users SET fullname = N'Tuấn Anh', address = N'Hà Nam' WHERE id = 23;
UPDATE users SET address = N'Quảng Ninh - Việt Nam' WHERE id = 11;
UPDATE users SET address = N'Hà Nam - Việt Nam' WHERE id = 24;
