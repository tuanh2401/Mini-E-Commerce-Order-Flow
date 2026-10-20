INSERT INTO products (name, price, original_price, stock, image_url, category_id, description, created_date, last_modified_date, version)
VALUES 
-- 1. Tivi
(
    N'Smart Tivi Samsung 4K 55 inch Crystal UHD UA55DU7000',
    10990000.00,
    14490000.00,
    30,
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
    4,
    N'{"specs":{"Màn hình":"55 inch, 4K UHD (3840 x 2160)","Bộ xử lý":"Crystal 4K","Công nghệ hình ảnh":"HDR10+, PurColor","Âm thanh":"20W, OTS Lite, Q-Symphony","Hệ điều hành":"Tizen OS"},"html_desc":"<p>Smart Tivi Samsung 4K 55 inch hiển thị sắc nét với công nghệ Crystal UHD và âm thanh sống động.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),
(
    N'Smart Tivi LG 4K 65 inch OLED Evo 65C3PSA',
    34990000.00,
    42990000.00,
    15,
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80',
    4,
    N'{"specs":{"Màn hình":"65 inch, 4K OLED 120Hz","Bộ xử lý":"α9 AI Processor Gen6","Công nghệ hình ảnh":"Dolby Vision IQ, OLED Color","Âm thanh":"40W Dolby Atmos","Hệ điều hành":"webOS 23"},"html_desc":"<p>Tivi LG OLED cao cấp chuẩn màu điện ảnh, công nghệ điểm ảnh phát sáng độc lập.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),

-- 2. Tủ lạnh
(
    N'Tủ lạnh Samsung Inverter 236L RT22M4032DX/SV',
    5490000.00,
    7290000.00,
    25,
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80',
    4,
    N'{"specs":{"Dung tích":"236 Lít","Công nghệ làm lạnh":"All-around Cooling","Kháng khuẩn & Khử mùi":"Bộ lọc than hoạt tính Deodorizer","Công nghệ tiết kiệm điện":"Digital Inverter","Ngăn đông mềm":"Optimal Fresh Zone -1°C"},"html_desc":"<p>Tủ lạnh 2 cửa ngăn đông mềm giữ thịt cá tươi ngon trọn vị không cần rã đông.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),
(
    N'Tủ lạnh Panasonic Inverter 322L Prime Fresh NR-BC360WKVN',
    12490000.00,
    15890000.00,
    20,
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&q=80',
    4,
    N'{"specs":{"Dung tích":"322 Lít","Công nghệ làm lạnh":"Panorama làm lạnh đa chiều","Kháng khuẩn":"Nanoe-X vô hiệu hóa 99.99% vi khuẩn","Công nghệ tiết kiệm":"Econavi cảm biến thông minh, Inverter","Ngăn cấp đông mềm":"Prime Fresh+ chuẩn -3°C"},"html_desc":"<p>Tủ lạnh Panasonic ngăn đá dưới tiện dụng trang bị kháng khuẩn Nanoe-X hiện đại.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),

-- 3. Máy giặt
(
    N'Máy giặt lồng ngang LG Inverter 9kg FV1409S4W',
    7990000.00,
    10990000.00,
    30,
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80',
    4,
    N'{"specs":{"Khối lượng giặt":"9.0 kg","Động cơ":"Truyền động trực tiếp AI DD","Công nghệ giặt":"Steam giặt hơi nước diệt khuẩn","Tiết kiệm điện":"Inverter thế hệ mới","Tốc độ vắt tối đa":"1400 vòng/phút"},"html_desc":"<p>Máy giặt cửa ngang LG truyền động trực tiếp êm ái, trí tuệ nhân tạo AI DD bảo vệ sợi vải tối ưu.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),
(
    N'Máy giặt sấy Samsung Ecobubble 9.5kg Giặt / 6kg Sấy WD95T4046CE/SV',
    10990000.00,
    14500000.00,
    18,
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80',
    4,
    N'{"specs":{"Khối lượng":"Giặt 9.5 kg / Sấy 6.0 kg","Công nghệ bọt bong bóng":"EcoBubble thẩm thấu sâu","Động cơ":"Digital Inverter","Giặt hơi nước":"Hygiene Steam diệt khuẩn 99.9%","Tốc độ vắt":"1400 vòng/phút"},"html_desc":"<p>Giải pháp 2 trong 1 vừa giặt vừa sấy tiện lợi cho mùa mưa nồm ẩm.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),

-- 4. Máy lạnh - Điều hòa
(
    N'Máy lạnh Daikin Inverter 1 HP (9.000 BTU) FTKF25XVMV',
    8990000.00,
    11500000.00,
    40,
    'https://images.unsplash.com/photo-1614633833026-0e10b196883f?w=500&q=80',
    4,
    N'{"specs":{"Công suất làm lạnh":"1 HP - 9.200 BTU","Phạm vi hiệu quả":"Dưới 15 m² (30 đến 45 m³)","Công nghệ lọc khí":"Streamer lọc không khí, phin lọc Enzyme Blue","Tiết kiệm điện":"Inverter, Mắt thần thông minh","Loại gas":"R-32 thân thiện môi trường"},"html_desc":"<p>Điều hòa Daikin làm lạnh êm dịu, luồng gió Coanda không thổi trực diện bảo vệ sức khỏe.</p>"}',
    GETDATE(),
    GETDATE(),
    0
),
(
    N'Máy lạnh Panasonic Inverter 1.5 HP (12.000 BTU) CU/CS-XPU12XKH-8',
    11490000.00,
    14290000.00,
    35,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
    4,
    N'{"specs":{"Công suất làm lạnh":"1.5 HP - 11.900 BTU","Phạm vi hiệu quả":"Từ 15 - 20 m² (40 đến 60 m³)","Công nghệ lọc khí":"Nanoe-G lọc bụi mịn PM2.5 & Nanoe-X khử mùi","Tiết kiệm điện":"Inverter, Chế độ ECO tích hợp AI","Làm lạnh nhanh":"Powerful làm mát tức thì"},"html_desc":"<p>Máy lạnh Panasonic công nghệ nanoe lọc sạch không khí như máy lọc khí chuyên dụng.</p>"}',
    GETDATE(),
    GETDATE(),
    0
);
