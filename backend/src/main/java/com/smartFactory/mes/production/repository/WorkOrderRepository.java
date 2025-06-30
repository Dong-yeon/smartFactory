package com.smartFactory.mes.production.repository;

import com.smartFactory.mes.production.domain.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
}
