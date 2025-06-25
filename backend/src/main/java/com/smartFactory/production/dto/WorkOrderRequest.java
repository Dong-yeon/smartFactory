package com.smartFactory.production.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter 
@Setter
public class WorkOrderRequest {
    private Long productionOrderId;
    private String equipmentId;
    private int plannedQuantity;
    private LocalDateTime plannedStartTime;
    private LocalDateTime plannedEndTime;
}
