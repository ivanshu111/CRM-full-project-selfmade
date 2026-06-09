package com.sunbeam.crm.service.impl;

import com.sunbeam.crm.dto.CustomerRequestDto;
import com.sunbeam.crm.dto.CustomerResponseDto;
import com.sunbeam.crm.entity.Customer;
import com.sunbeam.crm.entity.LeadStatus;
import com.sunbeam.crm.entity.Leads;
import com.sunbeam.crm.entity.Role;
import com.sunbeam.crm.entity.Users;
import com.sunbeam.crm.repository.CustomerRepository;
import com.sunbeam.crm.repository.LeadsRepository;
import com.sunbeam.crm.repository.UserRepository;
import com.sunbeam.crm.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final LeadsRepository leadsRepository;
    private final ModelMapper modelMapper;

    private CustomerResponseDto mapToResponseDto(Customer customer) {
        CustomerResponseDto responseDto = modelMapper.map(customer, CustomerResponseDto.class);
        responseDto.setAssignedToName(customer.getAssignedTo() != null ? customer.getAssignedTo().getName() : "None");
        responseDto.setAssignedToId(customer.getAssignedTo() != null ? customer.getAssignedTo().getId() : null);
        
        // Get the latest lead status if available
        if (customer.getLeads() != null && !customer.getLeads().isEmpty()) {
            customer.getLeads().stream()
                    .max(Comparator.comparing(Leads::getId))
                    .ifPresent(latestLead -> responseDto.setStatus(latestLead.getStatus().name()));
        } else {
            responseDto.setStatus("PENDING"); // Default status if no lead exists yet
        }
        
        return responseDto;
    }

    @Override
    public CustomerResponseDto getCustomerById(Integer customerId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        } else {
            customer = customerRepository.findByIdAndAssignedTo(customerId, loggedInUser)
                    .orElseThrow(() -> new RuntimeException("Customer not found or not assigned to you"));
        }

        return mapToResponseDto(customer);
    }

    @Override
    public List<CustomerResponseDto> getMyCustomers() {
        // ... (existing implementation)
        // Get logged-in user email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Find user
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get customers assigned to this user
        List<Customer> customers = customerRepository.findByAssignedTo(loggedInUser);

        // Map to Response DTO using lambda expression as requested
        return customers.stream()
                .map(customer -> mapToResponseDto(customer))
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDto updateCustomer(Integer customerId, CustomerRequestDto customerRequestDto) {
        // Get logged-in user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Logic: if role is EMPLOYEE, check if customer is assigned to them
        if (loggedInUser.getRole() == Role.EMPLOYEE) {
            if (customer.getAssignedTo() == null || !customer.getAssignedTo().getId().equals(loggedInUser.getId())) {
                throw new RuntimeException("You are not authorized to update this customer information.");
            }
        }

        // Update fields
        if (customerRequestDto.getName() != null) customer.setName(customerRequestDto.getName());
        if (customerRequestDto.getEmail() != null) customer.setEmail(customerRequestDto.getEmail());
        if (customerRequestDto.getPhone() != null) customer.setPhone(customerRequestDto.getPhone());

        // Admin can reassign if they provide assignedToUserId
        if (loggedInUser.getRole() == Role.ADMIN && customerRequestDto.getAssignedToUserId() != null) {
            Users newAssignedUser = userRepository.findById(customerRequestDto.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("New assigned user not found"));
            if (newAssignedUser.getRole() != Role.EMPLOYEE) {
                throw new RuntimeException("Customer can only be assigned to an EMPLOYEE");
            }
            customer.setAssignedTo(newAssignedUser);
        }

        Customer updatedCustomer = customerRepository.save(customer);

        return mapToResponseDto(updatedCustomer);
    }

    @Override
    public List<CustomerResponseDto> getInterestedCustomers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Customer> customers;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customers = customerRepository.findByLeadStatus(LeadStatus.INTERESTED);
        } else {
            customers = customerRepository.findByAssignedToAndLeadStatus(loggedInUser, LeadStatus.INTERESTED);
        }

        return customers.stream().map(customer -> mapToResponseDto(customer)).collect(Collectors.toList());
    }

    @Override
    public List<CustomerResponseDto> getClosedCustomers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Customer> customers;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customers = customerRepository.findByLeadStatus(LeadStatus.CLOSED);
        } else {
            customers = customerRepository.findByAssignedToAndLeadStatus(loggedInUser, LeadStatus.CLOSED);
        }

        return customers.stream().map(customer -> mapToResponseDto(customer)).collect(Collectors.toList());
    }

    @Override
    public long getCustomerCount(Integer employeeId) {

        //get the currently logged-in user's email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        //takes the email and look up in db for user profile
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (employeeId != null) {
            if (loggedInUser.getRole() == Role.ADMIN) {
                Users targetUser = userRepository.findById(employeeId)
                        .orElseThrow(() -> new RuntimeException("Employee not found"));
                return customerRepository.countByAssignedTo(targetUser);
            } else if (!loggedInUser.getId().equals(employeeId)) {
                throw new RuntimeException("You are not authorized to fetch another employee's customer count.");
            }
        }

        // If Admin and no employeeId, return total count
        if (loggedInUser.getRole() == Role.ADMIN) {
            return customerRepository.count();
        }

        return customerRepository.countByAssignedTo(loggedInUser);
    }

    @Override
    @Transactional
    public void updateLeadStatus(Integer customerId, LeadStatus status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // If user is EMPLOYEE, they can only update status for their own customers
        if (loggedInUser.getRole() == Role.EMPLOYEE) {
            if (customer.getAssignedTo() == null || !customer.getAssignedTo().getId().equals(loggedInUser.getId())) {
                throw new RuntimeException("You are not authorized to update status for this customer.");
            }
        }

        // Get latest lead for this customer
        Leads latestLead = leadsRepository.findTopByCustomerIdOrderByIdDesc(customerId)
                .orElseGet(() -> {
                    Leads newLead = new Leads();
                    newLead.setCustomer(customer);
                    newLead.setEmployee(customer.getAssignedTo());
                    return newLead;
                });

        latestLead.setStatus(status);

        leadsRepository.save(latestLead);
    }



    @Override
    public List<CustomerResponseDto> getPendingCustomers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Customer> customers;
        if (loggedInUser.getRole() == Role.ADMIN) {
            customers = customerRepository.findByLeadStatus(LeadStatus.PENDING);
        } else {
            customers = customerRepository.findByAssignedToAndLeadStatus(loggedInUser, LeadStatus.PENDING);
        }

        return customers.stream().map(customer -> mapToResponseDto(customer)).collect(Collectors.toList());
    }

    @Override
    public List<CustomerResponseDto> getNotInterestedCustomers() {
        String email= SecurityContextHolder.getContext().getAuthentication().getName();
        Users loggedInUser= userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("User not found"));

        List<Customer> customers;
        if(loggedInUser.getRole() == Role.ADMIN){
            customers= customerRepository.findByLeadStatus(LeadStatus.NOT_INTERESTED);
        }else{
            customers=customerRepository.findByAssignedToAndLeadStatus(loggedInUser, LeadStatus.NOT_INTERESTED);
        }

        return customers.stream().map(customer -> mapToResponseDto(customer)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerResponseDto addCustomer(CustomerRequestDto customerRequestDto) {

        //get logged-in user - spring security stores current user info in SecurityContextHolder.
        //.getName()- returns email/username of logged-in user
        String email= SecurityContextHolder.getContext().getAuthentication().getName();

        //then by logged-in user email we search user in database, if not found than throw error.
        Users loggedInUser= userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("User not found"));

        Users assignedUser;

        //here we check that if logged-in user is admin, if yes then while registering customer admin must provide a EmployeeID, to whom customer is assigned.
        //if employee not found than logged-in user is assigned to that customer.
        if(loggedInUser.getRole() == Role.ADMIN){
            if(customerRequestDto.getAssignedToUserId() != null){
                assignedUser = userRepository.findById(customerRequestDto.getAssignedToUserId())
                        .orElseThrow(() -> new RuntimeException("Assigned user not found"));

                //Admin cannot assign customer to any random person, he is only allow to assign to an Employee.
                if(assignedUser.getRole() != Role.EMPLOYEE){
                    throw new RuntimeException("Customer can only be assigned to an EMPLOYEE");
                }

            } else {
                throw new RuntimeException("Admin must assign customer to an Employee");
            }
        }else{
            assignedUser = loggedInUser;
        }

        //create customer
        Customer customer= new Customer();
        customer.setName(customerRequestDto.getName());
        customer.setEmail(customerRequestDto.getEmail());
        customer.setPhone(customerRequestDto.getPhone());
        customer.setAssignedTo(assignedUser);

        Customer savedCustomer = customerRepository.save(customer);

        // Create initial lead record with status PENDING
        Leads initialLead = new Leads();
        initialLead.setCustomer(savedCustomer);
        initialLead.setEmployee(assignedUser);
        initialLead.setStatus(LeadStatus.PENDING);
        leadsRepository.save(initialLead);

        return mapToResponseDto(savedCustomer);
    }
}
