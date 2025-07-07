package com.smartFactory.mes.master.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bom", uniqueConstraints = @UniqueConstraint(columnNames = "bomCode"))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Bom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 상위 품목 (예: 완제품)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_item_id")
    private Item parentItem;

    // 하위 품목 (예: 부품)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_item_id")
    private Item childItem;

    private Double quantity;

    @Column(nullable = false)
    private Boolean isActive = true; // 사용여부

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    // 계층 구조 관련 필드
    // 계층 구조 관련 필드
    @Column(name = "level")
    private Integer level;  // 계층 레벨 (0: 최상위, 1: 1차 하위, 2: 2차 하위 등)

    @Column(name = "path", length = 255)
    private String path;    // 계층 경로 (예: "1.2.3")

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
