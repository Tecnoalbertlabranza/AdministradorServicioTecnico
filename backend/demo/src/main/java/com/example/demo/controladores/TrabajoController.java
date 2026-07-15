package com.example.demo.controladores;

import com.example.demo.dto.ClienteResponseDTO;
import com.example.demo.dto.TrabajoResponseDTO;
import com.example.demo.modelos.EstadoTrabajo;
import com.example.demo.modelos.Trabajo;
import com.example.demo.servicios.TrabajoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trabajos")
@RequiredArgsConstructor
public class TrabajoController {

    private final TrabajoService trabajoService;

    @GetMapping("/")
    public ResponseEntity<List<TrabajoResponseDTO>> listarTodos() {
        List<TrabajoResponseDTO> trabajos = trabajoService.listarTodos().stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(trabajos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Trabajo trabajo = trabajoService.obtenerPorId(id);
            return ResponseEntity.ok(convertirADTO(trabajo));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        }
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<TrabajoResponseDTO>> obtenerPorCliente(@PathVariable java.util.UUID idCliente) {
        List<TrabajoResponseDTO> trabajos = trabajoService.obtenerTrabajosPorCliente(idCliente).stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(trabajos);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstadoStr = body.get("estado");
        if (nuevoEstadoStr == null || nuevoEstadoStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El campo 'estado' es requerido"));
        }

        EstadoTrabajo nuevoEstado;
        try {
            nuevoEstado = EstadoTrabajo.valueOf(nuevoEstadoStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Estado no valido. Los valores permitidos son: PENDIENTE, FINALIZADO, ENTREGADO"));
        }

        try {
            Trabajo trabajoActualizado = trabajoService.actualizarEstado(id, nuevoEstado);
            return ResponseEntity.ok(convertirADTO(trabajoActualizado));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        }
    }

    @PutMapping("/{id}/abono")
    public ResponseEntity<?> sumarAbono(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer monto = body.get("monto");
        
        try {
            Trabajo trabajoActualizado = trabajoService.sumarAbono(id, monto);
            return ResponseEntity.ok(convertirADTO(trabajoActualizado));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        }
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
