package com.example.demo.modelos;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "equipos_venta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipoVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String especificaciones;

    @Column(nullable = false)
    private Double precioVenta;

    private String condicionEstetica;

    private Double costoCompra;

    private Double costoReacondicionamiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoInventarioVenta estadoInventario = EstadoInventarioVenta.EN_TALLER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaEquipo categoria;

    @OneToMany(mappedBy = "equipo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImagenEquipo> imagenes = new ArrayList<>();
}
