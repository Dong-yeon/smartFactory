package com.smartFactory.mes.master.dto;

import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.enums.UnitType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ItemRequest {
    private String itemCode;
    private String itemName;
    private ItemType itemType;
    private String spec;
    private UnitType unit;
    private Integer safetyStock;
    private Boolean isActive;
}
