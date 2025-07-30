package com.smartFactory.mes.master.dto;

import com.smartFactory.mes.master.domain.ProductProcessRevision;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcessRevisionResponse {
    private Long id;
    private Long itemId;
    private Integer revisionNo;
    private String changeReason;
    private String changedBy;
    private LocalDateTime changedAt;
    private String snapshotJson;

    public ProductProcessRevisionResponse(ProductProcessRevision revision) {
        this.id = revision.getId();
        this.itemId = revision.getItem().getId();
        this.revisionNo = revision.getRevisionNo();
        this.changeReason = revision.getChangeReason();
        this.changedBy = revision.getChangedBy();
        this.changedAt = revision.getChangedAt();
        this.snapshotJson = revision.getSnapshotJson();
    }
}
