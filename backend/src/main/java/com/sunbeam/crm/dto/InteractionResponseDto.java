package com.sunbeam.crm.dto;

import com.sunbeam.crm.entity.LeadStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InteractionResponseDto {
    private Integer id;
    private String notes;
    private LocalDateTime interactionDate;
    private LeadStatus status;
    private LocalDate nextFollowUpDate;
    
    // Details related to customer
    private CustomerResponseDto customer;
    
    // Details related to employee who performed the interaction/is assigned
    private EmployeeResponseDto employee;
}
