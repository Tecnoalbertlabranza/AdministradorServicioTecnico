package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenDashboardDTO {

    // Finanzas Servicio Técnico (Trabajos)
    private Integer ingresosTrabajos;
    private Integer costosTrabajos;
    private Integer gananciaTrabajos;

    // Finanzas Vitrina (Ventas de Equipos)
    private Integer ingresosVentas;
    private Integer costosVentas;
    private Integer gananciaVentas;

    // Totales globales y conteos
    private Integer totalIngresos;
    private Integer totalCostos;
    private Integer gananciaNeta;
    private Long cantidadVentas;
}
