package com.example.demo.servicios;

import com.example.demo.modelos.Cliente;
import com.example.demo.repositorios.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public Cliente obtenerOCrearCliente(String nombre) {
        return clienteRepository.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> {
                    Cliente nuevoCliente = Cliente.builder()
                            .nombre(nombre)
                            .build();
                    return clienteRepository.save(nuevoCliente);
                });
    }
}
