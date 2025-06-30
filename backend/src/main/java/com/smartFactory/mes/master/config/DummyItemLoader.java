package com.smartFactory.mes.master.config;

import com.smartFactory.mes.master.domain.Item;
import com.smartFactory.mes.master.enums.ItemType;
import com.smartFactory.mes.master.enums.UnitType;
import com.smartFactory.mes.master.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Random;

//@Component
@RequiredArgsConstructor
public class DummyItemLoader implements CommandLineRunner {
    private final ItemRepository itemRepository;
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        ItemType[] itemTypes = ItemType.values();
        UnitType[] unitTypes = UnitType.values();
        for (int i = 1; i <= 100; i++) {
            ItemType randomItemType = itemTypes[random.nextInt(itemTypes.length)];
            UnitType randomUnitType = unitTypes[random.nextInt(unitTypes.length)];
            int randomQty = random.nextInt(500) + 1; // 1~500
            int randomSafetyStock = random.nextInt(50) + 1; // 1~50
            Item item = Item.builder()
                .itemCode("TEST_ITEM_" + i)
                .itemName("테스트자재" + i)
                .itemType(randomItemType)
                .spec("규격" + i)
                .unit(randomUnitType)
                .safetyStock(randomSafetyStock)
                .isActive(true)
                .build();
            itemRepository.save(item);
        }
    }
}
