package com.smartFactory.mes.production.repository;

import com.smartFactory.mes.production.domain.ProductionOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long>, JpaSpecificationExecutor<ProductionOrder> {
	@Query("SELECT o FROM ProductionOrder o JOIN FETCH o.item WHERE o.id = :id")
	Optional<ProductionOrder> findByIdWithProduct(Long id);

	@EntityGraph(attributePaths = {"item"})
	Page<ProductionOrder> findAll(Pageable pageable);
}
