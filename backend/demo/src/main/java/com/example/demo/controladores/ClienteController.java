package com.example.demo.controladores;

import com.example.demo.dto.ClienteRequestDTO;
import com.example.demo.dto.ClienteResponseDTO;
import com.example.demo.modelos.Cliente;
import com.example.demo.repositorios.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteRepository clienteRepository;

    @GetMapping({"", "/"})
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        List<ClienteResponseDTO> clientes = clienteRepository.findAll().stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(clientes);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<ClienteResponseDTO> crearCliente(@RequestBody ClienteRequestDTO dto) {
        Cliente cliente = Cliente.builder()
                .nombre(dto.getNombre())
                .whatsapp(dto.getWhatsapp())
                .instagram(dto.getInstagram())
                .build();
        Cliente guardado = clienteRepository.save(cliente);
        return ResponseEntity.ok(convertirADTO(guardado));
    }

    private ClienteResponseDTO convertirADTO(Cliente cliente) {
        return ClienteResponseDTO.builder()
                .idCliente(cliente.getIdCliente())
                .nombre(cliente.getNombre())
                .whatsapp(cliente.getWhatsapp())
                .instagram(cliente.getInstagram())
                .fechaRegistro(cliente.getFechaRegistro())
                .build();
    }
}
