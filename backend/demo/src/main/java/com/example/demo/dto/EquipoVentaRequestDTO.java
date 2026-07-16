package com.example.demo.dto;

import lombok.Data;
import com.example.demo.modelos.EstadoInventarioVenta;

@Data
public class EquipoVentaRequestDTO {
    private String titulo;
    private String especificaciones;
    private Double precioVenta;
    private String condicionEstetica;
    private Double costoCompra;
    private Double costoReacondicionamiento;
    private EstadoInventarioVenta estadoInventario;
    private Long idCategoria;
}
