package com.sunbeam.crm.service;

import com.sunbeam.crm.dto.RegisterRequest;
import com.sunbeam.crm.dto.UserResponseDto;

public interface AuthService {
    void register(RegisterRequest registerRequest);
    UserResponseDto getProfile();
}
