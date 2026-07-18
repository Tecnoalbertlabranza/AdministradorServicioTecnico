package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResumenDashboardDTO {
    private Integer totalIngresos;
    private Integer totalCostos;
    private Integer gananciaNeta;
    private Long cantidadVentas;
}
