package com.sunbeam.crm;

import com.sunbeam.crm.entity.Role;
import com.sunbeam.crm.entity.Users;
import com.sunbeam.crm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class CrmApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrmApplication.class, args);
	}

//	@Bean
//	CommandLineRunner init(UserRepository repo, PasswordEncoder encoder) {
//		return args -> {
//			if(repo.findByEmail("ivanshu@gmail.com").isEmpty()) {
//				Users admin = new Users();
//				admin.setEmail("ivanshu@gmail.com");
//				admin.setPassword(encoder.encode("ivanshu007"));
//				admin.setRole(Role.ADMIN);
//				repo.save(admin);
//			}
//		};
//	}



}

