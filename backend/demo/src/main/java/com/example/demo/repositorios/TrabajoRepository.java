package com.example.demo.repositorios;

import com.example.demo.modelos.EstadoTrabajo;
import com.example.demo.modelos.Trabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrabajoRepository extends JpaRepository<Trabajo, Long> {
    List<Trabajo> findByCliente_IdCliente(java.util.UUID idCliente);
    List<Trabajo> findByFechaIngresoBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    List<Trabajo> findByEstado(EstadoTrabajo estado);
}

