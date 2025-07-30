package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.domain.ProductProcessRevision;
import com.smartFactory.mes.master.dto.ItemResponse;
import com.smartFactory.mes.master.dto.ProductProcessRevisionResponse;
import com.smartFactory.mes.master.repository.ProductProcessRevisionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductProcessRevisionServiceImpl implements ProductProcessRevisionService {

	private final ProductProcessRevisionRepository productProcessRevisionRepository;

	@Override
	public List<ProductProcessRevisionResponse> getProductProcessRevisions(Long id) {
		return productProcessRevisionRepository.findByItem_Id(id).stream().map(ProductProcessRevisionResponse::new).toList();
	}
}
