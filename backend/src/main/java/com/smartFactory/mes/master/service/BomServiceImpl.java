package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.domain.Bom;
import com.smartFactory.mes.master.domain.Item;
import com.smartFactory.mes.master.dto.BomTreeDto;
import com.smartFactory.mes.master.repository.BomRepository;
import com.smartFactory.mes.master.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.*;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class BomServiceImpl implements BomService {
    private final BomRepository bomRepository;
    private final ItemService itemService;

    @Override
    public List<BomTreeDto> getBomTreeByItemCode(String itemCode) {
        return convertToTree(bomRepository.findRootBomsByItemCode(itemCode));
    }

    @Override
    public List<BomTreeDto> getActiveBomTreeByItemCode(String itemCode) {
        return convertToTree(bomRepository.findActiveRootBomsByItemCode(itemCode));
    }

    @Override
    public BomTreeDto createBom(BomTreeDto bomDto) {
        // 상위 품목 조회
        Item parentItem = itemService.findByItemCode(bomDto.getParentItemId())
                .orElseThrow(() -> new RuntimeException("상위 품목을 찾을 수 없습니다."));

        // 하위 품목 조회
        Item childItem = itemService.findByItemCode(bomDto.getChildItemId())
                .orElseThrow(() -> new RuntimeException("하위 품목을 찾을 수 없습니다."));

        Bom bom = Bom.builder()
                .parentItem(parentItem)
                .childItem(childItem)
                .quantity(bomDto.getQuantity())
                .isActive(bomDto.getIsActive())
                .build();

        // 계층 정보 설정
        if (bomDto.getParentItemId() != null) {
            // 상위 BOM 조회
            List<Bom> parentBoms = bomRepository.findRootBomsByItemCode(parentItem.getItemCode());
            if (parentBoms.isEmpty()) {
                // 상위 BOM이 없으면 최상위 BOM으로 처리
                bom.setLevel(0);
                bom.setPath("0");
                return convertToDto(bomRepository.save(bom));
            }
            Bom parentBom = parentBoms.get(0);
            bom.setLevel(parentBom.getLevel() + 1);
            bom.setPath(parentBom.getPath() + "." + parentBom.getId());
        } else {
            // 최상위 BOM인 경우
            bom.setLevel(0);
            bom.setPath("0");
        }

        Bom savedBom = bomRepository.save(bom);
        return convertToDto(savedBom);
    }

    @Override
    public BomTreeDto updateBom(Long id, BomTreeDto bomDto) {
        Optional<Bom> optionalBom = bomRepository.findById(id);
        if (optionalBom.isPresent()) {
            Bom bom = optionalBom.get();
            bom.setQuantity(bomDto.getQuantity());
            bom.setIsActive(bomDto.getIsActive());
            return convertToDto(bomRepository.save(bom));
        }
        return null;
    }

    @Override
    public void deleteBom(Long id) {
        bomRepository.deleteById(id);
    }

    @Override
    public List<BomTreeDto> getRootBomsByItemCode(String itemCode) {
        return convertToDtoList(bomRepository.findRootBomsByItemCode(itemCode));
    }

    @Override
    public List<BomTreeDto> getChildBomsByParentId(Long parentId) {
        return convertToDtoList(bomRepository.findChildBomsByParentId(parentId));
    }

    @Override
    public BomTreeDto getBomByPath(String path) {
        Optional<Bom> optionalBom = bomRepository.findByPath(path);
        return optionalBom.map(this::convertToDto).orElse(null);
    }

    @Override
    public void updateBomPath(Long id, String newPath) {
        Optional<Bom> optionalBom = bomRepository.findById(id);
        optionalBom.ifPresent(bom -> {
            bom.setPath(newPath);
            bomRepository.save(bom);
        });
    }

    @Override
    public void updateBomLevel(Long id, Integer newLevel) {
        Optional<Bom> optionalBom = bomRepository.findById(id);
        optionalBom.ifPresent(bom -> {
            bom.setLevel(newLevel);
            bomRepository.save(bom);
        });
    }

    // sortOrder 관련 메소드 제거
    // 계층 경로(path)를 통해 순서를 파악할 수 있으므로 필요 없음

    // BOM 엔티티를 DTO로 변환
    private BomTreeDto convertToDto(Bom bom) {
        BomTreeDto dto = new BomTreeDto();
        dto.setId(bom.getId());
        dto.setChildItemId(bom.getChildItem().getItemCode());
        dto.setChildName(bom.getChildItem().getItemName());
        dto.setQuantity(bom.getQuantity());
        dto.setLevel(bom.getLevel());
        dto.setPath(bom.getPath());
        dto.setIsActive(bom.getIsActive());

        return dto;
    }

    // BOM 리스트를 DTO 리스트로 변환
    private List<BomTreeDto> convertToDtoList(List<Bom> boms) {
        List<BomTreeDto> dtos = new ArrayList<>();
        for (Bom bom : boms) {
            dtos.add(convertToDto(bom));
        }
        return dtos;
    }

    // 트리 구조로 변환
    private List<BomTreeDto> convertToTree(List<Bom> rootBoms) {
        List<BomTreeDto> tree = new ArrayList<>();
        for (Bom bom : rootBoms) {
            BomTreeDto dto = convertToDto(bom);
            tree.add(dto);
        }
        return tree;
    }

    // 하위 BOM들을 재귀적으로 변환
    private List<BomTreeDto> convertChildBoms(Bom parentBom) {
        List<BomTreeDto> children = new ArrayList<>();
        if (parentBom != null && parentBom.getId() != null) {
            List<Bom> childBoms = bomRepository.findChildBomsByParentId(parentBom.getId());
            for (Bom bom : childBoms) {
                BomTreeDto dto = convertToDto(bom);
                children.add(dto);
            }
        }
        return children;
    }
}
