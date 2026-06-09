package com.sunbeam.crm.service;

import com.sunbeam.crm.dto.CustomerRequestDto;
import com.sunbeam.crm.dto.CustomerResponseDto;
import com.sunbeam.crm.entity.LeadStatus;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto addCustomer(CustomerRequestDto customerRequestDto);
    List<CustomerResponseDto> getMyCustomers();
    CustomerResponseDto getCustomerById(Integer customerId);
    CustomerResponseDto updateCustomer(Integer customerId, CustomerRequestDto customerRequestDto);
    long getCustomerCount(Integer employeeId);
    List<CustomerResponseDto> getInterestedCustomers();
    List<CustomerResponseDto> getClosedCustomers();
    List<CustomerResponseDto> getPendingCustomers();
    void updateLeadStatus(Integer customerId, LeadStatus status);

    List<CustomerResponseDto> getNotInterestedCustomers();
}

