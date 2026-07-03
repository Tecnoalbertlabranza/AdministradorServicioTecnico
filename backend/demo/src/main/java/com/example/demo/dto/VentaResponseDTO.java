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
public class VentaResponseDTO {
    private Long idVenta;
    private String detalle;
    private Integer precioVenta;
    private String canal;
    private Timestamp fechaVenta;
}
