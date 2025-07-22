package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.domain.Process;
import com.smartFactory.mes.master.dto.ProcessRequest;
import com.smartFactory.mes.master.dto.ProcessResponse;
import com.smartFactory.mes.master.enums.ProcessType;
import org.springframework.data.domain.Page;

import java.util.Optional;

public interface ProcessService {
    ProcessResponse createProcess(ProcessRequest processRequest);
    ProcessResponse updateProcess(Long processId, ProcessRequest processRequest);
    void deleteProcess(Long processId);
    ProcessResponse getProcess(Long processId);
    Page<ProcessResponse> getProcesses(int page, int size, String processCode, String processName, Boolean isActive);
}
