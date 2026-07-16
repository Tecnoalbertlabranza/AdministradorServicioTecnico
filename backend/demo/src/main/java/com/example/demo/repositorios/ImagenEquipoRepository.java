package com.example.demo.repositorios;

import com.example.demo.modelos.ImagenEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImagenEquipoRepository extends JpaRepository<ImagenEquipo, Long> {
}
