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

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> actualizarStock(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body) {
        Integer nuevaCantidad = body.get("cantidadDisponible");
        if (nuevaCantidad == null || nuevaCantidad < 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "La cantidad debe ser un número positivo"));
        }
        return inventarioRepository.findById(id).map(repuesto -> {
            repuesto.setCantidadDisponible(nuevaCantidad);
            // repuesto.setUltimaReposicion(...) // opcional: actualizar fecha si aumenta
            Inventario guardado = inventarioRepository.save(repuesto);
            return ResponseEntity.ok(convertirADTO(guardado));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRepuesto(@PathVariable Long id) {
        if (!inventarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            inventarioRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("mensaje", "Repuesto eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "No se puede eliminar el repuesto (podría estar en uso)"));
        }
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
