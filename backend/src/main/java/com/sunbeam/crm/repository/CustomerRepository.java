package com.sunbeam.crm.repository;

import com.sunbeam.crm.entity.Customer;
import com.sunbeam.crm.entity.LeadStatus;
import com.sunbeam.crm.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    List<Customer> findByAssignedTo(Users assignedTo);
    Optional<Customer> findByIdAndAssignedTo(Integer id, Users assignedTo);
    List<Customer> findByAssignedToId(Integer id);
    long countByAssignedTo(Users assignedTo);

    @Query("SELECT DISTINCT c FROM Customer c JOIN c.leads l WHERE c.assignedTo = :employee AND l.status = :status")
    List<Customer> findByAssignedToAndLeadStatus(@Param("employee") Users employee, @Param("status") LeadStatus status);

    @Query("SELECT DISTINCT c FROM Customer c JOIN c.leads l WHERE l.status = :status")
    List<Customer> findByLeadStatus(@Param("status") LeadStatus status);
}
