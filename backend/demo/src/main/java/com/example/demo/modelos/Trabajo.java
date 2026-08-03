package com.example.demo.modelos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "trabajos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private String equipo;

    @Column(nullable = false)
    private String modelo;

    @Column(nullable = false)
    private String servicio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTrabajo estado;

    @Column(nullable = false)
    private Integer precioTotal;

    @Column(nullable = false)
    private Integer abono;

    @Column(nullable = true)
    private Integer costoInsumos;

    @Column(nullable = true)
    private String plataforma;

    @Column(columnDefinition = "TEXT")
    private String informeTecnico;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp fechaIngreso;

    @UpdateTimestamp
    private Timestamp fechaActualizacion;

    @OneToMany(mappedBy = "trabajo", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TrabajoRepuesto> repuestos = new java.util.ArrayList<>();
}
