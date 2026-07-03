package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebhookN8nDTO {
    private String intencion;
    private String cliente;
    private String equipo;
    private String modelo;
    private String falla_o_servicio;
    private Integer precio_total;
    private Integer abono;
    private Integer costo_insumos;
    private String estado;
    private String plataforma;
}
