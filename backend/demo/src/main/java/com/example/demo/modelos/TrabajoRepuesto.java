package com.example.demo.modelos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trabajo_repuesto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrabajoRepuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_trabajo", nullable = false)
    @JsonIgnore
    private Trabajo trabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_repuesto", nullable = false)
    private Inventario repuesto;

    @Column(name = "cantidad_usada", nullable = false)
    private Integer cantidadUsada;

    @Column(name = "precio_unitario_historico", nullable = false)
    private Integer precioUnitarioHistorico;
}
