package com.smartFactory.mes.master.dto;

import com.smartFactory.mes.master.domain.Item;
import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.enums.UnitType;
import lombok.Getter;

@Getter
public class ItemResponse {
    private final Long id;
    private final String itemCode;
    private final String itemName;
    private final ItemType itemType;
    private final String spec;
    private final UnitType unit;
    private final Integer safetyStock;
    private final Boolean isActive;

    public ItemResponse(Item item) {
        this.id = item.getId();
        this.itemCode = item.getItemCode();
        this.itemName = item.getItemName();
        this.itemType = item.getItemType();
        this.spec = item.getSpec();
        this.unit = item.getUnit();
        this.safetyStock = item.getSafetyStock();
        this.isActive = item.getIsActive();
    }
}
