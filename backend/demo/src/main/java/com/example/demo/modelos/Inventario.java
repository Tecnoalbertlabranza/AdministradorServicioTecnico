package com.example.demo.modelos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRepuesto;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidadDisponible;

    @Column(nullable = false)
    private Integer costoUnitario;

    @UpdateTimestamp
    private Timestamp ultimaReposicion;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "repuesto", cascade = CascadeType.ALL)
    private java.util.List<TrabajoRepuesto> usosEnTrabajos = new java.util.ArrayList<>();
}
