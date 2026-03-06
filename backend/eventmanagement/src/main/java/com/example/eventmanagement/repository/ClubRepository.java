package com.example.eventmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.eventmanagement.model.Club;

public interface ClubRepository extends JpaRepository<Club, Long> {
}