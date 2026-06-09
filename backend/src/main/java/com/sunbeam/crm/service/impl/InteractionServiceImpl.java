package com.sunbeam.crm.service.impl;

import com.sunbeam.crm.dto.CustomerResponseDto;
import com.sunbeam.crm.dto.EmployeeResponseDto;
import com.sunbeam.crm.dto.InteractionRequestDto;
import com.sunbeam.crm.dto.InteractionResponseDto;
import com.sunbeam.crm.entity.*;
import com.sunbeam.crm.repository.CustomerRepository;
import com.sunbeam.crm.repository.InteractionRepository;
import com.sunbeam.crm.repository.LeadsRepository;
import com.sunbeam.crm.repository.UserRepository;
import com.sunbeam.crm.service.InteractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionServiceImpl implements InteractionService {

    private final InteractionRepository interactionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final LeadsRepository leadsRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public InteractionResponseDto createInteraction(InteractionRequestDto dto) {
        log.info("Creating interaction for customer ID: {}", dto.getCustomerId());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + dto.getCustomerId()));

        // Verify that the employee is assigned to this customer (or if they are admin)
        if (loggedInUser.getRole() != Role.ADMIN) {
            if (customer.getAssignedTo() == null || !customer.getAssignedTo().getId().equals(loggedInUser.getId())) {
                log.error("User {} is not authorized for customer {}", email, dto.getCustomerId());
                throw new RuntimeException("You are not authorized to create interaction for this customer.");
            }
        }

        Interaction interaction = new Interaction();
        interaction.setNotes(dto.getNotes());
        interaction.setInteractionDate(LocalDateTime.now());
        interaction.setStatus(dto.getStatus());
        interaction.setCustomer(customer);
        interaction.setEmployee(loggedInUser);
        interaction.setNextFollowUpDate(dto.getNextFollowUpDate());

        Interaction savedInteraction = interactionRepository.save(interaction);
        
        // Update or Create Lead status in Leads table
        Leads lead = leadsRepository.findByCustomerId(customer.getId())
                .orElse(new Leads());
        
        lead.setCustomer(customer);
        lead.setEmployee(loggedInUser);
        lead.setStatus(dto.getStatus());
        leadsRepository.save(lead);
        
        log.info("Interaction and Lead status saved successfully for customer ID: {}", dto.getCustomerId());

        return mapToResponseDto(savedInteraction);
    }

    @Override
    public List<InteractionResponseDto> getCustomerInteractions(Integer customerId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        // Authorization check
        if (loggedInUser.getRole() != Role.ADMIN) {
            if (customer.getAssignedTo() == null || !customer.getAssignedTo().getId().equals(loggedInUser.getId())) {
                throw new RuntimeException("You are not authorized to view interactions for this customer.");
            }
        }

        List<Interaction> interactions = interactionRepository.findByCustomerId(customerId);
        return interactions.stream().map(interaction -> mapToResponseDto(interaction)).collect(Collectors.toList());
    }

    private InteractionResponseDto mapToResponseDto(Interaction interaction) {
        InteractionResponseDto responseDto = modelMapper.map(interaction, InteractionResponseDto.class);

        // Custom mapping for nested DTOs if ModelMapper needs help
        if (interaction.getCustomer() != null) {
            CustomerResponseDto customerDto = modelMapper.map(interaction.getCustomer(), CustomerResponseDto.class);
            customerDto.setAssignedToName(interaction.getCustomer().getAssignedTo() != null ? 
                    interaction.getCustomer().getAssignedTo().getName() : "None");
            responseDto.setCustomer(customerDto);
        }

        if (interaction.getEmployee() != null) {
            EmployeeResponseDto employeeDto = modelMapper.map(interaction.getEmployee(), EmployeeResponseDto.class);
            if (interaction.getEmployee().getCreatedAt() != null) {
                employeeDto.setCreated_at(interaction.getEmployee().getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
            }
            responseDto.setEmployee(employeeDto);
        }

        return responseDto;
    }
}
