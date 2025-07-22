package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.domain.Process;
import com.smartFactory.mes.master.dto.ProcessRequest;
import com.smartFactory.mes.master.dto.ProcessResponse;
import com.smartFactory.mes.master.repository.ProcessRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProcessServiceImpl implements ProcessService {
    private final ProcessRepository processRepository;

    @Override
    @Transactional
    public ProcessResponse createProcess(ProcessRequest request) {
        Process process = Process.builder()
                .processCode(request.getProcessCode())
                .processName(request.getProcessName())
                .processType(request.getProcessType())
                .processOrder(request.getProcessOrder())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        Process saved = processRepository.save(process);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProcessResponse updateProcess(Long processId, ProcessRequest request) {
        Process process = processRepository.findById(processId)
                .orElseThrow(() -> new IllegalArgumentException("Process not found: " + processId));
        process = Process.builder()
                .id(process.getId())
                .processCode(request.getProcessCode())
                .processName(request.getProcessName())
                .processType(request.getProcessType())
                .processOrder(request.getProcessOrder())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        Process saved = processRepository.save(process);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProcess(Long id) {
        processRepository.deleteById(id);
    }

    @Override
    public ProcessResponse getProcess(Long id) {
        Process process = processRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Process not found: " + id));
        return toResponse(process);
    }

    @Override
    public Page<ProcessResponse> getProcesses(int page, int size, String processCode, String processName, Boolean isActive) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<Process> spec = (root, query, cb) -> {
            var predicates = cb.conjunction();
            if (processCode != null && !processCode.isEmpty()) {
                predicates = cb.and(predicates, cb.like(root.get("processCode"), "%" + processCode + "%"));
            }
            if (processName != null && !processName.isEmpty()) {
                predicates = cb.and(predicates, cb.like(root.get("processName"), "%" + processName + "%"));
            }
            if (isActive != null) {
                predicates = cb.and(predicates, cb.equal(root.get("isActive"), isActive));
            }
            return predicates;
        };
        return processRepository.findAll(spec, pageable).map(this::toResponse);
    }

    private ProcessResponse toResponse(Process process) {
        ProcessResponse res = new ProcessResponse();
        res.setId(process.getId());
        res.setProcessCode(process.getProcessCode());
        res.setProcessName(process.getProcessName());
        res.setProcessType(process.getProcessType());
        res.setProcessOrder(process.getProcessOrder());
        res.setIsActive(process.getIsActive());
        res.setCreatedAt(process.getCreatedAt());
        res.setUpdatedAt(process.getUpdatedAt());
        return res;
    }
}
