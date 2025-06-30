package com.smartFactory.mes.production.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class WorkOrderRequest {
    private Long productionOrderId;
    private String equipmentId;
    private int plannedQuantity;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime plannedStartTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime plannedEndTime;
}
