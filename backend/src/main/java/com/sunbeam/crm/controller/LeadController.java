package com.sunbeam.crm.controller;

import com.sunbeam.crm.dto.LeadStatusRequest;
import com.sunbeam.crm.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/leads")
public class LeadController {

    private final CustomerService customerService;

    @PutMapping("/{customerId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> updateLeadStatus(@PathVariable Integer customerId, @Valid @RequestBody LeadStatusRequest request) {
        customerService.updateLeadStatus(customerId, request.getStatus());
        return ResponseEntity.ok("Lead status updated successfully");
    }
}
