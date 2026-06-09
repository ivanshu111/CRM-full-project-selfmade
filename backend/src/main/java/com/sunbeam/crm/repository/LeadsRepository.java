package com.sunbeam.crm.repository;

import com.sunbeam.crm.entity.LeadStatus;
import com.sunbeam.crm.entity.Leads;
import com.sunbeam.crm.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadsRepository extends JpaRepository<Leads, Integer> {
    Optional<Leads> findByCustomerId(Integer customerId);
    Optional<Leads> findTopByCustomerIdOrderByIdDesc(Integer customerId);

    long countByStatus(LeadStatus status);

    @Query("SELECT l.employee FROM Leads l WHERE l.status = com.sunbeam.crm.entity.LeadStatus.CLOSED GROUP BY l.employee ORDER BY COUNT(l) DESC")
    List<Users> findBestPerformingEmployee();
}
