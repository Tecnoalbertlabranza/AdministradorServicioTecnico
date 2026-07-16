package com.example.demo.repositorios;

import com.example.demo.modelos.CategoriaEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaEquipoRepository extends JpaRepository<CategoriaEquipo, Long> {
}
