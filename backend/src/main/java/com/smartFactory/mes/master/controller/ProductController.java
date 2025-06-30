package com.smartFactory.mes.master.controller;

import com.smartFactory.mes.master.dto.ItemResponse;
import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/master/products")
@RequiredArgsConstructor
public class ProductController {
    private final ItemService itemService;

    @GetMapping
    public Page<ItemResponse> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String itemCode,
            @RequestParam(required = false) String itemName,
            @RequestParam(required = false) Boolean isActive
    ) {
        return itemService.getItems(page, size, itemCode, itemName, isActive, ItemType.FINISHED_PRODUCT);
    }
}
