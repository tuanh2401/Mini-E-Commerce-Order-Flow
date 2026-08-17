package com.example.lib.service;

import com.example.lib.config.minio.MinioConfig;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import io.minio.RemoveObjectArgs;
import java.io.InputStream;
import java.util.UUID;
@RequiredArgsConstructor
@Slf4j
//Dịch vụ đẩy file và xóa file trên MinIO
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    /**
     * Tự động kiểm tra, tạo bucket và cấu hình quyền Public Read khi ứng dụng khởi chạy
     */
    @PostConstruct
    public void initBucket() {
        try {
            String bucketName = minioConfig.getBucketName();

            // 1. Kiểm tra tồn tại
            boolean bucketExist = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExist) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Đã tạo tự động bucket [{}] do chưa tồn tại.", bucketName);
            }

            // 2. Luôn luôn cập nhật policy để đảm bảo chắc chắn bucket ở trạng thái Public Read
            String policy = "{\n" +
                    "  \"Version\": \"2012-10-17\",\n" +
                    "  \"Statement\": [\n" +
                    "    {\n" +
                    "      \"Effect\": \"Allow\",\n" +
                    "      \"Principal\": \"*\",\n" +
                    "      \"Action\": [\"s3:GetObject\"],\n" +
                    "      \"Resource\": [\"arn:aws:s3:::" + bucketName + "/*\"]\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build());
            log.info("Đã cấu hình quyền Public Read cho bucket [{}] thành công.", bucketName);

        } catch (Exception e) {
            log.error("Lỗi khởi tạo bucket MinIO lúc startup: ", e);
        }
    }

    /**
     * Chỉ thực hiện upload file lên MinIO và trả về URL
     */
    public String uploadFile(MultipartFile file, String folderName) {
        try {
            String bucketName = minioConfig.getBucketName();

            // 1. Tạo tên file ngẫu nhiên bằng UUID (sử dụng extension đã có sẵn dấu chấm)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            // Không cộng thêm dấu "." ở đây nữa để tránh bị lỗi file..jpg
            String fileName = folderName + "/" + UUID.randomUUID().toString() + extension;

            // 2. Đẩy Stream lên MinIO
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(fileName)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build()
                );
            }

            // 3. Trả về URL
            String fileUrl = minioConfig.getUrl() + "/" + bucketName + "/" + fileName;
            log.info("Upload file thành công. URL: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("Đã có lỗi xảy ra trong quá trình upload file: ", e);
            throw new RuntimeException("Upload file thất bại: " + e.getMessage());
        }
    }
    public void deleteFile(String fileUrl) {
        //Kt nếu fileUrl trống hoặc null thì dừng lại
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        try {
            String bucketName = minioConfig.getBucketName();
            //tạo tiền tố url cần loại bỏ
            String prefix = minioConfig.getUrl() + "/" + bucketName + "/";
            //Nếu url file bắt đầu bằng tiền tố của đúng bucket hiện tại
            if (!fileUrl.startsWith(prefix)) {
                //Cắt bỏ tiền tố để lấy objectName thực tế(ví dụ: avatars/abc.jpg)
                String objectName = fileUrl.substring(prefix.length());
                //Xóa obj trên minio
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .build()
                );
                log.info("Xóa file thành công trên MinIO. Object: [{}]", objectName);
            } else {
                log.warn("URL file [{}] không thuộc cấu hình bucket [{}], bỏ qua xóa.", fileUrl, bucketName);
            }
        } catch (Exception e) {
            log.error("Đã xảy ra lỗi khi xóa file trên MinIO.");
        }
    }
}