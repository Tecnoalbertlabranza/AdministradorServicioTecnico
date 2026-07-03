package com.example.demo.modelos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID idCliente;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = true)
    private String whatsapp;

    @Column(nullable = true)
    private String instagram;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp fechaRegistro;
}
