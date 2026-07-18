package com.example.demo.controladores;

import com.example.demo.dto.VentaResponseDTO;
import com.example.demo.modelos.Venta;
import com.example.demo.repositorios.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.dto.VentaRequestDTO;
import com.example.demo.servicios.VentaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaRepository ventaRepository;
    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<VentaResponseDTO> registrarVentaManual(@RequestBody VentaRequestDTO request) {
        try {
            VentaResponseDTO response = ventaService.registrarVentaManual(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/")
    public ResponseEntity<List<VentaResponseDTO>> listarHistorialAdmin() {
        List<VentaResponseDTO> ventas = ventaRepository.findAll().stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(ventas);
    }

    @GetMapping("/publicas")
    public ResponseEntity<List<VentaResponseDTO>> listarVentasPublicas() {
        // Se consulta estrictamente el repositorio de ventas (VentaRepository)
        // garantizando no exponer ni hacer uso de InventarioRepository.
        List<VentaResponseDTO> ventasPublicas = ventaRepository.findAll().stream()
                .map(this::convertirADTO)
                .toList();
        return ResponseEntity.ok(ventasPublicas);
    }

    private VentaResponseDTO convertirADTO(Venta venta) {
        return VentaResponseDTO.builder()
                .id(venta.getId())
                .tipoVenta(venta.getTipoVenta())
                .detalle(venta.getDetalle())
                .precioVenta(venta.getPrecioVenta())
                .costoAsociado(venta.getCostoAsociado())
                .metodoPago(venta.getMetodoPago())
                .canal(venta.getCanal())
                .fechaVenta(venta.getFechaVenta())
                .build();
    }
}
