package com.example.demo.servicios;

import com.example.demo.modelos.Cliente;
import com.example.demo.repositorios.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public Cliente obtenerOCrearCliente(String nombre, String plataforma, String contacto) {
        if (plataforma != null && contacto != null && !contacto.trim().isEmpty()) {
            String plat = plataforma.trim().toUpperCase();
            if ("WHATSAPP".equals(plat)) {
                Optional<Cliente> clienteOpt = clienteRepository.findByWhatsapp(contacto);
                if (clienteOpt.isPresent()) {
                    return clienteOpt.get();
                }
            } else if ("INSTAGRAM".equals(plat) || "TIKTOK".equals(plat)) {
                Optional<Cliente> clienteOpt = clienteRepository.findByInstagram(contacto);
                if (clienteOpt.isPresent()) {
                    return clienteOpt.get();
                }
            }
        }

        return clienteRepository.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> {
                    Cliente nuevoCliente = Cliente.builder()
                            .nombre(nombre)
                            .build();
                    
                    if (plataforma != null && contacto != null && !contacto.trim().isEmpty()) {
                        String plat = plataforma.trim().toUpperCase();
                        if ("WHATSAPP".equals(plat)) {
                            nuevoCliente.setWhatsapp(contacto);
                        } else if ("INSTAGRAM".equals(plat) || "TIKTOK".equals(plat)) {
                            nuevoCliente.setInstagram(contacto);
                        }
                    }
                    
                    return clienteRepository.save(nuevoCliente);
                });
    }
}
