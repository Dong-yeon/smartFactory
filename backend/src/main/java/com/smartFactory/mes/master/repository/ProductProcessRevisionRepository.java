package com.smartFactory.mes.master.repository;

import com.smartFactory.mes.master.domain.ProductProcessRevision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductProcessRevisionRepository extends JpaRepository<ProductProcessRevision, Long> {
	List<ProductProcessRevision> findByItem_Id(Long itemId);
}
