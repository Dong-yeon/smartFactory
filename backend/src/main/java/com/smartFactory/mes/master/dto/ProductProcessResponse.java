package com.smartFactory.mes.master.dto;

import com.smartFactory.mes.master.domain.Process;
import com.smartFactory.mes.master.domain.Item;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductProcessResponse {
    private Long id;
    private Long itemId;
    private String itemName;
    private Long processId;
    private String processCode;
    private String processName;
    private Long parentId;
    private Integer processOrder;
    private Integer processTime;
    private Integer revisionNo;
    private Boolean isActive;
    private List<ProductProcessResponse> children;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
