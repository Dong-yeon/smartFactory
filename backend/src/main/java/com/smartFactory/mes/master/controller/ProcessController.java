package com.smartFactory.mes.master.controller;

import com.smartFactory.mes.master.dto.EnumResponse;
import com.smartFactory.mes.master.dto.ProcessRequest;
import com.smartFactory.mes.master.dto.ProcessResponse;
import com.smartFactory.mes.master.enums.ProcessType;
import com.smartFactory.mes.master.service.ProcessService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/master/process")
@RequiredArgsConstructor
public class ProcessController {
	private final ProcessService processService;

	@PostMapping
	public ProcessResponse createProcess(@RequestBody ProcessRequest request) {
		return processService.createProcess(request);
	}

	@PutMapping("/{id}")
	public ProcessResponse updateProcess(@PathVariable Long id, @RequestBody ProcessRequest request) {
		return processService.updateProcess(id, request);
	}

	@DeleteMapping("/{id}")
	public void deleteProcess(@PathVariable Long id) {
		processService.deleteProcess(id);
	}

	@GetMapping("/{id}")
	public ProcessResponse getProcess(@PathVariable Long id) {
		return processService.getProcess(id);
	}

	@GetMapping("/all")
	public List<ProcessResponse> getProcessAll() {
		return processService.getProcessAll();
	}

	@GetMapping
	public Page<ProcessResponse> getProcesses(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String processCode,
			@RequestParam(required = false) String processName,
			@RequestParam(required = false) Boolean isActive
	) {
		return processService.getProcesses(page, size, processCode, processName, isActive);
	}

	@GetMapping("/types")
	public List<EnumResponse> getItemTypes() {
		return Arrays.stream(ProcessType.values())
				.map(type -> new EnumResponse(type.name(), type.getKorName()))
				.toList();
	}
}
