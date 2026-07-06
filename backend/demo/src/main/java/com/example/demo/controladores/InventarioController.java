package com.example.demo.controladores;

import com.example.demo.dto.InventarioRequestDTO;
import com.example.demo.dto.InventarioResponseDTO;
import com.example.demo.modelos.Inventario;
import com.example.demo.repositorios.InventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioRepository inventarioRepository;

    @GetMapping("/")
    public ResponseEntity<List<InventarioResponseDTO>> listarTodo() {
        List<InventarioResponseDTO> stock = inventarioRepository.findAll().stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(stock);
    }

    @PostMapping("/")
    public ResponseEntity<InventarioResponseDTO> agregarRepuesto(@RequestBody InventarioRequestDTO dto) {
        Inventario nuevoRepuesto = Inventario.builder()
                .nombre(dto.getNombre())
                .cantidadDisponible(dto.getCantidadDisponible())
                .costoUnitario(dto.getCostoUnitario())
                .build();

        Inventario guardado = inventarioRepository.save(nuevoRepuesto);
        return ResponseEntity.ok(convertirADTO(guardado));
    }

    private InventarioResponseDTO convertirADTO(Inventario inventario) {
        return InventarioResponseDTO.builder()
                .idRepuesto(inventario.getIdRepuesto())
                .nombre(inventario.getNombre())
                .cantidadDisponible(inventario.getCantidadDisponible())
                .costoUnitario(inventario.getCostoUnitario())
                .ultimaReposicion(inventario.getUltimaReposicion())
                .build();
    }
}
