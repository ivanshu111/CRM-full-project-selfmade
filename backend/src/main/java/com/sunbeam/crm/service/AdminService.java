package com.sunbeam.crm.service;

import com.sunbeam.crm.dto.CustomerResponseDto;
import com.sunbeam.crm.dto.EmployeeResponseDto;
import com.sunbeam.crm.dto.InteractionResponseDto;

import java.util.List;

public interface AdminService {
    List<EmployeeResponseDto> getAllEmployees();
    EmployeeResponseDto getEmployeeById(Integer id);
    List<CustomerResponseDto> getAllCustomers();
    List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id);
    List<InteractionResponseDto> getAllInteractions();

    double getConversionRate();
    String getBestPerformingEmployee();
}

