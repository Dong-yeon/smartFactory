package com.smartFactory.mes.master.repository;

import com.smartFactory.mes.master.domain.Bom;
import com.smartFactory.mes.master.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BomRepository extends JpaRepository<Bom, Long> {
    // 계층 구조 관련 메소드들
    @Query("SELECT b FROM Bom b WHERE b.parentItem.itemCode = :itemCode ORDER BY b.path")
    List<Bom> findRootBomsByItemCode(@Param("itemCode") String itemCode);

    @Query("SELECT b FROM Bom b WHERE b.parentItem.id = :parentId ORDER BY b.path")
    List<Bom> findChildBomsByParentId(@Param("parentId") Long parentId);

    @Query("SELECT b FROM Bom b WHERE b.path LIKE :pathPattern ORDER BY b.path")
    List<Bom> findBomsByPathPattern(@Param("pathPattern") String pathPattern);

    @Query("SELECT b FROM Bom b WHERE b.parentItem.itemCode = :itemCode AND b.isActive = true ORDER BY b.path")
    List<Bom> findActiveRootBomsByItemCode(@Param("itemCode") String itemCode);

    // 계층 경로로 BOM 조회
    Optional<Bom> findByPath(String path);

    // 계층 레벨로 BOM 조회
    List<Bom> findByLevel(Integer level);

    // 계층 경로로 하위 BOM들 조회
    @Query("SELECT b FROM Bom b WHERE b.path LIKE :pathPattern AND b.isActive = true ORDER BY b.path")
    List<Bom> findActiveChildBomsByPath(@Param("pathPattern") String pathPattern);
}
