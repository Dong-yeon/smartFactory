package com.smartFactory.mes.master.repository;

import com.smartFactory.mes.master.domain.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProcessRepository extends JpaRepository<Process, Long>, JpaSpecificationExecutor<Process> {
    Optional<Process> findByProcessCode(String processCode);
}
