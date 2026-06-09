package com.sunbeam.crm.service.impl;

import com.sunbeam.crm.dto.RegisterRequest;
import com.sunbeam.crm.dto.UserResponseDto;
import com.sunbeam.crm.entity.Role;
import com.sunbeam.crm.entity.Users;
import com.sunbeam.crm.repository.UserRepository;
import com.sunbeam.crm.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;


    @Override
    public void register(RegisterRequest registerRequest) {

        //check for duplicate email
        if(userRepository.existsByEmail(registerRequest.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        //create user
        Users user= new Users();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.valueOf(registerRequest.getRole()));

        userRepository.save(user);
    }

    @Override
    public UserResponseDto getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return modelMapper.map(user, UserResponseDto.class);
    }
}
