package com.example.lib.repository;

import com.example.lib.model.entity.BaseEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Transactional
@NoRepositoryBean
public interface BaseRepository<E extends BaseEntity<ID>, ID> extends JpaRepository<E, ID>, JpaSpecificationExecutor<E> {

    // Tìm kiếm thực thể theo id và đảm bảo thực thể đó chưa bị xóa mềm
    @Query("FROM #{#entityName} E where E.id = :id AND E.deletedAt IS NULL")
    Optional<E> findEntityById(@Param("id") ID id);

    // Thường dùng cho các API bảo mật cá nhân (vd: user chỉ lấy order của chính mình)
    @Query("FROM #{#entityName} E where E.id = :id AND E.createdBy = :username AND E.deletedAt IS NULL")
    Optional<E> findEntityById(@Param("id") ID id, @Param("username") String username);

    @Modifying
    @Query("UPDATE #{#entityName} E set E.deletedAt = :deletedAt, E.lastModifiedDate = :now where E.id = :id")
    int softDelete(@Param("id") ID id, @Param("deletedAt") LocalDateTime deletedAt, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE #{#entityName} E set E.deletedAt = :deletedAt, E.lastModifiedDate = :now where E.id in :ids")
    int softDelete(@Param("ids") Iterable<ID> ids, @Param("deletedAt") LocalDateTime deletedAt, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE #{#entityName} E set E.deletedAt = :deletedAt, E.lastModifiedDate = :now where E.createdBy = :username AND E.id = :id")
    int softDeleteCreateBy(@Param("id") ID id, @Param("deletedAt") LocalDateTime deletedAt,
                           @Param("username") String username, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE #{#entityName} E set E.deletedAt = :deletedAt, E.lastModifiedDate = :now where E.createdBy = :username AND E.id in :ids")
    int softDeleteCreateBy(@Param("ids") Iterable<ID> ids, @Param("deletedAt") LocalDateTime deletedAt,
                           @Param("username") String username, @Param("now") LocalDateTime now);

    // Lấy toàn bộ danh sách thực thể đang hoạt động (chưa bị xóa mềm), sắp xếp theo ngày tạo mới nhất.
    @Query("FROM #{#entityName} E WHERE E.deletedAt IS NULL ORDER BY E.createdDate DESC")
    List<E> getAll();

    // Lấy toàn bộ danh sách thực thể đang hoạt động được tạo bởi một User cụ thể, sắp xếp theo ngày tạo mới nhất (Đã sửa AN D -> AND).
    @Query("FROM #{#entityName} E WHERE E.createdBy = :username AND E.deletedAt IS NULL ORDER BY E.createdDate DESC")
    List<E> getAllCreatedBy(@Param("username") String username);

    // Lấy toàn bộ danh sách thực thể ĐÃ BỊ xóa mềm
    @Query("FROM #{#entityName} E WHERE E.deletedAt IS NOT NULL")
    List<E> getAllDeleted();

    // Truy vấn nhanh danh sách thực thể theo danh sách ID truyền vào và đảm bảo chúng chưa bị xóa mềm
    @Query("FROM #{#entityName} E WHERE E.id in :ids AND E.deletedAt IS NULL")
    List<E> getAllByIdIn(@Param("ids") Iterable<ID> ids);
}