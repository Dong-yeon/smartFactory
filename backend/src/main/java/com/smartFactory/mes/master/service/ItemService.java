package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.dto.ItemRequest;
import com.smartFactory.mes.master.dto.ItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ItemService {
    ItemResponse createItem(ItemRequest request);
    ItemResponse updateItem(Long id, ItemRequest request);
    void deleteItem(Long id);
    ItemResponse getItem(Long id);
    Page<ItemResponse> getItems(int page, int size, String itemCode, String itemName, Boolean isActive);
}
