package com.sunbeam.crm.dto;

import com.sunbeam.crm.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDto {
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}
