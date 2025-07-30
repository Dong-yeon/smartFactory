package com.smartFactory.mes.master.service;

import com.smartFactory.mes.master.dto.ProductProcessRequest;
import com.smartFactory.mes.master.dto.ProductProcessResponse;
import com.smartFactory.mes.master.dto.ProductProcessRevisionResponse;

import java.util.List;

public interface ProductProcessRevisionService {
    List<ProductProcessRevisionResponse> getProductProcessRevisions(Long itemId);
}
