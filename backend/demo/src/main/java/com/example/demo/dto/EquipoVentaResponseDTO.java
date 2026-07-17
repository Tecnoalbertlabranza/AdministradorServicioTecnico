package com.example.demo.dto;

import lombok.Data;
import com.example.demo.modelos.EstadoInventarioVenta;
import java.util.List;

@Data
public class EquipoVentaResponseDTO {
    private Long id;
    private String titulo;
    private String especificaciones;
    private Double precioVenta;
    private String condicionEstetica;
    private Double costoCompra;
    private Double costoReacondicionamiento;
    private EstadoInventarioVenta estadoInventario;
    private String nombreCategoria;
    private List<ImagenEquipoDTO> imagenes;
}
