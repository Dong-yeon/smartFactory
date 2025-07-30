package com.smartFactory.mes.master.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "product_process_revision")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductProcessRevision {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// 제품 (Item) FK
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "item_id", nullable = false)
	private Item item;

	// 리비전 번호
	@Column(name = "revision_no", nullable = false)
	private Integer revisionNo;

	// 변경 사유
	@Column(name = "change_reason")
	private String changeReason;

	// 변경자
	@Column(name = "changed_by")
	private String changedBy;

	// 변경 일시
	@CreatedDate
	@Column(updatable = false)
	private LocalDateTime changedAt;

	// 스냅샷(해당 리비전의 표준공정 전체 JSON 등)
	@Lob
	@Column(name = "snapshot_json", columnDefinition = "TEXT")
	private String snapshotJson;
}
