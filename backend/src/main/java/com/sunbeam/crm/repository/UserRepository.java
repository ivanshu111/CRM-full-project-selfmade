package com.sunbeam.crm.repository;

import com.sunbeam.crm.entity.Role;
import com.sunbeam.crm.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Integer> {

    Optional<Users> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Users> findByRole(Role role);
}
