package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.dto.BomTreeDto;
import java.util.List;

public interface BomService {
    // 트리 구조 조회
    List<BomTreeDto> getBomTreeByItemCode(String itemCode);
    List<BomTreeDto> getActiveBomTreeByItemCode(String itemCode);

    // BOM 생성/수정/삭제
    BomTreeDto createBom(BomTreeDto bomDto);
    BomTreeDto updateBom(Long id, BomTreeDto bomDto);
    void deleteBom(Long id);

    // 계층 구조 관련 메소드
    List<BomTreeDto> getRootBomsByItemCode(String itemCode);
    List<BomTreeDto> getChildBomsByParentId(Long parentId);
    BomTreeDto getBomByPath(String path);

    // 계층 경로 재설정
    void updateBomPath(Long id, String newPath);
    void updateBomLevel(Long id, Integer newLevel);


}
