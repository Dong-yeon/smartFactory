package com.smartFactory.mes.master.dto;

import lombok.Data;

@Data
public class ProductProcessRequest {
    private Long id;
    private Long itemId; // 제품 ID
    private Long processId; // 공정 ID
    private String processCode;
    private String processName;
    private Long parentId; // 상위 ProductProcess ID (트리구조)
    private Integer processOrder; // 제품 내 공정 순서
    private Integer processTime;
    private Boolean isActive = true;
}
