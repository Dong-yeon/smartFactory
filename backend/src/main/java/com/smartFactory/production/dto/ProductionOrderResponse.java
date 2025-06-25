package com.smartFactory.production.dto;

import com.smartFactory.production.domain.ProductionOrder;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Schema(description = "생산 주문 응답 DTO")
public class ProductionOrderResponse {
    @Schema(description = "주문 ID", example = "1")
    private Long id;
    @Schema(description = "주문 번호", example = "PO-20250624-12345")
    private String orderNumber;
    @Schema(description = "제품 코드", example = "P-001")
    private String productCode;
    @Schema(description = "주문 수량", example = "100")
    private int quantity;
    @Schema(description = "주문 일시", example = "2025-06-24T16:30:45")
    private LocalDateTime orderDate;
    @Schema(description = "납기 일시", example = "2025-07-31T23:59:59")
    private LocalDateTime dueDate;
    @Schema(description = "주문 상태", example = "대기중", allowableValues = {"대기중", "진행중", "완료", "취소"})
    private String status;
    
    public ProductionOrderResponse(ProductionOrder order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.productCode = order.getProductCode();
        this.quantity = order.getQuantity();
        this.orderDate = order.getOrderDate();
        this.dueDate = order.getDueDate();
        this.status = order.getStatus();
    }
}
