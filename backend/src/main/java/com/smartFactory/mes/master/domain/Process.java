package com.smartFactory.mes.master.domain;

import com.smartFactory.mes.master.enums.ProcessType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "process", uniqueConstraints = @UniqueConstraint(columnNames = "processCode"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Process {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "process_code", nullable = false, length = 50)
	private String processCode;

	@Column(name = "process_name", nullable = false, length = 50)
	private String processName;

	@Enumerated(EnumType.STRING)
	@Column(name = "process_type", nullable = false, length = 50)
	private ProcessType processType;

	@Column(name = "process_order")
	private int processOrder;

	@Column(nullable = false)
	private Boolean isActive = true; // 사용여부

	@CreatedDate
	@Column(updatable = false)
	private LocalDateTime createdAt;

	@LastModifiedDate
	private LocalDateTime updatedAt;
}
