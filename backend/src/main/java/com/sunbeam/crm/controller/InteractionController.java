package com.sunbeam.crm.controller;

import com.sunbeam.crm.dto.InteractionRequestDto;
import com.sunbeam.crm.dto.InteractionResponseDto;
import com.sunbeam.crm.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interaction")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createInteraction(@RequestBody InteractionRequestDto dto) {
        interactionService.createInteraction(dto);
        return ResponseEntity.ok("Interaction created successfully...!");
    }

    @GetMapping("/customer/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getCustomerInteractions(@PathVariable Integer id){
        List<InteractionResponseDto> response = interactionService.getCustomerInteractions(id);
        return ResponseEntity.ok(response);
    }
}
