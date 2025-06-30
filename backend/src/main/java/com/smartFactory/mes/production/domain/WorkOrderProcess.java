package com.smartFactory.mes.production.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_order_processes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrderProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_no", length = 50)
    private String processNo;  // 공정 번호 (예: "A1", "A2", "B1")


    @Column(name = "process_order")
    private int processOrder;  // 공정 실행 순서

/*    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_process_id")
    private ProductProcess productProcess;*/

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private WorkOrderProcess parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("processOrder ASC")
    private List<WorkOrderProcess> subProcesses = new ArrayList<>();

    @Column(length = 20)
    private String status;  // 상태 (대기중, 진행중, 완료, 보류)


    @Column(name = "start_time")
    private LocalDateTime startTime; // 시작 시간

    @Column(name = "end_time")
    private LocalDateTime endTime;   // 완료 시간

    @Column(columnDefinition = "TEXT")
    private String remarks;  // 비고

    @OneToMany(mappedBy = "workOrderProcess", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkOrderProcessHistory> histories = new ArrayList<>();

    @Builder
    public WorkOrderProcess(String processNo, int processOrder,
                            WorkOrder workOrder,
                            WorkOrderProcess parent, String status) {
        this.processNo = processNo;
        this.processOrder = processOrder;
        this.workOrder = workOrder;
        this.parent = parent;
        this.status = status;
    }

    // 비즈니스 메서드
    public void start(String userId) {
        this.status = "진행중";
        this.startTime = LocalDateTime.now();
        addHistory("진행중", userId);
    }

    public void complete(String userId) {
        this.status = "완료";
        this.endTime = LocalDateTime.now();
        addHistory("완료", userId);
    }

    public void hold(String reason, String userId) {
        this.status = "보류";
        this.remarks = reason;
        addHistory("보류: " + reason, userId);
    }

    public void resume(String userId) {
        this.status = "진행중";
        addHistory("재개", userId);
    }

    private void addHistory(String action, String userId) {
        WorkOrderProcessHistory history = WorkOrderProcessHistory.builder()
                .workOrderProcess(this)
                .status(this.status)
                .action(action)
                .actionBy(userId)
                .actionAt(LocalDateTime.now())
                .build();
        this.histories.add(history);
    }

    public boolean areAllSubProcessesCompleted() {
        if (this.subProcesses == null || this.subProcesses.isEmpty()) {
            return "완료".equals(this.status);
        }
        return this.subProcesses.stream().allMatch(WorkOrderProcess::areAllSubProcessesCompleted);
    }
}
