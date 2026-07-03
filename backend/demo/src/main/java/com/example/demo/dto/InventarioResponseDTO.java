package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioResponseDTO {
    private Long idRepuesto;
    private String nombre;
    private Integer cantidadDisponible;
    private Integer costoUnitario;
    private Timestamp ultimaReposicion;
}
