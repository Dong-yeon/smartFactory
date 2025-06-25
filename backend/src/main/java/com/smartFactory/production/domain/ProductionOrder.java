package com.smartFactory.production.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production_orders")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductionOrder {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String orderNumber;          // 주문 번호
    private String productCode;          // 제품 코드
    private int quantity;                // 주문 수량
    private LocalDateTime orderDate;     // 주문 일시
    private LocalDateTime dueDate;       // 납기 일시
    private String status;               // 상태 (대기중, 진행중, 완료, 취소)
    
    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkOrder> workOrders = new ArrayList<>();
    
    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
        this.status = this.status == null ? "대기중" : this.status;
    }
    
    // Factory method to create a new ProductionOrder
    public static ProductionOrder createOrder(String productCode, int quantity, LocalDateTime dueDate) {
        ProductionOrder order = new ProductionOrder();
        order.setProductCode(productCode);
        order.setQuantity(quantity);
        order.setDueDate(dueDate);
        return order;
    }
}
