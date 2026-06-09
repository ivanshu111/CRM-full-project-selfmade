package com.sunbeam.crm.dto;

import com.sunbeam.crm.entity.Role;
import lombok.Data;

@Data
public class EmployeeResponseDto {
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private String created_at;
}
