package com.smartFactory.mes.production.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "생산 주문 생성 요청 DTO")
public class ProductionOrderRequest {
    @Schema(description = "제품 코드", example = "P-001", required = true)
    private String productCode;
    @Schema(description = "주문 수량", example = "100", required = true)
    private int quantity;
    @Schema(description = "납기 일시", example = "2025-07-31 23:59", required = true)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime dueDate;
    @Schema(description = "비고", example = "긴급 주문")
    private String remarks;
}
