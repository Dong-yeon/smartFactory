package com.smartFactory.mes.master.controller;

import com.smartFactory.mes.master.dto.EnumResponse;
import com.smartFactory.mes.master.enums.UnitType;
import com.smartFactory.mes.master.dto.ItemRequest;
import com.smartFactory.mes.master.dto.ItemResponse;
import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/master/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService itemService;

    @PostMapping
    public ItemResponse createItem(@RequestBody ItemRequest request) {
        return itemService.createItem(request);
    }

    @PutMapping("/{id}")
    public ItemResponse updateItem(@PathVariable Long id, @RequestBody ItemRequest request) {
        return itemService.updateItem(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
    }

    @GetMapping("/{id}")
    public ItemResponse getItem(@PathVariable Long id) {
        return itemService.getItem(id);
    }

    @GetMapping
    public Page<ItemResponse> getItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String itemCode,
            @RequestParam(required = false) String itemName,
            @RequestParam(required = false) Boolean isActive
    ) {
        return itemService.getItems(page, size, itemCode, itemName, isActive);
    }

    @GetMapping("/types")
    public List<EnumResponse> getItemTypes() {
        return Arrays.stream(ItemType.values())
                .map(type -> new EnumResponse(type.name(), type.getKorName()))
                .toList();
    }

    @GetMapping("/units")
    public List<EnumResponse> getItemUnits() {
        return Arrays.stream(UnitType.values())
                .map(type -> new EnumResponse(type.name(), type.name()))
                .toList();
    }
}
