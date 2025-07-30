package com.smartFactory.mes.master.controller;

import com.smartFactory.mes.master.dto.ItemResponse;
import com.smartFactory.mes.master.dto.ProductProcessRevisionResponse;
import com.smartFactory.mes.master.service.ProductProcessRevisionService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/product-process-revisions")
@RequiredArgsConstructor
public class ProductProcessRevisionController {
	private final ProductProcessRevisionService productProcessRevisionService;

	@GetMapping("/{itemId}")
	public List<ProductProcessRevisionResponse> getProductProcessRevisions(@PathVariable Long itemId) {
		return productProcessRevisionService.getProductProcessRevisions(itemId);
	}
}
