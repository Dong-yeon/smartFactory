package com.smartFactory.mes.master.dto;

import lombok.Data;

import java.util.List;

@Data
public class BomTreeDto {
    private Long id;
    private String parentItemId;      // 상위 품목 ID
    private String childItemId;       // 하위 품목 ID
    private String childName;       // 하위 품목명
    private Double quantity;        // 수량
    private Integer level;          // 계층 레벨
    private String path;            // 계층 경로
    private Boolean isActive;       // 사용 여부
}
