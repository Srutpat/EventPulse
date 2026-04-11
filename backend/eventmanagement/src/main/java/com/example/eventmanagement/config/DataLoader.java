package com.example.eventmanagement.config;

import com.example.eventmanagement.model.Roles;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(UserRepository userRepo) {
        return args -> {

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            if (userRepo.findByEmail("organizer@test.com").isEmpty()) {
                User organizer = new User();
                organizer.setName("Organizer");
                organizer.setEmail("organizer@test.com");
                organizer.setPassword(encoder.encode("1234"));
                organizer.setRole(Roles.ORGANIZER);
                organizer.setDepartment("IT");
                userRepo.save(organizer);
            }

            if (userRepo.findByEmail("faculty@test.com").isEmpty()) {
                User faculty = new User();
                faculty.setName("Faculty");
                faculty.setEmail("faculty@test.com");
                faculty.setPassword(encoder.encode("1234"));
                faculty.setRole(Roles.FACULTY_ADVISOR);
                faculty.setDepartment("IT");
                userRepo.save(faculty);
            }
        };
    }
}