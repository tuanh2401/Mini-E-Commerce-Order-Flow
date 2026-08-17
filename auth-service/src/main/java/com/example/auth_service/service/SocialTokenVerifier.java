package com.example.auth_service.service;

import com.example.auth_service.dto.response.SocialProfile;
import com.example.lib.model.exception.BusinessException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;


@Component
@Slf4j
public class SocialTokenVerifier {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;
    public SocialProfile verify(String provider, String token) {
        if ("GOOGLE".equalsIgnoreCase(provider)) {
            return verifyGoogle(token);
        } else if ("FACEBOOK".equalsIgnoreCase(provider)) {
            return verifyFacebook(token);
        } else {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "Nhà cung cấp đăng nhập không được hỗ trợ: " + provider, null);
        }
    }

    private SocialProfile verifyGoogle(String token) {
        GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory()
        );

        if (googleClientId != null && !googleClientId.trim().isEmpty()) {
            verifierBuilder.setAudience(Collections.singletonList(googleClientId));
        }

        GoogleIdTokenVerifier verifier = verifierBuilder.build();

        try {
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken == null) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Google Token không hợp lệ!", null);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            return SocialProfile.builder()
                    .socialId(payload.getSubject())
                    .email(payload.getEmail())
                    .fullname((String) payload.get("name"))
                    .build();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi xác thực Google Token: {}", e.getMessage());
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "Lỗi xác thực Google Token: " + e.getMessage(), null);
        }
    }

    private SocialProfile verifyFacebook(String token) {
        String fbUrl = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + token;
        RestTemplate restTemplate = new RestTemplate();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> fbResponse = restTemplate.getForObject(fbUrl, Map.class);

            if (fbResponse == null || fbResponse.containsKey("error")) {
                log.error("Lỗi Facebook response: {}", fbResponse);
                throw new BusinessException(HttpStatus.BAD_REQUEST,
                        "Facebook Token không hợp lệ hoặc đã hết hạn!", null);
            }

            String socialId = (String) fbResponse.get("id");
            String email = (String) fbResponse.get("email");
            String fullname = (String) fbResponse.get("name");

            // Fallback: nếu user ẩn email trên Facebook, dùng email giả lập để không bị null
            if (email == null) {
                email = socialId + "@facebook.com";
                log.warn("Tài khoản Facebook [{}] không chia sẻ email, dùng email giả lập.", socialId);
            }

            return SocialProfile.builder()
                    .socialId(socialId)
                    .email(email)
                    .fullname(fullname)
                    .build();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi xác thực Facebook Token: {}", e.getMessage());
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "Lỗi xác thực Facebook Token: " + e.getMessage(), null);
        }
    }
}
