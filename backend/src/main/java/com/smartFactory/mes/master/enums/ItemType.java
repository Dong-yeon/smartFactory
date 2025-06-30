package com.smartFactory.mes.master.enums;

public enum ItemType {
    RAW_MATERIAL("원자재"),
    SEMI_PRODUCT("반제품"),
    FINISHED_PRODUCT("완제품"),
    SUB_MATERIAL("부자재"),
    CONSUMABLE("소모품");

    private final String korName;
    ItemType(String korName) { this.korName = korName; }
    public String getKorName() { return korName; }
}
