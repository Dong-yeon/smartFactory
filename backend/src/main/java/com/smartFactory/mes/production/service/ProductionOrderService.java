package com.smartFactory.mes.production.service;

import com.smartFactory.mes.production.dto.ProductionOrderRequest;
import com.smartFactory.mes.production.dto.ProductionOrderResponse;
import org.springframework.data.domain.Page;

public interface ProductionOrderService {

    ProductionOrderResponse createOrder(ProductionOrderRequest request);

    Page<ProductionOrderResponse> getAllOrders(
        int page,
        int size,
        String orderNumber,
        String itemCode,
        String status
    );

    ProductionOrderResponse getOrder(Long id);

    ProductionOrderResponse updateOrderStatus(Long id, String status);
}
