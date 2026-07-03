package com.example.demo.dto;

import com.example.demo.modelos.EstadoTrabajo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrabajoRequestDTO {
    private UUID idCliente;
    private String equipo;
    private String modelo;
    private String servicio;
    private EstadoTrabajo estado;
    private Integer precioTotal;
    private Integer abono;
    private Integer costoInsumos;
}
