package com.smartFactory.mes.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_order_process_histories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrderProcessHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_process_id", nullable = false)
    private WorkOrderProcess workOrderProcess;

    @Column(length = 20, nullable = false)
    private String status;  // 상태 (대기중, 진행중, 완료, 보류)


    @Column(length = 100, nullable = false)
    private String action;  // 수행된 작업 (예: "시작", "완료", "보류: 재고부족")


    @Column(name = "action_by", length = 50, nullable = false)
    private String actionBy;  // 작업자 ID

    @Column(name = "action_at", nullable = false)
    private LocalDateTime actionAt;  // 작업 일시

    @Column(columnDefinition = "TEXT")
    private String remarks;  // 비고

    @Builder
    public WorkOrderProcessHistory(WorkOrderProcess workOrderProcess, String status,
                                 String action, String actionBy, LocalDateTime actionAt, String remarks) {
        this.workOrderProcess = workOrderProcess;
        this.status = status;
        this.action = action;
        this.actionBy = actionBy;
        this.actionAt = actionAt;
        this.remarks = remarks;
    }
}
