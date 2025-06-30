package com.smartFactory.mes.production.domain;

import com.smartFactory.mes.master.domain.Product;
import lombok.*;
import org.hibernate.annotations.Where;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production_orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "is_deleted = false")
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;          // 주문 번호

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_code", referencedColumnName = "productCode")
    private Product product;             // 제품 참조

    @Column(nullable = false)
    private int quantity;                // 주문 수량

    @Column(name = "order_date", nullable = false, updatable = false)
    private LocalDateTime orderDate;     // 주문 일시

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;       // 납기 일시

    @Column(length = 20, nullable = false)
    private String status;               // 상태 (대기중, 진행중, 완료, 취소)

    @Column(columnDefinition = "TEXT")
    private String remarks;              // 비고

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;     // 삭제 여부 (소프트 삭제용)

    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<WorkOrder> workOrders = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;     // 생성일시

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;     // 수정일시

    @Builder
    public ProductionOrder(String orderNumber, Product product, int quantity,
                           LocalDateTime dueDate, String remarks) {
        this.orderNumber = orderNumber;
        this.product = product;
        this.quantity = quantity;
        this.dueDate = dueDate;
        this.remarks = remarks;
        this.status = "대기중";
        this.orderDate = LocalDateTime.now();
    }

    // 정적 팩토리 메서드
    public static ProductionOrder createOrder(Product product, int quantity, LocalDateTime dueDate, String remarks) {
        return ProductionOrder.builder()
                .orderNumber(null) // 주문번호는 서비스에서 setOrderNumber로 지정
                .product(product)
                .quantity(quantity)
                .dueDate(dueDate)
                .remarks(remarks)
                .build();
    }

    // 비즈니스 메서드
    public void updateStatus(String newStatus) {
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }
        this.status = newStatus.trim();
    }

    public void complete() {
        this.status = "완료";
    }

    public void cancel(String reason) {
        this.status = "취소";
        this.remarks = reason;
    }

    public void delete() {
        this.deleted = true;
    }

    public void addWorkOrder(WorkOrder workOrder) {
        this.workOrders.add(workOrder);
        workOrder.setProductionOrder(this);
    }

    public void removeWorkOrder(WorkOrder workOrder) {
        this.workOrders.remove(workOrder);
        workOrder.setProductionOrder(null);
    }

    // Setter (필요한 경우에만 protected로 제한)
    protected void setProduct(Product product) {
        this.product = product;
    }

    protected void setWorkOrders(List<WorkOrder> workOrders) {
        this.workOrders = workOrders;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
}
