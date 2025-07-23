package com.smartFactory.mes.master.dto;

import com.smartFactory.mes.master.enums.ProcessType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ProcessResponse {
	private Long id;
	private String processCode;
	private String processName;
	private ProcessType processType;
	private Integer processOrder;
	private Boolean isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
