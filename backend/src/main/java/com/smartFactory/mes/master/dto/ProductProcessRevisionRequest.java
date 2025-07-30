package com.smartFactory.mes.master.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcessRevisionRequest {
    private Long itemId;
    private Integer revisionNo;
    private String changeReason;
    private String changedBy;
    private String snapshotJson;
}
