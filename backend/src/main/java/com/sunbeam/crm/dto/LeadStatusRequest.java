package com.sunbeam.crm.dto;

import com.sunbeam.crm.entity.LeadStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeadStatusRequest {
    @NotNull(message = "Status cannot be null")
    private LeadStatus status;
}
