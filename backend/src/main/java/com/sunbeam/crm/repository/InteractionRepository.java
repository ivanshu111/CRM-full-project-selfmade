package com.sunbeam.crm.repository;

import com.sunbeam.crm.entity.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InteractionRepository extends JpaRepository<Interaction, Integer> {
    List<Interaction> findByCustomerId(Integer customerId);
}
