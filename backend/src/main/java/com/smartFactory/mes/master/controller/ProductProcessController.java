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
    public List<ProductProcessResponse> create(@RequestBody List<ProductProcessRequest> requestList) {
        return productProcessService.createProductProcesses(requestList);
    }

    @GetMapping
    public List<ProductProcessResponse> getByItemId(@RequestParam Long itemId) {
        return productProcessService.getProductProcessTreeByItem(itemId);
    }
}
