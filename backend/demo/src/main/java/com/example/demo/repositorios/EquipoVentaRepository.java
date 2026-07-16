package com.example.demo.repositorios;

import com.example.demo.modelos.EquipoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipoVentaRepository extends JpaRepository<EquipoVenta, Long> {
}
