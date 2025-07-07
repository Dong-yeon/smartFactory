package com.smartFactory.mes.master.controller;

import com.smartFactory.mes.master.dto.BomTreeDto;
import com.smartFactory.mes.master.service.BomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/bom")
@Tag(name = "BOM API", description = "BOM 관련 API")
@RequiredArgsConstructor
public class BomController {

    private final BomService bomService;

    @Operation(summary = "BOM 트리 조회")
    @GetMapping("/{itemCode}")
    public ResponseEntity<List<BomTreeDto>> getBomTree(@PathVariable String itemCode) {
        return ResponseEntity.ok(bomService.getBomTreeByItemCode(itemCode));
    }

    @Operation(summary = "활성화된 BOM 트리 조회")
    @GetMapping("/{itemCode}/active")
    public ResponseEntity<List<BomTreeDto>> getActiveBomTree(@PathVariable String itemCode) {
        return ResponseEntity.ok(bomService.getActiveBomTreeByItemCode(itemCode));
    }

    @Operation(summary = "BOM 생성")
    @PostMapping
    public ResponseEntity<BomTreeDto> createBom(@RequestBody BomTreeDto bomDto) {
        return ResponseEntity.ok(bomService.createBom(bomDto));
    }

    @Operation(summary = "BOM 수정")
    @PutMapping("/{id}")
    public ResponseEntity<BomTreeDto> updateBom(@PathVariable Long id, @RequestBody BomTreeDto bomDto) {
        return ResponseEntity.ok(bomService.updateBom(id, bomDto));
    }

    @Operation(summary = "BOM 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBom(@PathVariable Long id) {
        bomService.deleteBom(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "계층 경로 업데이트")
    @PutMapping("/{id}/path")
    public ResponseEntity<Void> updateBomPath(@PathVariable Long id, @RequestParam String newPath) {
        bomService.updateBomPath(id, newPath);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "계층 레벨 업데이트")
    @PutMapping("/{id}/level")
    public ResponseEntity<Void> updateBomLevel(@PathVariable Long id, @RequestParam Integer newLevel) {
        bomService.updateBomLevel(id, newLevel);
        return ResponseEntity.ok().build();
    }
}
