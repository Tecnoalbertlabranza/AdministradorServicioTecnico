package com.example.demo.dto;

import com.example.demo.modelos.EstadoTrabajo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrabajoResponseDTO {
    private Long idTrabajo;
    private ClienteResponseDTO cliente;
    private String equipo;
    private String modelo;
    private String servicio;
    private EstadoTrabajo estado;
    private Integer precioTotal;
    private Integer abono;
    private Integer costoInsumos;
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Timestamp fechaIngreso;
    
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Timestamp fechaActualizacion;
}
