package com.smartFactory.mes.master.dto;

import com.smartFactory.mes.master.enums.ProcessType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProcessRequest {
    private String processCode;
	private String processName;
	private ProcessType processType;
	private Integer processOrder;
    private Boolean isActive = true;
}
