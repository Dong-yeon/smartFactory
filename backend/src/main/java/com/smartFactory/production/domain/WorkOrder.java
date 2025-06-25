package com.smartFactory.production.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrder {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String workOrderNumber;      // 작업 지시 번호
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;
    
    private String equipmentId;          // 설비 ID
    private int plannedQuantity;         // 계획 수량
    private int completedQuantity;       // 완료 수량
    private LocalDateTime startTime;     // 시작 시간
    private LocalDateTime endTime;       // 종료 시간
    private String status;               // 상태 (대기중, 진행중, 일시정지, 완료, 취소)
    
    @PrePersist
    public void prePersist() {
        this.status = this.status == null ? "대기중" : this.status;
        this.completedQuantity = 0;
    }
}
