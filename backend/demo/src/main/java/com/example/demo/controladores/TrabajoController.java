package com.example.demo.controladores;

import com.example.demo.dto.ClienteResponseDTO;
import com.example.demo.dto.TrabajoResponseDTO;
import com.example.demo.modelos.EstadoTrabajo;
import com.example.demo.modelos.Trabajo;
import com.example.demo.repositorios.TrabajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/trabajos")
@RequiredArgsConstructor
public class TrabajoController {

    private final TrabajoRepository trabajoRepository;

    @GetMapping("/")
    public ResponseEntity<List<TrabajoResponseDTO>> listarTodos() {
        List<TrabajoResponseDTO> trabajos = trabajoRepository.findAll().stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(trabajos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        Optional<Trabajo> trabajoOpt = trabajoRepository.findById(id);
        if (trabajoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Trabajo no encontrado con ID: " + id));
        }
        return ResponseEntity.ok(convertirADTO(trabajoOpt.get()));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Trabajo> trabajoOpt = trabajoRepository.findById(id);
        if (trabajoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Trabajo no encontrado con ID: " + id));
        }

        String nuevoEstadoStr = body.get("estado");
        if (nuevoEstadoStr == null || nuevoEstadoStr.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El campo 'estado' es requerido"));
        }

        EstadoTrabajo nuevoEstado;
        try {
            nuevoEstado = EstadoTrabajo.valueOf(nuevoEstadoStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Estado no valido. Los valores permitidos son: PENDIENTE, FINALIZADO, ENTREGADO"));
        }

        Trabajo trabajo = trabajoOpt.get();
        trabajo.setEstado(nuevoEstado);
        Trabajo trabajoActualizado = trabajoRepository.save(trabajo);

        return ResponseEntity.ok(convertirADTO(trabajoActualizado));
    }

    @PutMapping("/{id}/abono")
    public ResponseEntity<?> sumarAbono(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Optional<Trabajo> trabajoOpt = trabajoRepository.findById(id);
        if (trabajoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Trabajo no encontrado con ID: " + id));
        }

        Integer monto = body.get("monto");
        if (monto == null || monto < 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El campo 'monto' es requerido y debe ser mayor o igual a cero"));
        }

        Trabajo trabajo = trabajoOpt.get();
        trabajo.setAbono(trabajo.getAbono() + monto);
        Trabajo trabajoActualizado = trabajoRepository.save(trabajo);

        return ResponseEntity.ok(convertirADTO(trabajoActualizado));
    }

    private TrabajoResponseDTO convertirADTO(Trabajo trabajo) {
        ClienteResponseDTO clienteDTO = null;
        if (trabajo.getCliente() != null) {
            clienteDTO = ClienteResponseDTO.builder()
                    .idCliente(trabajo.getCliente().getIdCliente())
                    .nombre(trabajo.getCliente().getNombre())
                    .whatsapp(trabajo.getCliente().getWhatsapp())
                    .instagram(trabajo.getCliente().getInstagram())
                    .fechaRegistro(trabajo.getCliente().getFechaRegistro())
                    .build();
        }

        return TrabajoResponseDTO.builder()
                .idTrabajo(trabajo.getIdTrabajo())
                .cliente(clienteDTO)
                .equipo(trabajo.getEquipo())
                .modelo(trabajo.getModelo())
                .servicio(trabajo.getServicio())
                .estado(trabajo.getEstado())
                .precioTotal(trabajo.getPrecioTotal())
                .abono(trabajo.getAbono())
                .costoInsumos(trabajo.getCostoInsumos())
                .fechaIngreso(trabajo.getFechaIngreso())
                .fechaActualizacion(trabajo.getFechaActualizacion())
                .build();
    }
}
