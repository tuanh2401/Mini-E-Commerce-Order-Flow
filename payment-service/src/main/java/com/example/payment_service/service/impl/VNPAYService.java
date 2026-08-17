package com.example.payment_service.service.impl;

import com.example.payment_service.config.VNPAYConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPAYService {

    private final VNPAYConfig vnpayConfig;

    /**
     * Tạo URL thanh toán gửi cho khách hàng
     */

    public String createPaymentUrl(String orderId, String vnpTxnRef , long amount, String orderInfo, String ipAddress) {
        log.info("Bắt đầu tạo URL thanh toán cho đơn hàng [{}], Số tiền: {} VND", orderId, amount);
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpCurrCode = "VND";
        String vnpLocale = "vn";
        String vnpOrderType = "other";

//        // Tạo mã giao dịch ngắn (vì VNPAY giới hạn 8 ký tự)
//        String vnpTxnRef = orderId.substring(0, Math.min(orderId.length(), 8))
//                + System.currentTimeMillis() % 1000;

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

        String finalUrl = vnpayConfig.getUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        // Giai đoạn 2: Log mã tham chiếu giao dịch (Quan trọng nhất để đối soát)
        log.info("Tạo URL thanh toán thành công. vnp_TxnRef (Mã tham chiếu): {}", vnpTxnRef);

        return finalUrl;

    }

    /**
     * Xác thực chữ ký từ IPN/Return URL của VNPAY
     * Trả về true nếu hợp lệ
     */
    public boolean verifySignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        String txnRef = params.get("vnp_TxnRef");
        if (receivedHash == null) {
            log.error("Xác thực thất bại: Không tìm thấy vnp_SecureHash trong phản hồi từ VNPAY.");
            return false;
        };

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
        boolean isValid = expectedHash.equalsIgnoreCase(receivedHash);
        if (isValid) {
            log.info("Xác thực chữ ký VNPAY thành công cho giao dịch: {}",txnRef);
        }else {
            log.error("CẢNH BÁO : Xác thực chữ ký VNPAY thất bại cho giao dịch: {}.Có thể có dấu hiệu giả mạo tham số!",txnRef);
            log.debug("Dữ liệu đã nhận được: {}", params);
        }
        return isValid;
    }

    /**
     * Kiểm tra giao dịch thành công từ VNPAY
     */
    public boolean isSuccess(Map<String, String> params) {
        boolean success = "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));

        if (success) {
            log.info("Giao dịch VNPAY [{}] được xác nhận là THÀNH CÔNG (00).", params.get("vnp_TxnRef"));
        } else {
            log.warn("Giao dịch VNPAY [{}] THẤT BẠI hoặc bị hủy. ResponseCode: {}, Status: {}",
                    params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"), params.get("vnp_TransactionStatus"));
        }

        return success;
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
            log.error("Lỗi mã hóa HMAC SHA512: {}", e.getMessage());
            throw new RuntimeException("Lỗi mã hóa HMAC SHA512", e);
        }
    }
}
