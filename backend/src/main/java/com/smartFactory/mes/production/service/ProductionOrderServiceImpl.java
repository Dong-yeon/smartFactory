package com.smartFactory.mes.production.service;

import com.smartFactory.common.exception.ResourceNotFoundException;
import com.smartFactory.mes.master.domain.Item;
import com.smartFactory.mes.master.repository.ItemRepository;
import com.smartFactory.mes.production.domain.ProductionOrder;
import com.smartFactory.mes.production.dto.ProductionOrderRequest;
import com.smartFactory.mes.production.dto.ProductionOrderResponse;
import com.smartFactory.mes.production.repository.ProductionOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderServiceImpl implements ProductionOrderService {

    private final ProductionOrderRepository productionOrderRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public ProductionOrderResponse createOrder(ProductionOrderRequest request) {
        Item item = itemRepository.findByItemCode(request.getItemCode())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getItemCode()));

        ProductionOrder order = ProductionOrder.createOrder(
            item,
            request.getQuantity(),
            request.getDueDate(),
            request.getRemarks()
        );
        order.setOrderNumber(generateOrderNumber());

        ProductionOrder savedOrder = productionOrderRepository.save(order);
        return new ProductionOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductionOrderResponse> getAllOrders(
            int page,
            int size,
            String orderNumber,
            String productCode,
            String status) {

        Pageable pageable = PageRequest.of(page, size);

        // Specification 생성
        Specification<ProductionOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(orderNumber)) {
                predicates.add(cb.like(root.get("orderNumber"), "%" + orderNumber + "%"));
            }
            if (StringUtils.hasText(productCode)) {
                predicates.add(cb.like(root.get("product").get("productCode"), "%" + productCode + "%"));
            }
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productionOrderRepository.findAll(spec, pageable)
                .map(ProductionOrderResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductionOrderResponse getOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production order not found with id: " + id));
        return new ProductionOrderResponse(order);
    }

    @Override
    @Transactional
    public ProductionOrderResponse updateOrderStatus(Long id, String status) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production order not found with id: " + id));
        order.updateStatus(status);
        return new ProductionOrderResponse(order);
    }

    private String generateOrderNumber() {
        return "PO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
               "-" + String.format("%05d", (int)(Math.random() * 100000));
    }
}
