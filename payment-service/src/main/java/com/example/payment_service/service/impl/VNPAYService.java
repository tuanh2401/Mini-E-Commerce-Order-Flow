package com.example.payment_service.service.impl;

import com.example.payment_service.config.VNPAYConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPAYService {

    private final VNPAYConfig vnpayConfig;

    /**
     * Tạo URL thanh toán gửi cho khách hàng
     */
    public String createPaymentUrl(String orderId, long amount, String orderInfo, String ipAddress) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpCurrCode = "VND";
        String vnpLocale = "vn";
        String vnpOrderType = "other";

        // Tạo mã giao dịch ngắn (vì VNPAY giới hạn 8 ký tự)
        String vnpTxnRef = orderId.substring(0, Math.min(orderId.length(), 8))
                + System.currentTimeMillis() % 1000;

        // Thời gian tạo (định dạng yyyyMMddHHmmss)
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnpCreateDate = sdf.format(new Date());

        // Tập hợp các param gửi cho VNPAY — phải sắp xếp alphabet
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", vnpVersion);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY tính đơn vị VNĐ × 100
        vnpParams.put("vnp_CurrCode", vnpCurrCode);
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", vnpOrderType);
        vnpParams.put("vnp_Locale", vnpLocale);
        vnpParams.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", ipAddress);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cal.add(Calendar.MINUTE, 15); // hết hạn sau 15 phút

        String vnpExpireDate = sdf.format(cal.getTime());

        vnpParams.put("vnp_ExpireDate", vnpExpireDate);
        // Nối các param thành chuỗi để ký
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            hashData.append(entry.getKey()).append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                    .append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            hashData.append("&");
            query.append("&");
        }
        // Xóa dấu & cuối cùng
        hashData.deleteCharAt(hashData.length() - 1);
        query.deleteCharAt(query.length() - 1);

        // Ký HMAC SHA512
        String secureHash = hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());

        return vnpayConfig.getUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    /**
     * Xác thực chữ ký từ IPN/Return URL của VNPAY
     * Trả về true nếu hợp lệ
     */
    public boolean verifySignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        // Loại bỏ các param không dùng để hash
        Map<String, String> signParams = new TreeMap<>(params);
        signParams.remove("vnp_SecureHash");
        signParams.remove("vnp_SecureHashType");

        // Nối lại thành chuỗi hash
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : signParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                hashData.append(entry.getKey()).append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                        .append("&");
            }
        }
        hashData.deleteCharAt(hashData.length() - 1);

        String expectedHash = hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
        return expectedHash.equalsIgnoreCase(receivedHash);
    }

    /**
     * Kiểm tra giao dịch thành công từ VNPAY
     */
    public boolean isSuccess(Map<String, String> params) {
        return "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
    }

    // Hàm mã hóa HMAC SHA-512
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa HMAC SHA512", e);
        }
    }
}
