package com.smartFactory.mes.master.domain;

import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.enums.UnitType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "item", uniqueConstraints = @UniqueConstraint(columnNames = "itemCode"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String itemCode; // 품목코드

    @Column(nullable = false, length = 100)
    private String itemName; // 품목명

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemType itemType; // 품목구분(원자재/반제품/완제품/부자재 등)

    @Column(length = 100)
    private String spec; // 규격/모델

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private UnitType unit; // 단위(EA, KG 등)

    @Column
    private Integer safetyStock; // 안전재고

    @Column(nullable = false)
    private Boolean isActive = true; // 사용여부

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
