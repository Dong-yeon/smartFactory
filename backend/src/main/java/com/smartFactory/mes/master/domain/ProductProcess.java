package com.smartFactory.mes.master.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_process")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String processCode;

    @Column(nullable = false)
    private String processName;

    private String description;

    // 필요시 Product와의 연관관계 추가 가능
}
