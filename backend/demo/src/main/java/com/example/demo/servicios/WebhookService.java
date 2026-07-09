package com.example.demo.servicios;

import com.example.demo.dto.WebhookN8nDTO;
import com.example.demo.modelos.Cliente;
import com.example.demo.modelos.EstadoTrabajo;
import com.example.demo.modelos.Inventario;
import com.example.demo.modelos.Trabajo;
import com.example.demo.modelos.Venta;
import com.example.demo.repositorios.InventarioRepository;
import com.example.demo.repositorios.TrabajoRepository;
import com.example.demo.repositorios.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WebhookService {

    private final ClienteService clienteService;
    private final TrabajoRepository trabajoRepository;
    private final InventarioRepository inventarioRepository;
    private final VentaRepository ventaRepository;

    @Transactional
    public void procesarWebhook(WebhookN8nDTO dto) {
        if (dto.getIntencion() == null) {
            return;
        }

        switch (dto.getIntencion().toUpperCase()) {
            case "AGENDAR":
                Cliente cliente = clienteService.obtenerOCrearCliente(dto.getCliente(), dto.getPlataforma(), dto.getContacto());
                
                Trabajo trabajo = Trabajo.builder()
                        .cliente(cliente)
                        .equipo(dto.getEquipo())
                        .modelo(dto.getModelo())
                        .servicio(dto.getFallaOServicio())
                        .precioTotal(dto.getPrecioTotal() != null ? dto.getPrecioTotal() : 0)
                        .abono(dto.getAbono() != null ? dto.getAbono() : 0)
                        .costoInsumos(dto.getCostoInsumos() != null ? dto.getCostoInsumos() : 0)
                        .estado(EstadoTrabajo.PENDIENTE)
                        .plataforma(dto.getPlataforma())
                        .build();
                
                trabajoRepository.save(trabajo);
                break;

            case "COMPRA":
                String nombreInsumo = (dto.getEquipo() != null ? dto.getEquipo() : "") + " " 
                                    + (dto.getModelo() != null ? dto.getModelo() : "");
                
                Inventario inventario = Inventario.builder()
                        .nombre(nombreInsumo.trim())
                        .cantidadDisponible(dto.getCantidad() != null ? dto.getCantidad() : 1)
                        .costoUnitario(dto.getCostoInsumos() != null ? dto.getCostoInsumos() : 0)
                        .build();
                
                inventarioRepository.save(inventario);
                break;

            case "VENTA":
                String detalleVenta = (dto.getEquipo() != null ? dto.getEquipo() : "") + " " 
                                    + (dto.getModelo() != null ? dto.getModelo() : "");
                
                Venta venta = Venta.builder()
                        .detalle(detalleVenta.trim())
                        .precioVenta(dto.getPrecioTotal() != null ? dto.getPrecioTotal() : 0)
                        .canal(dto.getPlataforma())
                        .build();
                
                ventaRepository.save(venta);
                break;
                
            default:
                break;
        }
    }
}
