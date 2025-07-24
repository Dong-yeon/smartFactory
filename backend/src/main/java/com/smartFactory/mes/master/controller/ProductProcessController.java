package com.smartFactory.mes.master.controller;

import com.smartFactory.mes.master.dto.ProductProcessRequest;
import com.smartFactory.mes.master.dto.ProductProcessResponse;
import com.smartFactory.mes.master.service.ProductProcessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/product-process")
@RequiredArgsConstructor
public class ProductProcessController {
    private final ProductProcessService productProcessService;

    @PostMapping
    public ProductProcessResponse create(@RequestBody ProductProcessRequest request) {
        return productProcessService.createProductProcess(request);
    }

    @PutMapping
    public ProductProcessResponse update(@RequestBody ProductProcessRequest request) {
        return productProcessService.updateProductProcess(request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productProcessService.deleteProductProcess(id);
    }

    @GetMapping("/{id}")
    public ProductProcessResponse get(@PathVariable Long id) {
        return productProcessService.getProductProcess(id);
    }

    @GetMapping("/tree/{itemId}")
    public List<ProductProcessResponse> getTreeByItem(@PathVariable Long itemId) {
        return productProcessService.getProductProcessTreeByItem(itemId);
    }
}
