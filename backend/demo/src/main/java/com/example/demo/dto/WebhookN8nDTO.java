package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebhookN8nDTO {
    private String intencion;
    private String cliente;
    private String equipo;
    private String modelo;
    
    @JsonAlias({"falla_o_servicio", "fallaOServicio"})
    private String fallaOServicio;
    
    @JsonAlias({"precio_total", "precioTotal"})
    private Integer precioTotal;
    
    private Integer abono;
    
    @JsonAlias({"costo_insumos", "costoInsumos"})
    private Integer costoInsumos;
    
    private String estado;
    private String plataforma;
    private String contacto;
}
