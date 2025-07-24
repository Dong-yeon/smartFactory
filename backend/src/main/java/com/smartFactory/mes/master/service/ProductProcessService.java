package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.dto.ProductProcessRequest;
import com.smartFactory.mes.master.dto.ProductProcessResponse;

import java.util.List;

public interface ProductProcessService {
    ProductProcessResponse createProductProcess(ProductProcessRequest request);
    ProductProcessResponse updateProductProcess(ProductProcessRequest request);
    void deleteProductProcess(Long id);
    ProductProcessResponse getProductProcess(Long id);
    List<ProductProcessResponse> getProductProcessTreeByItem(Long itemId);
}
