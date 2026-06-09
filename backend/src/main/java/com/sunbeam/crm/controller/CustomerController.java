package com.sunbeam.crm.controller;

import com.sunbeam.crm.dto.CustomerRequestDto;
import com.sunbeam.crm.dto.CustomerResponseDto;
import com.sunbeam.crm.entity.Customer;
import com.sunbeam.crm.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> addCustomer(@Valid @RequestBody CustomerRequestDto dto){
        CustomerResponseDto customer= customerService.addCustomer(dto);
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getMyCustomers(){
        List<CustomerResponseDto> customers = customerService.getMyCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/interested")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getInterestedCustomers(){
        List<CustomerResponseDto> customers = customerService.getInterestedCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/not-interested")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getNotInterestedCustomers(){
        List<CustomerResponseDto> customers= customerService.getNotInterestedCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/closed")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getClosedCustomers(){
        List<CustomerResponseDto> customers = customerService.getClosedCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getPendingCustomers(){
        List<CustomerResponseDto> customers = customerService.getPendingCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> getCustomerById(@PathVariable Integer id){
        CustomerResponseDto customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    public ResponseEntity<?> updateCustomer(@PathVariable Integer id, @Valid @RequestBody CustomerRequestDto dto){
        CustomerResponseDto customer = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(customer);
    }




}
