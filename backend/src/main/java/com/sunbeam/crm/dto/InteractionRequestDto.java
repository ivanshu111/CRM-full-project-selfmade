package com.sunbeam.crm.dto;

import com.sunbeam.crm.entity.LeadStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InteractionRequestDto {
    private Integer customerId;
    private String notes;
    private LeadStatus status;
    private LocalDate nextFollowUpDate;
}
