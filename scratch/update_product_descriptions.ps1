[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$connString = "Server=localhost\SQL2025;Database=mini_ecommerce_product;User Id=sa;Password=123456;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()

# Danh sach mo ta chuan theo tung ID san pham
$productsData = @(
    @{
        id = 1
        name = "iPhone 15 Pro Max 256GB"
        specs = [ordered]@{
            "Màn hình" = "6.7 inch, Super Retina XDR OLED, 120Hz ProMotion, Always-On, 2000 nits"
            "CPU" = "Apple A17 Pro (tiến trình 3nm, 6 nhân CPU, 6 nhân GPU hỗ trợ Ray Tracing)"
            "RAM" = "8GB LPDDR5"
            "Bộ nhớ" = "256GB NVMe"
            "Camera sau" = "Chính 48MP (f/1.78, OIS) + Góc siêu rộng 12MP + Tele tiềm vọng 12MP (Zoom quang 5x)"
            "Camera trước" = "12MP TrueDepth, tự động lấy nét, quay 4K60fps"
            "Pin & Sạc" = "4.422 mAh, Sạc nhanh 20W, MagSafe 15W, Cổng USB-C 3.0 (10Gbps)"
            "Chất liệu & Kháng nước" = "Khung Titan hàng không vũ trụ, mặt lưng kính nhám, chuẩn IP68"
            "Hệ điều hành" = "iOS"
        }
        html_desc = "<p><strong>iPhone 15 Pro Max 256GB</strong> là đỉnh cao công nghệ smartphone của Apple với thiết kế khung viền Titanium chuẩn hàng không vũ trụ, mang lại cảm giác cầm nắm siêu nhẹ, đầm tay và bền bỉ vượt bậc.</p><p>Sức mạnh phần cứng bứt phá với vi xử lý <strong>Apple A17 Pro</strong> tiến trình 3nm đầu tiên trên thế giới, GPU 6 nhân hỗ trợ công nghệ Ray Tracing bằng phần cứng, sẵn sàng chiến mượt mà các tựa game console bom tấn AAA ngay trên điện thoại.</p><p>Hệ thống camera tele tiềm vọng thế hệ mới cung cấp khả năng <strong>zoom quang học 5x</strong> sắc nét ở tiêu cự 120mm, kết hợp cảm biến chính 48MP cho chất lượng ảnh chụp chi tiết, màu sắc chân thực chuẩn điện ảnh. Cổng kết nối USB-C chuẩn 3.0 với tốc độ truyền tải lên đến 10Gbps giúp truyền dữ liệu video ProRes siêu nhanh chóng.</p>"
    },
    @{
        id = 2
        name = "Samsung Galaxy S25 Ultra 5G"
        specs = [ordered]@{
            "Màn hình" = "6.9 inch, Dynamic AMOLED 2X, QHD+, tần số quét thích ứng 1-120Hz, 2600 nits"
            "CPU" = "Snapdragon 8 Elite for Galaxy (3nm, 8 nhân xung nhịp tối đa 4.47GHz)"
            "RAM" = "12GB LPDDR5X"
            "Bộ nhớ" = "256GB UFS 4.0"
            "Camera sau" = "Chính 200MP OIS + Góc siêu rộng 50MP + Tele tiềm vọng 50MP (5x) + Tele 10MP (3x)"
            "Camera trước" = "12MP Dual Pixel AF, quay video 4K60fps"
            "Pin & Sạc" = "5.000 mAh, Sạc siêu nhanh 45W, sạc không dây Fast Wireless 15W"
            "Tính năng" = "Tích hợp bút S-Pen, Trợ lý Galaxy AI toàn năng, Kính Gorilla Armor chống lóa, Kháng nước IP68"
            "Hệ điều hành" = "One UI trên nền Android"
        }
        html_desc = "<p><strong>Samsung Galaxy S25 Ultra 5G</strong> đại diện cho tinh hoa công nghệ Android đỉnh cao. Máy được trang bị khung viền Titan siêu cứng cáp kết hợp mặt kính Corning Gorilla Armor chống phản chiếu ánh sáng vượt trội.</p><p>Trái tim của máy là bộ vi xử lý <strong>Snapdragon 8 Elite for Galaxy</strong> được tối ưu hóa riêng biệt với hiệu năng đơn nhân và đa nhân bứt phá, xử lý mượt mà các tác vụ AI phức tạp trên thiết bị với bộ công cụ <strong>Galaxy AI</strong> thế hệ mới (phiên dịch cuộc gọi trực tiếp, khoanh vùng tìm kiếm đa năng Circle to Search, chỉnh sửa ảnh chuyên nghiệp).</p><p>Camera chính độ phân giải khủng <strong>200MP</strong> kết hợp hệ thống camera tele tiềm vọng 50MP Zoom 5x và Space Zoom 100x ghi lại trọn vẹn mọi khoảnh khắc sắc nét cả ngày lẫn đêm. Bút S-Pen tích hợp sẵn trong thân máy đem lại trải nghiệm viết vẽ, ghi chú và điều khiển từ xa cực kỳ tiện lợi.</p>"
    },
    @{
        id = 3
        name = "MacBook Air M3 13 inch 8GB/256GB"
        specs = [ordered]@{
            "Màn hình" = "13.6 inch Liquid Retina, độ phân giải 2560 x 1664, 500 nits, dải màu P3, True Tone"
            "CPU" = "Apple M3 (8 nhân CPU: 4 nhân hiệu năng cao + 4 nhân tiết kiệm điện)"
            "RAM" = "8GB Unified Memory băng thông 100GB/s"
            "Ổ cứng" = "256GB SSD tốc độ cao"
            "GPU" = "Apple GPU 8 nhân / 10 nhân đồ họa, hỗ trợ Ray Tracing"
            "Pin" = "Lên đến 18 giờ sử dụng liên tục, hỗ trợ sạc nhanh MagSafe 3"
            "Cổng kết nối" = "2x Thunderbolt / USB 4, Jack cắm 3.5mm, Cổng sạc MagSafe 3, Wi-Fi 6E"
            "Trọng lượng" = "1.24 kg, siêu mỏng chỉ 1.13 cm, vỏ nhôm nguyên khối tái chế 100%"
            "Hệ điều hành" = "macOS"
        }
        html_desc = "<p><strong>MacBook Air M3 13 inch 8GB/256GB</strong> là mẫu laptop mỏng nhẹ hoàn hảo cho học tập, sáng tạo nội dung và làm việc văn phòng chuyên nghiệp. Thiết kế nhôm nguyên khối siêu mỏng nhẹ chỉ 1.24 kg thuận tiện mang theo mọi nơi.</p><p>Trang bị chip <strong>Apple M3</strong> sản xuất trên tiến trình 3nm hiện đại, mang lại tốc độ xử lý nhanh hơn tới 60% so với thế hệ M1. GPU tích hợp kiến trúc mới hỗ trợ Mesh Shading và Ray Tracing bằng phần cứng, giúp xử lý đồ họa, chỉnh sửa video 4K và dựng ảnh nhanh chóng.</p><p>Thời lượng pin ấn tượng lên đến <strong>18 tiếng</strong> đáp ứng cả ngày dài làm việc không cần cắm sạc. Màn hình Liquid Retina 13.6 inch sắc nét với 1 tỷ màu, webcam 1080p FaceTime HD sắc nét và hệ thống âm thanh 4 loa hỗ trợ Spatial Audio mang đến trải nghiệm nghe nhìn vượt trội.</p>"
    },
    @{
        id = 4
        name = "Laptop Asus Vivobook 14 X1404VA"
        specs = [ordered]@{
            "Màn hình" = "14.0 inch Full HD (1920 x 1080), tấm nền IPS chống chói, 250 nits, viền mỏng NanoEdge"
            "CPU" = "Intel Core i3-1315U (6 nhân 8 luồng, xung nhịp tối đa 4.5GHz, 10MB Cache)"
            "RAM" = "8GB DDR4 3200MHz (hỗ trợ nâng cấp thêm)"
            "Ổ cứng" = "512GB M.2 NVMe PCIe 3.0 SSD"
            "Đồ họa" = "Intel UHD Graphics"
            "Pin & Trọng lượng" = "42WHrs 3-cell Li-ion, trọng lượng gọn nhẹ chỉ 1.4 kg"
            "Bảo mật & Tiện ích" = "Cảm biến vân tay một chạm, Khóa webcam vật lý, Bản lề mở gập 180 độ, Chuẩn độ bền quân đội MIL-STD 810H"
            "Hệ điều hành" = "Windows 11 Home bản quyền"
        }
        html_desc = "<p><strong>Laptop Asus Vivobook 14 X1404VA</strong> là người bạn đồng hành lý tưởng dành cho học sinh, sinh viên và nhân viên văn phòng, sở hữu phong cách thiết kế hiện đại, mỏng nhẹ và thanh lịch với trọng lượng chỉ 1.4 kg.</p><p>Máy sở hữu bộ vi xử lý <strong>Intel Core i3 thế hệ 13</strong> dòng Raptor Lake kết hợp <strong>8GB RAM</strong> và ổ cứng SSD tốc độ cao <strong>512GB</strong>, cho khả năng khởi động máy trong vài giây và đa nhiệm mượt mà các ứng dụng văn phòng Office, duyệt web đa tab cũng như học tập trực tuyến.</p><p>Màn hình 14 inch Full HD sắc nét với công nghệ bảo vệ mắt lọc ánh sáng xanh đạt chứng nhận TÜV Rheinland. Bản lề linh hoạt có thể duỗi thẳng 180 độ giúp bạn dễ dàng chia sẻ ý tưởng với đồng nghiệp và bạn bè.</p>"
    },
    @{
        id = 5
        name = "Tai nghe Bluetooth AirPods Pro Gen 2 MagSafe"
        specs = [ordered]@{
            "Chip xử lý" = "Apple H2 tân tiến trong tai nghe & Chip Apple U1 trong hộp sạc"
            "Chống ồn" = "Chống ồn chủ động (Active Noise Cancellation - ANC) gấp 2 lần, Thích ứng âm thanh (Adaptive Audio)"
            "Pin" = "Lên đến 6 giờ nghe liên tục (bật ANC), tổng 30 giờ khi dùng kèm hộp sạc"
            "Kết nối" = "Bluetooth 5.3 độ trễ cực thấp, tương thích hoàn hảo hệ sinh thái Apple"
            "Hộp sạc" = "Hộp sạc MagSafe hỗ trợ loa phát âm thanh tìm kiếm qua Find My, khoen gắn dây đeo tiện lợi"
            "Kháng nước & bụi" = "Chuẩn IP54 chống mồ hôi và kháng tia nước bắn"
            "Công nghệ âm thanh" = "Âm thanh không gian cá nhân hóa (Personalized Spatial Audio) theo dõi chuyển động đầu"
        }
        html_desc = "<p><strong>Tai nghe Bluetooth AirPods Pro Gen 2 MagSafe</strong> mang đến bước nhảy vọt về chất lượng âm thanh và khả năng chống ồn nhờ sức mạnh của chip <strong>Apple H2</strong> hoàn toàn mới.</p><p>Công nghệ <strong>Chống ồn chủ động (ANC)</strong> có khả năng triệt tiêu tiếng ồn gấp 2 lần so với thế hệ trước, giúp bạn hoàn toàn đắm chìm vào không gian âm nhạc riêng tư. Chế độ <strong>Âm thanh thích ứng (Adaptive Audio)</strong> tự động cân bằng giữa chống ồn và xuyên âm dựa theo môi trường xung quanh một cách thông minh.</p><p>Trải nghiệm âm thanh không gian ba chiều sống động như đang ở trong rạp hát nhờ công nghệ Personalized Spatial Audio. Hộp sạc tích hợp loa ngoài phát tiếng kêu khi thất lạc giúp bạn dễ dàng tìm kiếm qua ứng dụng Find My chính xác đến từng mét.</p>"
    },
    @{
        id = 6
        name = "Sạc dự phòng Anker PowerCore 20000mAh 22.5W"
        specs = [ordered]@{
            "Dung lượng" = "20.000 mAh (74Wh) dung lượng chuẩn thực tế"
            "Công suất sạc" = "22.5W Max công nghệ Power Delivery & PowerIQ"
            "Cổng sạc ra" = "2x USB-A (lên đến 22.5W) + 1x USB-C (20W PD hai chiều)"
            "Cổng sạc vào" = "USB-C chuẩn Power Delivery sạc đầy pin dự phòng nhanh chóng"
            "Số thiết bị cùng lúc" = "Sạc cùng lúc 3 thiết bị đồng thời"
            "Công nghệ an toàn" = "Hệ thống bảo vệ đa lớp Anker MultiProtect (chống ngắn mạch, quá nhiệt, quá tải)"
            "Tương thích" = "Điện thoại iPhone, Samsung, Xiaomi, OPPO, máy tính bảng iPad, tai nghe không dây"
        }
        html_desc = "<p><strong>Sạc dự phòng Anker PowerCore 20000mAh 22.5W</strong> là giải pháp cấp nguồn di động mạnh mẽ và an toàn hàng đầu từ thương hiệu phụ kiện Anker danh tiếng thế giới.</p><p>Sở hữu dung lượng cực khủng <strong>20.000 mAh</strong>, viên pin có thể nạp đầy iPhone 15/16 khoảng 4.5 lần hoặc Samsung Galaxy hơn 3.5 lần, đảm bảo các thiết bị của bạn luôn sẵn sàng năng lượng trong mọi chuyến du lịch hay công tác dài ngày.</p><p>Hỗ trợ công nghệ sạc nhanh <strong>22.5W</strong> giúp rút ngắn đáng kể thời gian chờ đợi. Hệ thống chip quản lý năng lượng thông minh <strong>Anker MultiProtect</strong> bảo vệ thiết bị tối đa khỏi nguy cơ chập cháy, quá tải hay nóng máy, đảm bảo an toàn tuyệt đối khi sử dụng.</p>"
    },
    @{
        id = 7
        name = "iPhone 17 Pro Max 256GB"
        specs = [ordered]@{
            "Màn hình" = "6.9 inch Super Retina XDR OLED, 120Hz ProMotion, viền siêu mỏng, Always-On, 2500 nits"
            "CPU" = "Apple A19 Pro (tiến trình 2nm, 6 nhân CPU, GPU 6 nhân thế hệ mới, Neural Engine 16 nhân AI)"
            "RAM" = "12GB LPDDR5X"
            "Bộ nhớ" = "256GB NVMe"
            "Camera sau" = "Bộ ba Fusion 48MP (Chính 48MP OIS + Góc siêu rộng 48MP + Tiềm vọng Tele 48MP Zoom quang 5x)"
            "Camera trước" = "24MP TrueDepth với công nghệ lấy nét tự động tân tiến"
            "Pin & Sạc" = "4.850 mAh, Sạc nhanh 35W qua USB-C Thunderbolt, sạc MagSafe 25W"
            "Chất liệu & Kháng nước" = "Khung Titan Cấp 5 gia cường, Kính Ceramic Shield 2 chống xước gấp đôi, IP68"
            "Hệ điều hành" = "iOS"
        }
        html_desc = "<p><strong>iPhone 17 Pro Max 256GB</strong> mở ra chuẩn mực flagship tương lai với thiết kế tràn viền tinh xảo, khung viền Titanium siêu bền và mặt lưng kính nhám cao cấp.</p><p>Sức mạnh vượt trội từ con chip <strong>Apple A19 Pro</strong> sản xuất trên tiến trình 2nm đột phá, đem lại tốc độ xử lý nhanh chưa từng thấy và khả năng xử lý các mô hình trí tuệ nhân tạo tạo sinh AI cục bộ mượt mà, đồng thời tiết kiệm pin tối đa.</p><p>Đột phá với hệ thống cả 3 ống kính sau đều đạt độ phân giải <strong>48MP</strong>, bao gồm ống kính tiềm vọng tele 48MP zoom quang 5x sắc nét tuyệt đối ngay cả trong điều kiện ánh sáng yếu. Thời lượng pin được nâng cấp mạnh mẽ, sẵn sàng cùng bạn trải nghiệm trọn vẹn cả ngày dài với các tác vụ nặng nhất.</p>"
    },
    @{
        id = 8
        name = "iPhone Air 256GB"
        specs = [ordered]@{
            "Màn hình" = "6.6 inch Super Retina XDR OLED, ProMotion 120Hz mượt mà, Dynamic Island sắc nét"
            "CPU" = "Apple A19 Bionic (tiến trình 3nm/2nm tiết kiệm điện năng tối ưu)"
            "RAM" = "8GB LPDDR5X"
            "Bộ nhớ" = "256GB NVMe"
            "Camera sau" = "Camera đơn Fusion 48MP cao cấp, hỗ trợ chụp zoom 2x chất lượng quang học"
            "Camera trước" = "18MP TrueDepth AF"
            "Thiết kế & Độ mỏng" = "Thiết kế siêu mỏng kỷ lục (khoảng 5.5mm), trọng lượng siêu nhẹ, khung nhôm tái chế cao cấp"
            "Pin & Sạc" = "Sạc nhanh USB-C tiện lợi, sạc không dây MagSafe chuẩn Qi2"
            "Kháng nước" = "Chuẩn kháng nước và kháng bụi IP68"
        }
        html_desc = "<p><strong>iPhone Air 256GB</strong> định nghĩa lại vẻ đẹp của sự thanh mảnh và tối giản trong thế giới công nghệ. Sở hữu thân máy siêu mỏng kỷ lục chỉ khoảng 5.5mm, đây là chiếc iPhone mỏng nhẹ và phong cách nhất từng được Apple chế tác.</p><p>Dù có thân hình siêu mỏng, máy vẫn sở hữu hiệu năng mạnh mẽ từ chip <strong>Apple A19</strong>, đáp ứng trơn tru mọi nhu cầu từ lướt web, xử lý đồ họa cho đến chiến các tựa game yêu thích mà không lo quá nhiệt.</p><p>Màn hình 6.6 inch viền siêu mỏng tích hợp công nghệ ProMotion 120Hz đem lại từng thao tác vuốt chạm trơn tru. Cụm camera 48MP cao cấp hỗ trợ chụp ảnh độ phân giải siêu nét và quay video 4K sắc sảo, tôn lên cá tính công nghệ hiện đại của chủ sở hữu.</p>"
    },
    @{
        id = 9
        name = "iPhone 16 Pro 128GB (Cũ)"
        specs = [ordered]@{
            "Màn hình" = "6.3 inch Super Retina XDR OLED, 120Hz ProMotion, Dynamic Island, độ sáng đỉnh 2000 nits"
            "CPU" = "Apple A18 Pro (tiến trình 3nm thế hệ thứ 2, tối ưu Apple Intelligence)"
            "RAM" = "8GB LPDDR5X"
            "Bộ nhớ" = "128GB NVMe"
            "Camera sau" = "Chính 48MP Fusion + Góc siêu rộng 48MP + Tele 12MP Zoom quang 5x (120mm)"
            "Tính năng mới" = "Nút điều khiển Camera Control cảm ứng lực chuyên nghiệp, Nút Action Button đa năng"
            "Tình trạng máy" = "Máy cũ đẹp như mới (99%), cam kết nguyên bản chưa sửa chữa, pin 9x-100%, bảo hành uy tín"
            "Pin & Sạc" = "Sạc nhanh USB-C 3.2 tốc độ cao 10Gbps, hỗ trợ sạc MagSafe 25W"
        }
        html_desc = "<p><strong>iPhone 16 Pro 128GB (Cũ)</strong> là lựa chọn thông minh giúp bạn sở hữu siêu phẩm Pro thế hệ mới với mức chi phí tiết kiệm vượt trội. Máy qua sử dụng tuyển chọn kỹ càng, ngoại hình đẹp như mới 99%, hoạt động hoàn hảo mọi tính năng.</p><p>Trải nghiệm nhiếp ảnh đẳng cấp với nút bấm cơ điện tử <strong>Camera Control</strong> hoàn toàn mới ở cạnh bên, cho phép trượt ngón tay để zoom, điều chỉnh độ phơi sáng và lấy nét tức thì như máy ảnh chuyên nghiệp. Cụm camera sau nâng cấp mạnh mẽ với ống kính tele tiềm vọng 5x và camera góc siêu rộng 48MP.</p><p>Sức mạnh đến từ vi xử lý <strong>Apple A18 Pro</strong> mang lại hiệu suất vượt trội, tối ưu hóa hệ thống trí tuệ nhân tạo Apple Intelligence, kết hợp khung viền Titanium Cấp 5 bền nhẹ và sang trọng.</p>"
    },
    @{
        id = 10
        name = "iPhone 14 128GB (Cũ)"
        specs = [ordered]@{
            "Màn hình" = "6.1 inch Super Retina XDR OLED, độ phân giải sắc nét, công nghệ True Tone, HDR10"
            "CPU" = "Apple A15 Bionic (6 nhân CPU, 5 nhân GPU đồ họa mượt mà)"
            "RAM" = "6GB LPDDR4X"
            "Bộ nhớ" = "128GB NVMe"
            "Camera sau" = "Kép 12MP (Chính f/1.5 chống rung quang học Sensor-shift OIS + Góc siêu rộng 120 độ)"
            "Camera trước" = "12MP TrueDepth có tự động lấy nét Autofocus"
            "Tình trạng máy" = "Máy cũ likenew 99%, nguyên zin 100%, pin tốt, bảo hành uy tín"
            "Pin & Sạc" = "3.279 mAh dùng thoải mái cả ngày, sạc nhanh 20W, sạc không dây MagSafe 15W"
        }
        html_desc = "<p><strong>iPhone 14 128GB (Cũ)</strong> vẫn là một trong những chiếc smartphone bán chạy nhất nhờ độ hoàn thiện tinh tế, độ bền bỉ cao và mức giá hiện tại vô cùng hấp dẫn.</p><p>Được trang bị chip <strong>Apple A15 Bionic</strong> với 5 nhân GPU đồ họa, iPhone 14 xử lý nhẹ nhàng mọi tựa game phổ biến như Liên Quân, PUBG Mobile và render video TikTok nhanh chóng mà không hề giật lag.</p><p>Hệ thống camera kép chụp ảnh thiếu sáng tốt hơn 49% so với đời trước, hỗ trợ chế độ quay phim <strong>Action Mode</strong> chống rung siêu mượt như gimbal cầm tay. Màn hình OLED hiển thị sắc nét cùng thời lượng pin bền bỉ đáp ứng trọn vẹn cả ngày làm việc.</p>"
    },
    @{
        id = 11
        name = "iPhone 13 128GB (Cũ)"
        specs = [ordered]@{
            "Màn hình" = "6.1 inch Super Retina XDR OLED, tai thỏ thu nhỏ 20%, hiển thị rực rỡ, độ sáng 800-1200 nits"
            "CPU" = "Apple A15 Bionic (tiến trình 5nm, 6 nhân CPU, 4 nhân GPU)"
            "RAM" = "4GB LPDDR4X"
            "Bộ nhớ" = "128GB NVMe"
            "Camera sau" = "Kép 12MP đặt chéo đặc trưng (Camera chính cảm biến lớn hỗ trợ Sensor-shift OIS + Góc siêu rộng)"
            "Camera trước" = "12MP TrueDepth hỗ trợ mở khóa Face ID cực nhạy"
            "Tình trạng máy" = "Máy cũ đẹp 99%, zin đét chưa qua sửa chữa, đầy đủ chức năng"
            "Pin & Sạc" = "3.227 mAh, sạc nhanh 20W (50% trong 30 phút), hỗ trợ sạc MagSafe"
        }
        html_desc = "<p><strong>iPhone 13 128GB (Cũ)</strong> là sự lựa chọn số 1 trong tầm giá dưới 10 triệu đồng dành cho người dùng yêu thích sự ổn định, thiết kế sang trọng và bền bỉ theo thời gian.</p><p>Thiết kế cụm camera đặt chéo ấn tượng mang tính biểu tượng, tích hợp công nghệ chống rung cảm biến <strong>Sensor-shift OIS</strong> cao cấp vốn chỉ có trên dòng Pro Max đời trước, cho ra những bức ảnh sắc nét, không bị nhòe mờ ngay cả khi chụp ban đêm.</p><p>Vi xử lý <strong>Apple A15 Bionic</strong> mang đến tốc độ phản hồi chớp nhoáng, hỗ trợ cập nhật phần mềm iOS lâu dài trong nhiều năm tới. Màn hình OLED Super Retina XDR hiển thị màu đen sâu thẳm và độ tương phản tuyệt vời khi xem phim, lướt mạng xã hội.</p>"
    },
    @{
        id = 12
        name = "iPhone 12 64GB (Cũ)"
        specs = [ordered]@{
            "Màn hình" = "6.1 inch Super Retina XDR OLED sắc nét, kính gốm Ceramic Shield chống va đập gấp 4 lần"
            "CPU" = "Apple A14 Bionic (tiến trình 5nm, 6 nhân CPU, 4 nhân GPU)"
            "RAM" = "4GB LPDDR4X"
            "Bộ nhớ" = "64GB NVMe"
            "Camera sau" = "Kép 12MP (Chính f/1.6 & Góc siêu rộng f/2.4), chế độ chụp đêm Night Mode trên mọi camera"
            "Camera trước" = "12MP TrueDepth, quay 4K HDR Dolby Vision"
            "Tình trạng máy" = "Máy cũ ngoại hình 98-99%, main zin màn zin, Face ID nhận diện cực nhanh"
            "Kết nối & Pin" = "Hỗ trợ 5G siêu tốc, Pin 2.815 mAh, sạc nhanh 20W, sạc không dây MagSafe 15W"
        }
        html_desc = "<p><strong>iPhone 12 64GB (Cũ)</strong> đánh dấu bước chuyển mình đột phá của Apple với ngôn ngữ thiết kế viền nhôm vuông vức hiện đại, mở đầu kỷ nguyên mạng di động 5G siêu tốc.</p><p>Màn hình <strong>Super Retina XDR OLED</strong> tràn viền mang đến trải nghiệm thị giác vượt trội hơn hẳn các thế hệ màn hình LCD cũ, được bảo vệ bằng mặt kính gốm Ceramic Shield siêu bền chống nứt vỡ tối đa khi va chạm.</p><p>Bộ vi xử lý <strong>Apple A14 Bionic</strong> tiến trình 5nm vẫn dư sức xử lý mượt mà mọi ứng dụng học tập, làm việc và giải trí hàng ngày. Hệ thống camera kép hỗ trợ chụp đêm Night Mode trên cả camera trước và sau giúp bạn tự tin ghi lại khoảnh khắc trong mọi điều kiện ánh sáng.</p>"
    },
    @{
        id = 13
        name = "Iphone 16 Plus 128GB"
        specs = [ordered]@{
            "Màn hình" = "6.7 inch Super Retina XDR OLED, Dynamic Island, độ sáng tối đa 2000 nits ngoài trời"
            "CPU" = "Apple A18 (tiến trình 3nm thế hệ thứ 2, 6 nhân CPU, 5 nhân GPU, hỗ trợ Apple Intelligence)"
            "RAM" = "8GB LPDDR5X"
            "Bộ nhớ" = "128GB NVMe"
            "Camera sau" = "Camera Fusion 48MP (hỗ trợ tele 2x 12MP chất lượng quang học) + Camera góc siêu rộng 12MP tự động lấy nét"
            "Camera trước" = "12MP TrueDepth AF, quay video 4K60fps"
            "Tính năng mới" = "Nút điều khiển Camera Control thông minh, Nút Action Button thay thế gạt rung, Mặt lưng kính pha màu"
            "Pin & Sạc" = "Thời lượng pin siêu khủng (lên đến 27 giờ xem video), Cổng sạc Type-C, sạc không dây MagSafe 25W"
        }
        html_desc = "<p><strong>iPhone 16 Plus 128GB</strong> mang đến không gian hiển thị rộng rãi cùng thời lượng pin dẫn đầu phân khúc, là lựa chọn tuyệt vời cho những ai yêu thích màn hình lớn và thời gian sử dụng bền bỉ suốt cả ngày dài.</p><p>Trang bị con chip <strong>Apple A18</strong> thế hệ mới tối ưu sâu cho các tính năng trí tuệ nhân tạo <strong>Apple Intelligence</strong>, mang lại sức mạnh vượt trội hơn 30% so với thế hệ trước cùng khả năng xử lý đồ họa Ray Tracing đỉnh cao.</p><p>Cụm camera Fusion <strong>48MP</strong> tích hợp nút bấm <strong>Camera Control</strong> cảm ứng mới giúp bạn mở camera, zoom và chuyển đổi chế độ chụp chỉ bằng một cú chạm nhẹ. Thiết kế mặt lưng kính pha màu rực rỡ với bảng màu pastel bắt mắt, đi cùng cổng kết nối USB-C tiện lợi đồng bộ toàn diện.</p>"
    },
    @{
        id = 14
        name = "Iphone 16 Promax 256GB"
        specs = [ordered]@{
            "Màn hình" = "6.9 inch Super Retina XDR OLED, ProMotion 120Hz, viền màn hình mỏng kỷ lục, Always-On"
            "CPU" = "Apple A18 Pro (tiến trình 3nm thế hệ 2, GPU 6 nhân cực mạnh, Neural Engine 16 nhân tối ưu AI)"
            "RAM" = "8GB LPDDR5X"
            "Bộ nhớ" = "256GB NVMe"
            "Camera sau" = "Hệ thống Pro 3 camera: Chính 48MP Fusion + Góc siêu rộng 48MP + Tele 12MP Zoom quang 5x (120mm)"
            "Camera trước" = "12MP TrueDepth AF, hỗ trợ quay video 4K 120fps Dolby Vision điện ảnh"
            "Tính năng mới" = "Phím bấm cảm ứng lực Camera Control, Thiết kế khung Titan Cấp 5 tản nhiệt tốt hơn"
            "Pin & Sạc" = "Dung lượng pin lớn nhất lịch sử iPhone (lên tới 33 giờ xem video), Sạc nhanh USB-C 3.2, MagSafe 25W"
            "Hệ điều hành" = "iOS tối ưu Apple Intelligence"
        }
        html_desc = "<p><strong>iPhone 16 Pro Max 256GB</strong> là đỉnh cao công nghệ smartphone toàn cầu của Apple. Máy sở hữu màn hình <strong>6.9 inch</strong> lớn nhất và viền màn hình mỏng nhất từng xuất hiện trên iPhone, mở ra không gian thị giác vô tận đầy choáng ngợp.</p><p>Được hoàn thiện từ chất liệu <strong>Titan Cấp 5</strong> cao cấp cùng cấu trúc khung tản nhiệt nhôm tái chế giúp máy duy trì hiệu năng đỉnh cao bền bỉ hơn 20%. Vi xử lý <strong>Apple A18 Pro</strong> biến thiết bị thành cỗ máy đồ họa siêu tốc, vận hành trơn tru mọi mô hình AI thế hệ mới.</p><p>Hệ thống camera chuyên nghiệp với camera góc siêu rộng nâng cấp lên <strong>48MP</strong>, camera tele tiềm vọng zoom 5x sắc nét và khả năng quay video <strong>4K 120fps Dolby Vision</strong> chuẩn rạp chiếu phim. Nút <strong>Camera Control</strong> mang lại trải nghiệm bấm chụp cơ học tiện lợi như một chiếc máy ảnh mirrorless thực thụ.</p>"
    },
    @{
        id = 15
        name = "OPPO Find X9"
        specs = [ordered]@{
            "Màn hình" = "6.59 inch AMOLED 1.5K, tần số quét 120Hz thích ứng, độ sáng đỉnh 4500 nits, hiển thị 1.07 tỷ màu"
            "CPU" = "MediaTek Dimensity 9400 (tiến trình 3nm All-Big-Core, GPU Immortalis-G925)"
            "RAM" = "16GB LPDDR5X"
            "Bộ nhớ" = "256GB / 512GB UFS 4.0"
            "Camera sau" = "Bộ 3 camera Hasselblad: Chính 50MP OIS cảm biến lớn + Góc siêu rộng 50MP + Tele tiềm vọng 50MP Zoom 3x"
            "Camera trước" = "32MP tự động lấy nét, quay 4K"
            "Pin & Sạc" = "5.630 mAh pin Silicon-Carbon dung lượng cao, Sạc nhanh có dây SuperVOOC 80W, Sạc không dây 50W"
            "Kháng nước & Bụi" = "Chuẩn kép IP68 và IP69 bảo vệ toàn diện chống nước nóng và tia nước áp lực cao"
            "Hệ điều hành" = "ColorOS trên nền Android"
        }
        html_desc = "<p><strong>OPPO Find X9</strong> là mẫu flagship hội tụ tinh hoa thiết kế mỏng nhẹ và sức mạnh nhiếp ảnh di động đỉnh cao. Mặt lưng kính nhung mịn cùng cụm camera tròn vũ trụ đặc trưng mang lại vẻ đẹp quý phái, sang trọng.</p><p>Sức mạnh phần cứng vượt bậc từ vi xử lý <strong>Dimensity 9400</strong> kiến trúc toàn nhân lớn 3nm giúp máy đạt điểm hiệu năng kỷ lục, cân mọi tựa game nặng ở mức thiết lập đồ họa cao nhất mà máy vẫn mát mẻ và tiết kiệm pin.</p><p>Hợp tác chặt chẽ cùng thương hiệu máy ảnh huyền thoại <strong>Hasselblad</strong>, cụm 3 camera 50MP mang đến chất ảnh chân dung thần thái, màu sắc sống động và độ chi tiết sâu sắc. Viên pin Silicon-Carbon thế hệ mới dung lượng lên tới <strong>5.630 mAh</strong> cùng sạc nhanh SuperVOOC 80W giúp bạn an tâm sử dụng suốt ngày dài bận rộn.</p>"
    },
    @{
        id = 16
        name = "OPPO A78 8GB/256GB"
        specs = [ordered]@{
            "Màn hình" = "6.43 inch AMOLED Full HD+ (1080 x 2400 pixels), tần số quét 90Hz, kính cường lực Gorilla Glass 5"
            "CPU" = "Qualcomm Snapdragon 680 8 nhân (tiến trình 6nm tiết kiệm pin tối ưu)"
            "RAM" = "8GB LPDDR4X (hỗ trợ mở rộng RAM ảo lên đến 16GB)"
            "Bộ nhớ" = "256GB UFS 2.2 (hỗ trợ khe cắm thẻ nhớ MicroSD tối đa 1TB)"
            "Camera sau" = "Kép AI: Chính 50MP (f/1.8 sắc nét) + Ống kính đo chiều sâu 2MP chụp chân dung xóa phông"
            "Camera trước" = "8MP tích hợp thuật toán AI làm đẹp tự nhiên"
            "Pin & Sạc" = "5.000 mAh, Sạc siêu nhanh SuperVOOC 67W (nạp 76% pin chỉ trong 30 phút)"
            "Tiện ích" = "Cảm biến vân tay quang học dưới màn hình, Loa kép stereo âm lượng siêu lớn 200%, Chuẩn kháng bụi nước IP54"
        }
        html_desc = "<p><strong>OPPO A78 8GB/256GB</strong> là mẫu smartphone tầm trung nổi bật với thiết kế phong cách mặt lưng OPPO Glow thời thượng, chống bám vân tay và tỏa sáng lấp lánh dưới ánh sáng mặt trời.</p><p>Màn hình <strong>AMOLED 90Hz</strong> sắc nét mang đến màu sắc rực rỡ, độ tương phản cao cùng khả năng bảo vệ mắt toàn diện. Điểm cộng lớn của máy là công nghệ sạc nhanh <strong>SuperVOOC 67W</strong>, giúp nạp lại đầy viên pin 5000mAh chỉ trong khoảng 45 phút – nhanh bậc nhất phân khúc.</p><p>Cấu hình ổn định với chip <strong>Snapdragon 680</strong> kết hợp bộ nhớ trong khủng <strong>256GB</strong> và 8GB RAM, cho phép bạn thoải mái lưu trữ hàng chục ngàn bức ảnh, video chất lượng cao và đa nhiệm mượt mà các ứng dụng thường ngày.</p>"
    },
    @{
        id = 17
        name = "Xiaomi 17 Ultra 5G"
        specs = [ordered]@{
            "Màn hình" = "6.73 inch LTPO AMOLED 2K+, 1-120Hz thích ứng, độ sáng cực đại 4000 nits, Dolby Vision, HDR10+"
            "CPU" = "Qualcomm Snapdragon 8 Elite (tiến trình 3nm, GPU Adreno 830 đồ họa đỉnh cao)"
            "RAM" = "16GB LPDDR5X"
            "Bộ nhớ" = "512GB UFS 4.0 tốc độ cao"
            "Camera sau" = "Hệ thống 4 camera Leica Summilux: Chính 50MP cảm biến 1 inch OIS + Góc siêu rộng 50MP + Tele 50MP (3.2x) + Tiềm vọng 200MP (Zoom quang 5x đến 120x Ultra Zoom)"
            "Camera trước" = "32MP góc rộng, quay video 4K HDR"
            "Pin & Sạc" = "5.500 mAh pin công nghệ mới, Sạc nhanh có dây 90W HyperCharge, sạc nhanh không dây 80W"
            "Chất liệu & Độ bền" = "Khung nhôm nguyên khối siêu cứng hoặc hợp kim Titanium, Kính Xiaomi Shield Glass, chuẩn kháng nước IP68"
        }
        html_desc = "<p><strong>Xiaomi 17 Ultra 5G</strong> là chiếc flagship nhiếp ảnh tối thượng được chế tác cùng huyền thoại máy ảnh <strong>Leica</strong>. Sở hữu cụm camera tròn đồ sộ với thấu kính quang học Leica Summilux trứ danh, biến mọi khung hình đời thường thành tác phẩm nghệ thuật.</p><p>Được trang bị cảm biến chính kích thước lớn <strong>1 inch</strong> thế hệ mới cùng camera tiềm vọng độ phân giải khủng <strong>200MP</strong> zoom quang học sắc nét, máy cho khả năng thu sáng vượt trội và tái tạo màu sắc chuẩn chất film Leica sống động.</p><p>Sức mạnh đỉnh bảng từ vi xử lý <strong>Snapdragon 8 Elite</strong> tiến trình 3nm đáp ứng xuất sắc mọi tác vụ nặng nhất từ biên tập video 8K đến chơi game đồ họa khủng. Màn hình 2K+ độ sáng 4000 nits cùng công nghệ sạc thần tốc 90W hoàn thiện trải nghiệm đỉnh cao.</p>"
    },
    @{
        id = 18
        name = "Redmi A7"
        specs = [ordered]@{
            "Màn hình" = "6.88 inch IPS LCD, tần số quét 120Hz mượt mà, độ phân giải HD+, chứng nhận lọc ánh sáng xanh TÜV"
            "CPU" = "MediaTek Helio G81-Ultra 8 nhân (tối ưu hóa giao diện HyperOS mượt mà)"
            "RAM" = "4GB / 6GB (hỗ trợ mở rộng RAM ảo thêm 4GB)"
            "Bộ nhớ" = "128GB eMMC 5.1 (hỗ trợ thẻ nhớ mở rộng MicroSD lên tới 1TB)"
            "Camera sau" = "Camera kép 50MP AI f/1.8 chụp sắc nét + Cảm biến phụ trợ đo chiều sâu chân dung"
            "Camera trước" = "13MP hỗ trợ selfie góc rộng và làm đẹp tự nhiên"
            "Pin & Sạc" = "5.160 mAh cực trâu, hỗ trợ sạc nhanh 18W qua cổng Type-C"
            "Tiện ích" = "Cảm biến vân tay cạnh bên nhạy bén, Cổng cắm tai nghe 3.5mm, Mở khóa khuôn mặt AI"
        }
        html_desc = "<p><strong>Redmi A7</strong> là đại diện sáng giá trong phân khúc điện thoại thông minh giá rẻ phổ thông, mang đến trải nghiệm vượt tầm giá cho người dùng học sinh, sinh viên và người lớn tuổi.</p><p>Điểm nhấn ấn tượng là màn hình kích thước lớn <strong>6.88 inch</strong> với tần số quét <strong>120Hz</strong> mượt mà hiếm thấy trong phân khúc, giúp mọi thao tác cuộn lướt Facebook, TikTok và xem video YouTube trở nên êm ái, đã mắt.</p><p>Viên pin dung lượng lớn <strong>5.160 mAh</strong> cho thời gian sử dụng bền bỉ lên đến 2 ngày mà không lo hết pin giữa chừng. Camera AI <strong>50MP</strong> bắt trọn các khoảnh khắc thường ngày rõ nét, đi kèm thiết kế mặt lưng kính thanh lịch tạo cảm giác cầm nắm chắc chắn và thời trang.</p>"
    },
    @{
        id = 19
        name = "Samsung Galaxy Z Fold8 5G"
        specs = [ordered]@{
            "Màn hình chính" = "8.0 inch Foldable Dynamic AMOLED 2X, tần số quét thích ứng 1-120Hz, 2800 nits, nếp gấp màn hình tối ưu phẳng mịn"
            "Màn hình phụ" = "6.5 inch Dynamic AMOLED 2X tỷ lệ rộng rãi dễ gõ một tay, tần số quét 120Hz"
            "CPU" = "Snapdragon 8 Elite for Galaxy (tiến trình 3nm, tăng tốc xử lý NPU và đồ họa gập)"
            "RAM" = "12GB / 16GB LPDDR5X"
            "Bộ nhớ" = "256GB / 512GB UFS 4.0"
            "Camera sau" = "Bộ 3 cao cấp: Chính 200MP OIS + Góc siêu rộng 50MP + Tele tiềm vọng 50MP Zoom quang 5x"
            "Bản lề & Độ bền" = "Bản lề Armor Aluminum siêu mỏng nhẹ, Kính Gorilla Armor chống xước, chuẩn kháng nước IP48"
            "Pin & Sạc" = "4.600 mAh công nghệ pin kép, Sạc nhanh 45W, sạc không dây 15W"
            "Tiện ích" = "Hỗ trợ bút S-Pen chuyên dụng, Đa nhiệm 3 cửa sổ cùng lúc, Bộ công cụ Galaxy AI nâng cao"
        }
        html_desc = "<p><strong>Samsung Galaxy Z Fold8 5G</strong> tiếp tục thiết lập tiêu chuẩn mới cho phân khúc điện thoại màn hình gập cao cấp. Thân máy được tinh chỉnh mỏng nhẹ kỷ lục, mang lại cảm giác cầm nắm gọn gàng như một chiếc điện thoại thanh tiêu chuẩn khi gập lại.</p><p>Khi mở ra, màn hình cực lớn <strong>8.0 inch Dynamic AMOLED 2X</strong> biến thiết bị thành một chiếc máy tính bảng mini mạnh mẽ. Nếp gấp màn hình gần như tàng hình, hỗ trợ đa nhiệm tối đa 3 ứng dụng cùng lúc và tương thích hoàn hảo cùng bút <strong>S-Pen</strong> để viết vẽ, ký hợp đồng tiện lợi.</p><p>Cấu hình siêu khủng từ chip <strong>Snapdragon 8 Elite for Galaxy</strong> kết hợp camera chính <strong>200MP</strong> đem lại chất lượng quay chụp đẳng cấp chuyên nghiệp. Tích hợp bộ quyền năng <strong>Galaxy AI</strong> giúp tóm tắt văn bản, dịch trực tiếp cuộc gọi và sáng tạo hình ảnh chỉ với vài nét phác thảo.</p>"
    },
    @{
        id = 20
        name = "Samsung Galaxy A08"
        specs = [ordered]@{
            "Màn hình" = "6.7 inch PLS LCD, độ phân giải HD+ rực rỡ, tần số quét 90Hz vuốt chạm mượt mà"
            "CPU" = "MediaTek Helio G85 8 nhân (2 nhân 2.0 GHz Cortex-A75 & 6 nhân 1.8 GHz Cortex-A55)"
            "RAM" = "4GB (hỗ trợ RAM Plus mở rộng bộ nhớ RAM ảo)"
            "Bộ nhớ" = "128GB (hỗ trợ mở rộng thẻ nhớ MicroSD lên đến 1TB)"
            "Camera sau" = "Camera kép: Chính 50MP (khẩu độ f/1.8 sắc nét) + Cảm biến đo độ sâu 2MP chụp xóa phông"
            "Camera trước" = "8MP f/2.0 hỗ trợ chụp selfie và mở khóa khuôn mặt"
            "Pin & Sạc" = "5.000 mAh bền bỉ, hỗ trợ công nghệ sạc nhanh 25W qua cổng Type-C"
            "Thiết kế" = "Phong cách thiết kế đặc trưng dòng Galaxy, mỏng nhẹ 8.0mm, tích hợp vân tay cạnh bên nút nguồn"
        }
        html_desc = "<p><strong>Samsung Galaxy A08</strong> là mẫu điện thoại quốc dân phân khúc phổ thông đến từ thương hiệu Samsung uy tín, đem lại trải nghiệm mượt mà, tiện dụng và độ bền bỉ dài lâu.</p><p>Màn hình lớn <strong>6.7 inch</strong> với tần số quét <strong>90Hz</strong> giúp các thao tác lướt web, xem video và chơi game trở nên trơn tru, dịu mắt. Thiết kế thân máy mỏng nhẹ tinh tế với các đường bo cong mềm mại cho cảm giác cầm nắm thoải mái cả ngày dài.</p><p>Camera chính độ phân giải cao <strong>50MP</strong> cho hình ảnh sắc nét, màu sắc tươi tắn trong mọi điều kiện ánh sáng. Viên pin dung lượng lớn <strong>5.000 mAh</strong> kết hợp sạc nhanh <strong>25W</strong> giúp bạn thoải mái liên lạc, học tập và giải trí suốt cả ngày mà không cần lo lắng về pin.</p>"
    },
    @{
        id = 29
        name = "Oppo Find X9 Pro 5G"
        specs = [ordered]@{
            "Màn hình" = "6.82 inch LTPO AMOLED 2K+, cong nhẹ 4 cạnh viền siêu mỏng, 1-120Hz thích ứng, 4500 nits, Dolby Vision"
            "CPU" = "MediaTek Dimensity 9400 (tiến trình 3nm, CPU All-Big-Core siêu mạnh, NPU AI thế hệ mới)"
            "RAM" = "16GB LPDDR5X"
            "Bộ nhớ" = "512GB UFS 4.0"
            "Camera sau" = "Hệ thống 4 camera Hasselblad: Chính 50MP cảm biến lớn 1 inch OIS + Góc siêu rộng 50MP + Tele tiềm vọng kép (50MP 3x & 50MP 6x zoom quang, lên tới 120x kỹ thuật số)"
            "Camera trước" = "32MP lấy nét tự động Sony IMX615, quay 4K 60fps"
            "Pin & Sạc" = "5.910 mAh pin Silicon-Carbon Glacier thế hệ mới, Sạc siêu nhanh SuperVOOC 100W, Sạc không dây AirVOOC 50W"
            "Kháng nước & Bụi" = "Chuẩn kép cao cấp nhất IP68 và IP69 (chống nước áp lực cao và nhiệt độ cao)"
            "Hệ điều hành" = "ColorOS trên nền Android"
        }
        html_desc = "<p><strong>OPPO Find X9 Pro 5G</strong> khẳng định vị thế máy ảnh chuyên nghiệp thu nhỏ với hệ thống camera tiềm vọng kép đồng chế tác cùng huyền thoại <strong>Hasselblad</strong>. Hai ống kính tele tiềm vọng quang học 3x và 6x bắt trọn chi tiết từ chân dung cự ly gần đến phong cảnh tầm xa với độ trong trẻo kinh ngạc.</p><p>Được trang bị vi xử lý đầu bảng <strong>Dimensity 9400</strong> tiến trình 3nm cùng RAM 16GB, máy xử lý mượt mà mọi tác vụ đồ họa nặng và các tính năng AI xử lý hình ảnh phức tạp trong chớp mắt.</p><p>Công nghệ pin băng tuyết Glacier Silicon-Carbon đạt dung lượng kỷ lục <strong>5.910 mAh</strong> nhưng vẫn giữ được thân máy thanh mảnh. Kết hợp công nghệ sạc thần tốc <strong>SuperVOOC 100W</strong> và chuẩn kháng nước bụi kép IP68/IP69 cao nhất thế giới di động.</p>"
    },
    @{
        id = 30
        name = "Oppo Find X9s"
        specs = [ordered]@{
            "Màn hình" = "6.59 inch AMOLED 1.5K, tần số quét 120Hz mượt mà, độ sáng đỉnh 4000 nits, chuẩn 1.07 tỷ màu, bảo vệ mắt"
            "CPU" = "MediaTek Dimensity 9300+ / 9400e (tiến trình 4nm/3nm cao cấp, xung nhịp tối đa 3.4GHz)"
            "RAM" = "12GB LPDDR5X"
            "Bộ nhớ" = "256GB UFS 4.0"
            "Camera sau" = "3 camera cao cấp: Chính 50MP cảm biến Sony OIS + Góc siêu rộng 50MP + Tele chân dung 50MP Zoom quang 3x Hasselblad"
            "Camera trước" = "32MP AI làm đẹp tự nhiên, mở khóa khuôn mặt"
            "Pin & Sạc" = "5.500 mAh công nghệ pin mới, Sạc nhanh SuperVOOC 80W (sạc đầy trong 35 phút)"
            "Thiết kế" = "Thân máy siêu mỏng nhẹ, khung kim loại cao cấp, chuẩn kháng nước bụi IP65"
        }
        html_desc = "<p><strong>OPPO Find X9s</strong> mang đến phong cách thời thượng và thanh lịch, là phiên bản kết hợp hài hòa giữa kiểu dáng mỏng nhẹ quyến rũ và hiệu năng mạnh mẽ chuẩn flagship.</p><p>Màn hình cong nhẹ kích thước 6.59 inch độ phân giải <strong>1.5K 120Hz</strong> hiển thị hình ảnh rực rỡ, sắc nét từng milimet. Cụm camera ba ống kính <strong>50MP</strong> đồng chế tác cùng Hasselblad mang lại những bức ảnh chụp chân dung xóa phông tự nhiên, màu da ấm áp chân thực.</p><p>Vi xử lý cao cấp hỗ trợ mạng 5G tốc độ cao, đa nhiệm không gián đoạn với <strong>12GB RAM</strong> và 256GB bộ nhớ trong. Viên pin lớn <strong>5.500 mAh</strong> cùng sạc nhanh SuperVOOC 80W giúp bạn luôn duy trì kết nối liên tục suốt cả ngày.</p>"
    },
    @{
        id = 31
        name = "Xiaomi 17T Pro 5G"
        specs = [ordered]@{
            "Màn hình" = "6.67 inch CrystalRes AMOLED 1.5K, tần số quét siêu mượt 144Hz, độ sáng đỉnh 4000 nits, Dolby Vision, HDR10+"
            "CPU" = "MediaTek Dimensity 9400+ (tiến trình 3nm hàng đầu, đồ họa Immortalis ray tracing)"
            "RAM" = "12GB LPDDR5X"
            "Bộ nhớ" = "512GB UFS 4.0"
            "Camera sau" = "Hệ thống ống kính Leica chuyên nghiệp: Chính 50MP cảm biến Light Fusion 900 OIS + Góc siêu rộng 12MP + Tele Leica 50MP Zoom 2.6x"
            "Camera trước" = "32MP sắc nét, quay video chống rung"
            "Pin & Sạc" = "5.000 mAh, Sạc siêu tốc độc quyền 120W HyperCharge (sạc đầy 100% chỉ trong 19 phút)"
            "Tản nhiệt & Độ bền" = "Hệ thống tản nhiệt buồng hơi 3D IceLoop độc quyền, Khung kim loại bền bỉ, Chuẩn kháng nước kháng bụi IP68"
        }
        html_desc = "<p><strong>Xiaomi 17T Pro 5G</strong> được mệnh danh là \"quái vật hiệu năng\" thế hệ mới, sở hữu cấu hình phần cứng đỉnh cao phục vụ trọn vẹn mọi nhu cầu từ chiến game chuyên nghiệp đến sáng tạo nội dung.</p><p>Sức mạnh vượt trội từ vi xử lý <strong>Dimensity 9400+</strong> 3nm kết hợp cùng màn hình <strong>144Hz CrystalRes AMOLED</strong> mang đến trải nghiệm hình ảnh mượt mà đến từng khung hình trong các tựa game bắn súng FPS và MOBA tốc độ cao.</p><p>Cụm camera đồng phát triển cùng hãng quang học <strong>Leica</strong> với phong cách ảnh Leica Chân thực và Leica Rực rỡ đặc trưng. Đặc biệt, công nghệ sạc siêu tốc <strong>120W HyperCharge</strong> sạc đầy 100% pin chỉ trong vỏn vẹn 19 phút, giúp thiết bị luôn sẵn sàng hành động mọi lúc mọi nơi.</p>"
    },
    @{
        id = 32
        name = "Iphone test"
        specs = [ordered]@{
            "Màn hình" = "6.1 inch Super Retina XDR OLED, độ phân giải sắc nét, True Tone, Dynamic Island"
            "CPU" = "Apple A17 Bionic 6 nhân (tiến trình 3nm, 6 nhân CPU, 5 nhân GPU đồ họa mượt mà)"
            "RAM" = "6GB LPDDR5"
            "Bộ nhớ" = "128GB NVMe"
            "Camera sau" = "Camera Fusion 48MP OIS chụp sắc nét + Camera góc siêu rộng 12MP"
            "Camera trước" = "12MP TrueDepth có tự động lấy nét"
            "Pin & Sạc" = "3.349 mAh, Hỗ trợ sạc nhanh 20W qua cổng USB-C, Sạc không dây MagSafe"
            "Hệ điều hành" = "iOS phiên bản thử nghiệm mới nhất"
        }
        html_desc = "<p><strong>Iphone test</strong> là phiên bản thiết bị thử nghiệm tiêu chuẩn (Test Model) được cấu hình nhằm kiểm tra các tính năng tương thích phần cứng, giao diện và hệ thống thanh toán trên nền tảng thương mại điện tử.</p><p>Thiết bị sở hữu cấu hình mạnh mẽ chuẩn Apple với màn hình <strong>Super Retina XDR OLED 6.1 inch</strong> sắc nét, vi xử lý <strong>Apple A17 Bionic</strong> thế hệ mới và cụm camera Fusion 48MP chất lượng cao.</p><p>Hỗ trợ đầy đủ các kết nối hiện đại gồm cổng sạc USB-C, sạc không dây MagSafe và hệ điều hành iOS tối ưu hóa, đảm bảo trải nghiệm hiển thị và thử nghiệm sản phẩm luôn chân thực và hoàn chỉnh nhất.</p>"
    }
)

$updateCmd = $conn.CreateCommand()
$updateCmd.CommandText = "UPDATE products SET description = @description WHERE id = @id"
$pDesc = $updateCmd.Parameters.Add("@description", [System.Data.SqlDbType]::NVarChar, -1)
$pId = $updateCmd.Parameters.Add("@id", [System.Data.SqlDbType]::BigInt)

$updatedCount = 0
foreach ($prod in $productsData) {
    $payloadObj = [ordered]@{
        specs = $prod.specs
        html_desc = $prod.html_desc
    }
    $json = $payloadObj | ConvertTo-Json -Depth 5 -Compress

    $pDesc.Value = $json
    $pId.Value = $prod.id

    $rows = $updateCmd.ExecuteNonQuery()
    if ($rows -gt 0) {
        Write-Host ("Updated ID {0} ({1}): OK ({2} chars)" -f $prod.id, $prod.name, $json.Length)
        $updatedCount++
    } else {
        Write-Host ("WARNING: ID {0} not found in database!" -f $prod.id)
    }
}

Write-Host ("=========================================")
Write-Host ("Total products updated successfully: {0} / {1}" -f $updatedCount, $productsData.Count)

$conn.Close()
