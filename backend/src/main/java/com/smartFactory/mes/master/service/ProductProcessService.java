package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.dto.ProductProcessRequest;
import com.smartFactory.mes.master.dto.ProductProcessResponse;

import java.util.List;

public interface ProductProcessService {
    List<ProductProcessResponse> createProductProcesses(List<ProductProcessRequest> requestList);
    List<ProductProcessResponse> getProductProcessTreeByItem(Long itemId);
}
