package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.domain.Item;
import com.smartFactory.mes.master.domain.Process;
import com.smartFactory.mes.master.domain.ProductProcess;
import com.smartFactory.mes.master.dto.ProductProcessRequest;
import com.smartFactory.mes.master.dto.ProductProcessResponse;
import com.smartFactory.mes.master.repository.ItemRepository;
import com.smartFactory.mes.master.repository.ProcessRepository;
import com.smartFactory.mes.master.repository.ProductProcessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductProcessServiceImpl implements ProductProcessService {
	private final ProductProcessRepository productProcessRepository;
	private final ItemRepository itemRepository;
	private final ProcessRepository processRepository;

	@Override
	@Transactional
	public List<ProductProcessResponse> createProductProcesses(List<ProductProcessRequest> requestList) {
		List<ProductProcessResponse> responses = new ArrayList<>();
		for (ProductProcessRequest request : requestList) {
			Item item = itemRepository.findById(request.getItemId())
					.orElseThrow(() -> new IllegalArgumentException("Item not found: " + request.getItemId()));
			Process process = processRepository.findByProcessCode(request.getProcessCode())
					.orElseThrow(() -> new IllegalArgumentException("Process not found: " + request.getProcessCode()));
			ProductProcess parent = null;
			if (request.getParentId() != null) {
				parent = productProcessRepository.findById(request.getParentId())
						.orElseThrow(() -> new IllegalArgumentException("Parent ProductProcess not found: " + request.getParentId()));
			}
			ProductProcess productProcess = ProductProcess.builder()
					.item(item)
					.process(process)
					.parent(parent)
					.processCode(request.getProcessCode())
					.processName(request.getProcessName())
					.processOrder(request.getProcessOrder())
					.processTime(request.getProcessTime())
					.isActive(request.getIsActive() != null ? request.getIsActive() : true)
					.build();
			ProductProcess saved = productProcessRepository.save(productProcess);
			responses.add(toResponse(saved));
		}
		return responses;
	}

	@Override
	@Transactional(readOnly = true)
	public List<ProductProcessResponse> getProductProcessTreeByItem(Long itemId) {
		List<ProductProcess> all = productProcessRepository.findAll()
				.stream().filter(pp -> pp.getItem().getId().equals(itemId)).collect(Collectors.toList());
		Map<Long, ProductProcessResponse> map = all.stream().collect(Collectors.toMap(ProductProcess::getId, this::toResponse));
		List<ProductProcessResponse> roots = new ArrayList<>();
		for (ProductProcess pp : all) {
			ProductProcessResponse response = map.get(pp.getId());
			if (pp.getParent() != null) {
				ProductProcessResponse parent = map.get(pp.getParent().getId());
				if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
				// 이미 추가된 자식이 또 추가되지 않도록 체크
				if (!parent.getChildren().contains(response)) {
					parent.getChildren().add(response);
				}
			} else {
				roots.add(response);
			}
		}
		return roots;
	}

	private ProductProcessResponse toResponse(ProductProcess pp) {
		ProductProcessResponse res = new ProductProcessResponse();
		res.setId(pp.getId());
		res.setItemId(pp.getItem().getId());
		res.setItemName(pp.getItem().getItemName());
		res.setProcessId(pp.getProcess().getId());
		res.setProcessCode(pp.getProcess().getProcessCode());
		res.setProcessName(pp.getProcess().getProcessName());
		res.setParentId(pp.getParent() != null ? pp.getParent().getId() : null);
		res.setProcessOrder(pp.getProcessOrder());
		res.setProcessTime(pp.getProcessTime());
		res.setIsActive(pp.getIsActive());
		res.setCreatedAt(pp.getCreatedAt());
		res.setUpdatedAt(pp.getUpdatedAt());
		return res;
	}
}
