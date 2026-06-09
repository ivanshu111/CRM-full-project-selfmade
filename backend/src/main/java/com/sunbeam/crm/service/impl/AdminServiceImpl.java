package com.sunbeam.crm.service.impl;

import com.sunbeam.crm.dto.CustomerResponseDto;
import com.sunbeam.crm.dto.EmployeeResponseDto;
import com.sunbeam.crm.dto.InteractionResponseDto;
import com.sunbeam.crm.entity.Customer;
import com.sunbeam.crm.entity.LeadStatus;
import com.sunbeam.crm.entity.Role;
import com.sunbeam.crm.entity.Users;
import com.sunbeam.crm.repository.CustomerRepository;
import com.sunbeam.crm.repository.InteractionRepository;
import com.sunbeam.crm.repository.LeadsRepository;
import com.sunbeam.crm.repository.UserRepository;
import com.sunbeam.crm.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final InteractionRepository interactionRepository;
    private final LeadsRepository leadsRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<EmployeeResponseDto> getAllEmployees() {
        List<Users> users = userRepository.findByRole(Role.EMPLOYEE);
        return users.stream()
                .map(user -> mapToDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponseDto getEmployeeById(Integer id) {
        Users user= userRepository.findById(id).orElseThrow(()->new RuntimeException("Employee not found."));
        return mapToDto(user);
    }

    @Override
    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customer -> mapToCustomerDto(customer))
                .toList();
    }

    @Override
    public List<CustomerResponseDto> getAllCustomersOfEmployee(Integer id) {
        return customerRepository.findByAssignedToId(id).stream()
                .map(customer -> mapToCustomerDto(customer))
                .toList();
    }

    @Override
    public List<InteractionResponseDto> getAllInteractions() {
        return interactionRepository.findAll().stream()
                .map(interaction -> {
                    InteractionResponseDto dto = modelMapper.map(interaction, InteractionResponseDto.class);
                    dto.setEmployee(mapToDto(interaction.getEmployee()));
                    dto.setCustomer(mapToCustomerDto(interaction.getCustomer()));
                    return dto;
                }).toList();
    }

    @Override
    public double getConversionRate() {
        long closedDeals= leadsRepository.countByStatus(LeadStatus.valueOf("CLOSED"));
        long totalLeads= leadsRepository.count();

        if(totalLeads == 0) return 0.0;

        double rawRate= ((double)  closedDeals / totalLeads )*100;
        return BigDecimal.valueOf(rawRate)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    @Override
    public String getBestPerformingEmployee() {
        return leadsRepository.findBestPerformingEmployee().stream()
                .findFirst()
                .map(user -> user.getName())
                .orElse("No top performing employee found");
    }

    private EmployeeResponseDto mapToDto(Users user) {
        EmployeeResponseDto dto = modelMapper.map(user, EmployeeResponseDto.class);
        if (user.getCreatedAt() != null) {
            dto.setCreated_at(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        }
        return dto;
    }

    private CustomerResponseDto mapToCustomerDto(Customer customer) {
        CustomerResponseDto dto = modelMapper.map(customer, CustomerResponseDto.class);
        if (customer.getAssignedTo() != null) {
            dto.setAssignedToName(customer.getAssignedTo().getName());
        }
        return dto;
    }
}
