package com.example.lib.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailVerificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;
    //dchi email nhận
    private String email;
    //tên username để cá nhân hóa (vd chào ...)
    private String username;
    //mã xác thực 6 số vừa sinh ra
    private String verificationToken;
    //thời gian hết hạn của mã để thông báo cho người dùng
    private LocalDateTime expiryTime;
}
