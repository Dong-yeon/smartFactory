package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.domain.Item;
import com.smartFactory.mes.master.dto.ItemRequest;
import com.smartFactory.mes.master.dto.ItemResponse;
import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.*;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {
    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public ItemResponse createItem(ItemRequest request) {
        Item item = Item.builder()
                .itemCode(request.getItemCode())
                .itemName(request.getItemName())
                .itemType(request.getItemType())
                .spec(request.getSpec())
                .unit(request.getUnit())
                .safetyStock(request.getSafetyStock())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return new ItemResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    public ItemResponse updateItem(Long id, ItemRequest request) {
        Item item = itemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        item = Item.builder()
                .id(item.getId())
                .itemCode(request.getItemCode())
                .itemName(request.getItemName())
                .itemType(request.getItemType())
                .spec(request.getSpec())
                .unit(request.getUnit())
                .safetyStock(request.getSafetyStock())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(item.getCreatedAt())
                .build();
        return new ItemResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        itemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItem(Long id) {
        return itemRepository.findById(id).map(ItemResponse::new)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getItems(int page, int size, String itemCode, String itemName, Boolean isActive) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return itemRepository.findAll((root, query, cb) -> {
            Predicate p = cb.conjunction();
            if (itemCode != null && !itemCode.isEmpty()) {
                p = cb.and(p, cb.like(root.get("itemCode"), "%" + itemCode + "%"));
            }
            if (itemName != null && !itemName.isEmpty()) {
                p = cb.and(p, cb.like(root.get("itemName"), "%" + itemName + "%"));
            }
            if (isActive != null) {
                p = cb.and(p, cb.equal(root.get("isActive"), isActive));
            }
            return p;
        }, pageable).map(ItemResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getItems(int page, int size, String itemCode, String itemName, Boolean isActive, ItemType itemType) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return itemRepository.findAll((root, query, cb) -> {
            Predicate p = cb.conjunction();
            if (itemCode != null && !itemCode.isEmpty()) {
                p = cb.and(p, cb.like(root.get("itemCode"), "%" + itemCode + "%"));
            }
            if (itemName != null && !itemName.isEmpty()) {
                p = cb.and(p, cb.like(root.get("itemName"), "%" + itemName + "%"));
            }
            if (isActive != null) {
                p = cb.and(p, cb.equal(root.get("isActive"), isActive));
            }
            if (itemType != null) {
                p = cb.and(p, cb.equal(root.get("itemType"), itemType));
            }
            return p;
        }, pageable).map(ItemResponse::new);
    }
}
