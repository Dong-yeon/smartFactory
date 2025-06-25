package com.smartFactory.production.service;

import com.smartFactory.common.exception.ResourceNotFoundException;
import com.smartFactory.production.domain.ProductionOrder;
import com.smartFactory.production.dto.ProductionOrderRequest;
import com.smartFactory.production.dto.ProductionOrderResponse;
import com.smartFactory.production.repository.ProductionOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {
    private final ProductionOrderRepository productionOrderRepository;

    @Transactional
    public ProductionOrderResponse createOrder(ProductionOrderRequest request) {
        ProductionOrder order = ProductionOrder.createOrder(
            request.getProductCode(),
            request.getQuantity(),
            request.getDueDate()
        );
        order.setOrderNumber(generateOrderNumber());

        ProductionOrder savedOrder = productionOrderRepository.save(order);
        return new ProductionOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<ProductionOrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // 페이지네이션 쿼리 실행
        return productionOrderRepository.findAll(pageable)
                .map(ProductionOrderResponse::new);
    }

    @Transactional(readOnly = true)
    public ProductionOrderResponse getOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production order not found with id: " + id));
        return new ProductionOrderResponse(order);
    }

    @Transactional
    public void updateOrderStatus(Long id, String status) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production order not found with id: " + id));
        order.setStatus(status);
    }

    private String generateOrderNumber() {
        // PO-YYYYMMDD-XXXXX 형식의 주문 번호 생성
        return "PO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
               "-" + String.format("%05d", (int)(Math.random() * 100000));
    }
}
