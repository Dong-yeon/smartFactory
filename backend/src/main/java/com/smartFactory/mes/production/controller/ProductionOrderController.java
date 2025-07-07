package com.smartFactory.mes.production.controller;

import com.smartFactory.mes.production.dto.ProductionOrderRequest;
import com.smartFactory.mes.production.dto.ProductionOrderResponse;
import com.smartFactory.mes.production.service.ProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/production/plans")
@RequiredArgsConstructor
@Tag(name = "Production Order", description = "생산 주문 관리 API")
public class ProductionOrderController {
    private final ProductionOrderService productionOrderService;

    @Operation(summary = "생산 주문 생성", description = "새로운 생산 주문을 생성합니다.")
    @PostMapping
    public ResponseEntity<ProductionOrderResponse> createOrder(@RequestBody ProductionOrderRequest request) {
        return ResponseEntity.ok(productionOrderService.createOrder(request));
    }

    @GetMapping
    public ResponseEntity<Page<ProductionOrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) String itemCode,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(productionOrderService.getAllOrders(
                page, size, orderNumber, itemCode, status
        ));
    }

    @Operation(summary = "생산 주문 상세 조회", description = "지정된 ID의 생산 주문을 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ProductionOrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(productionOrderService.getOrder(id));
    }

    @Operation(summary = "생산 주문 상태 업데이트", description = "지정된 ID의 생산 주문 상태를 업데이트합니다.")
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        productionOrderService.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
