package com.example.eventmanagement.config;

import com.example.eventmanagement.model.*;
import com.example.eventmanagement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(UserRepository userRepo, ClubRepository clubRepo) {
        return args -> {

            if(userRepo.count() == 0){

                User student = new User();
                student.setName("Student");
                student.setEmail("student@test.com");
                student.setPassword("1234");
                student.setRole(Roles.STUDENT);
                student.setDepartment("IT");

                User organizer = new User();
                organizer.setName("Organizer");
                organizer.setEmail("organizer@test.com");
                organizer.setPassword("1234");
                organizer.setRole(Roles.ORGANIZER);
                organizer.setDepartment("IT");

                User faculty = new User();
                faculty.setName("Faculty");
                faculty.setEmail("faculty@test.com");
                faculty.setPassword("1234");
                faculty.setRole(Roles.FACULTY);
                faculty.setDepartment("IT");

                userRepo.save(student);
                userRepo.save(organizer);
                userRepo.save(faculty);
            }

            if(clubRepo.count() == 0){
                Club club = new Club();
                club.setName("CSI Chapter");
                club.setDepartment("IT");
                clubRepo.save(club);
            }
        };
    }
}