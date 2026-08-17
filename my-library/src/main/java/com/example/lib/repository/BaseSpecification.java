package com.example.lib.repository;

import com.example.lib.model.entity.BaseEntity;
import jakarta.annotation.Nonnull;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Lớp sinh câu truy vấn SQL động (WHERE clause) dựa trên Map query parameters từ Client gửi lên.
 * E: Đối tượng Entity kế thừa từ BaseEntity.
 */
public class BaseSpecification<E extends BaseEntity<?>> implements Specification<E> {

    private final Map<String, String> filters;
    public boolean isFilterDelete = false;

    public BaseSpecification(Map<String, String> filters) {
        this.filters = filters;
    }

    @Override
    public Predicate toPredicate(@Nonnull Root<E> root, @Nonnull CriteriaQuery<?> query, @Nonnull CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();
        addConditions(predicates, root, cb);
        return cb.and(predicates.toArray(new Predicate[0]));
    }

    private void addConditions(List<Predicate> predicates, Root<E> root, CriteriaBuilder cb) {
        for (Map.Entry<String, String> entry : filters.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            // Nếu thực thể không có thuộc tính này thì bỏ qua
            if (!hasField(root, key)) continue;

            Path<?> path = root.get(key);
            Class<?> type = path.getJavaType();

            if (!StringUtils.hasText(value) && type != Instant.class) {
                continue;
            }

            try {
                if (type == String.class) {
                    if (key.toLowerCase().contains("id")) {
                        // Nếu là trường ID dạng UUID (32 ký tự trở lên)
                        if (value.length() >= 32) {
                            predicates.add(cb.equal(root.get(key), value));
                        } else {
                            predicates.add(cb.like(cb.lower(root.get(key)), "%" + value.toLowerCase() + "%"));
                        }
                    } else if (key.toLowerCase().contains("name") || key.toLowerCase().contains("code")) {
                        // Nếu tìm kiếm theo tên hoặc mã, hỗ trợ tìm kiếm gần đúng (like %value%)
                        predicates.add(cb.like(cb.lower(root.get(key)), "%" + value.toLowerCase() + "%"));
                    } else {
                        // Hỗ trợ tìm kiếm theo danh sách ngăn cách bởi dấu | (Ví dụ: status=ACTIVE|INACTIVE)
                        if (value.contains("|")) {
                            CriteriaBuilder.In<String> inClause = cb.in(root.get(key));
                            for (String item : value.split("\\|")) {
                                inClause.value(item);
                            }
                            predicates.add(inClause);
                        } else {
                            predicates.add(cb.equal(root.get(key), value));
                        }
                    }
                } else if (type == Integer.class) {
                    predicates.add(cb.equal(root.get(key), Integer.parseInt(value)));
                } else if (type == Long.class) {
                    predicates.add(cb.equal(root.get(key), Long.parseLong(value)));
                } else if (type == Boolean.class) {
                    predicates.add(cb.equal(root.get(key), Boolean.parseBoolean(value)));
                } else if (type == LocalDate.class) {
                    predicates.add(cb.equal(root.get(key), LocalDate.parse(value)));
                }
            } catch (Exception e) {
                // Bỏ qua nếu dữ liệu không parse đúng kiểu dữ liệu cột
                System.out.printf("Invalid filter value for key [%s]: %s%n", key, e.getMessage());
            }
        }

        // Tự động thêm điều kiện lọc các bản ghi đã xóa hay chưa
        if (isFilterDelete) {
            predicates.add(cb.isNotNull(root.get("deletedAt"))); // Lấy các bản ghi đã xóa
        } else {
            predicates.add(cb.isNull(root.get("deletedAt"))); // Chỉ lấy các bản ghi chưa bị xóa mềm
        }
    }

    private boolean hasField(Root<E> root, String fieldName) {
        try {
            root.get(fieldName);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}