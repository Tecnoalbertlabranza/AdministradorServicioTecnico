package com.example.demo.modelos;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "imagenes_equipo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImagenEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String urlImagen;

    @Column(nullable = false)
    private boolean esPortada = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id", nullable = false)
    private EquipoVenta equipo;
}
