package com.example.demo.modelos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipoVenta; // 'EQUIPO' o 'ACCESORIO'

    @Column(nullable = false)
    private String detalle;

    @Column(nullable = false)
    private Integer precioVenta;

    @Column(nullable = false)
    private Integer costoAsociado;

    @Column(nullable = false)
    private String metodoPago;

    @Column(nullable = false)
    private String canal;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaVenta;

    @ManyToOne
    @JoinColumn(name = "equipo_venta_id", nullable = true)
    private EquipoVenta equipoVenta;
}
