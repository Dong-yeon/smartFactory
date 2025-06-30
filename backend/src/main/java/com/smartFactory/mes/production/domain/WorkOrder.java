package com.smartFactory.mes.production.domain;

import lombok.*;
import org.hibernate.annotations.Where;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "is_deleted = false")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "work_order_number", nullable = false, length = 50)
    private String workOrderNumber;  // 작업 지시 번호

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @Column(name = "equipment_id", length = 50)
    private String equipmentId;      // 설비 ID

    @Column(name = "planned_quantity", nullable = false)
    private int plannedQuantity;     // 계획 수량

    @Column(name = "completed_quantity")
    private int completedQuantity;   // 완료 수량

    @Column(name = "start_time")
    private LocalDateTime startTime; // 시작 시간

    @Column(name = "end_time")
    private LocalDateTime endTime;   // 종료 시간

    @Column(length = 20, nullable = false)
    private String status;           // 상태 (대기중, 진행중, 일시정지, 완료, 취소)

    @Column(name = "priority")
    private Integer priority;        // 우선순위 (낮을수록 우선순위 높음)

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false; // 삭제 여부 (소프트 삭제용)

    @Column(columnDefinition = "TEXT")
    private String remarks;          // 비고

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("processOrder ASC")
    private List<WorkOrderProcess> processes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;  // 생성일시

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;  // 수정일시

    @Builder
    public WorkOrder(String workOrderNumber, ProductionOrder productionOrder,
                     String equipmentId, int plannedQuantity,
                     Integer priority, String remarks) {
        this.workOrderNumber = workOrderNumber;
        this.productionOrder = productionOrder;
        this.equipmentId = equipmentId;
        this.plannedQuantity = plannedQuantity;
        this.priority = priority;
        this.remarks = remarks;
        this.status = "대기중";
        this.completedQuantity = 0;
    }

    // 비즈니스 메서드
    public void start() {
        this.status = "진행중";
        this.startTime = LocalDateTime.now();
    }

    public void complete() {
        this.status = "완료";
        this.endTime = LocalDateTime.now();
    }

    public void pause() {
        this.status = "일시정지";
    }

    public void resume() {
        this.status = "진행중";
    }

    public void cancel(String reason) {
        this.status = "취소";
        this.endTime = LocalDateTime.now();
        this.remarks = reason;
    }

    public void delete() {
        this.deleted = true;
    }

    public boolean areAllProcessesCompleted() {
        if (this.processes == null || this.processes.isEmpty()) {
            return false;
        }
        return this.processes.stream()
                .filter(p -> p.getParent() == null) // 최상위 공정만 필터링
                .allMatch(WorkOrderProcess::areAllSubProcessesCompleted);
    }

    protected void setProductionOrder(ProductionOrder productionOrder) {
        this.productionOrder = productionOrder;
    }
}
