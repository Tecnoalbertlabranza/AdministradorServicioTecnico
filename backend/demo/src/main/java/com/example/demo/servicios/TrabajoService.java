package com.example.demo.servicios;

import com.example.demo.dto.TrabajoRequestDTO;
import com.example.demo.modelos.Cliente;
import com.example.demo.modelos.EstadoTrabajo;
import com.example.demo.modelos.Trabajo;
import com.example.demo.modelos.Inventario;
import com.example.demo.repositorios.ClienteRepository;
import com.example.demo.repositorios.InventarioRepository;
import com.example.demo.repositorios.TrabajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.YearMonth;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class TrabajoService {

    private final TrabajoRepository trabajoRepository;
    private final ClienteRepository clienteRepository;
    private final InventarioRepository inventarioRepository;
    private final ClienteService clienteService;

    public List<Trabajo> listarTodos() {
        return trabajoRepository.findAll();
    }

    public List<Trabajo> listarPorMes(int mes, int anio) {
        YearMonth yearMonth = YearMonth.of(anio, mes);
        LocalDateTime inicio = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime fin = yearMonth.atEndOfMonth().atTime(LocalTime.MAX);
        return trabajoRepository.findByFechaIngresoBetween(inicio, fin);
    }

    public Trabajo obtenerPorId(Long id) {
        return trabajoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trabajo no encontrado con ID: " + id));
    }

    public List<Trabajo> obtenerTrabajosPorCliente(java.util.UUID idCliente) {
        return trabajoRepository.findByCliente_IdCliente(idCliente);
    }

    @Transactional
    public Trabajo actualizarEstado(Long id, EstadoTrabajo nuevoEstado) {
        Trabajo trabajo = obtenerPorId(id);

        if (trabajo.getEstado() == EstadoTrabajo.ENTREGADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El trabajo ya fue entregado y no puede modificarse");
        }

        if (nuevoEstado == EstadoTrabajo.ENTREGADO) {
            trabajo.setAbono(trabajo.getPrecioTotal());
        }

        trabajo.setEstado(nuevoEstado);
        return trabajoRepository.save(trabajo);
    }

    @Transactional
    public Trabajo sumarAbono(Long id, Integer monto) {
        Trabajo trabajo = obtenerPorId(id);

        if (trabajo.getEstado() == EstadoTrabajo.ENTREGADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El trabajo ya fue entregado y no puede modificarse");
        }

        if (monto == null || monto <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto a abonar debe ser mayor a cero");
        }

        if (trabajo.getAbono() + monto > trabajo.getPrecioTotal()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El abono supera el total");
        }

        trabajo.setAbono(trabajo.getAbono() + monto);
        return trabajoRepository.save(trabajo);
    }

    @Transactional
    public Trabajo crearTrabajoManual(TrabajoRequestDTO dto) {
        Cliente cliente = null;
        String plataforma = dto.getPlataforma() != null ? dto.getPlataforma() : "Local";

        if (dto.getIdCliente() != null) {
            cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
            
            if (dto.getContacto() != null && !dto.getContacto().trim().isEmpty()) {
                if ("WhatsApp".equalsIgnoreCase(plataforma)) {
                    cliente.setWhatsapp(dto.getContacto().trim());
                    clienteRepository.save(cliente);
                } else if ("Instagram".equalsIgnoreCase(plataforma)) {
                    cliente.setInstagram(dto.getContacto().trim());
                    clienteRepository.save(cliente);
                }
            }
        } else if (dto.getNombreCliente() != null && !dto.getNombreCliente().trim().isEmpty()) {
            cliente = clienteService.obtenerOCrearCliente(dto.getNombreCliente().trim(), plataforma, dto.getContacto());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Se requiere idCliente o nombreCliente");
        }

        Trabajo nuevoTrabajo = Trabajo.builder()
                .cliente(cliente)
                .equipo(dto.getEquipo())
                .modelo(dto.getModelo() != null ? dto.getModelo() : "Generico")
                .servicio(dto.getServicio())
                .estado(EstadoTrabajo.PENDIENTE)
                .precioTotal(dto.getPrecioTotal() != null ? dto.getPrecioTotal() : 0)
                .abono(dto.getAbono() != null ? dto.getAbono() : 0)
                .plataforma(plataforma)
                .build();
        
        nuevoTrabajo.setRepuestos(new java.util.ArrayList<>());

        int costoInsumoFinal = dto.getCostoInsumos() != null ? dto.getCostoInsumos() : 0;

        if (dto.getRepuestosUsados() != null && !dto.getRepuestosUsados().isEmpty()) {
            costoInsumoFinal = 0;
            for (com.example.demo.dto.RepuestoUsoDTO repUso : dto.getRepuestosUsados()) {
                Inventario repuesto = inventarioRepository.findById(repUso.getRepuestoId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Repuesto no encontrado"));
                
                if (repuesto.getCantidadDisponible() < repUso.getCantidad()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock insuficiente para el repuesto: " + repuesto.getNombre());
                }

                repuesto.setCantidadDisponible(repuesto.getCantidadDisponible() - repUso.getCantidad());
                inventarioRepository.save(repuesto);

                com.example.demo.modelos.TrabajoRepuesto trabajoRepuesto = com.example.demo.modelos.TrabajoRepuesto.builder()
                        .trabajo(nuevoTrabajo)
                        .repuesto(repuesto)
                        .cantidadUsada(repUso.getCantidad())
                        .precioUnitarioHistorico(repuesto.getCostoUnitario())
                        .build();
                
                nuevoTrabajo.getRepuestos().add(trabajoRepuesto);
                costoInsumoFinal += repUso.getCantidad() * repuesto.getCostoUnitario();
            }
        }

        nuevoTrabajo.setCostoInsumos(costoInsumoFinal);
        return trabajoRepository.save(nuevoTrabajo);
    }

    @Transactional
    public Trabajo actualizarTrabajo(Long id, TrabajoRequestDTO dto) {
        Trabajo trabajo = obtenerPorId(id);

        if (trabajo.getEstado() == EstadoTrabajo.ENTREGADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El trabajo ya fue entregado y no puede modificarse");
        }

        trabajo.setEquipo(dto.getEquipo());
        if (dto.getModelo() != null) trabajo.setModelo(dto.getModelo());
        trabajo.setServicio(dto.getServicio());
        if (dto.getPrecioTotal() != null) trabajo.setPrecioTotal(dto.getPrecioTotal());
        if (dto.getAbono() != null) trabajo.setAbono(dto.getAbono());
        if (dto.getPlataforma() != null) trabajo.setPlataforma(dto.getPlataforma());
        if (dto.getEstado() != null) trabajo.setEstado(dto.getEstado());

        if (trabajo.getRepuestos() == null) {
            trabajo.setRepuestos(new java.util.ArrayList<>());
        }

        // Revertir inventario actual
        for (com.example.demo.modelos.TrabajoRepuesto tr : trabajo.getRepuestos()) {
            Inventario inv = tr.getRepuesto();
            inv.setCantidadDisponible(inv.getCantidadDisponible() + tr.getCantidadUsada());
            inventarioRepository.save(inv);
        }
        trabajo.getRepuestos().clear();

        int costoInsumoFinal = dto.getCostoInsumos() != null ? dto.getCostoInsumos() : 0;
        
        if (dto.getRepuestosUsados() != null && !dto.getRepuestosUsados().isEmpty()) {
            costoInsumoFinal = 0;
            for (com.example.demo.dto.RepuestoUsoDTO repUso : dto.getRepuestosUsados()) {
                Inventario repuesto = inventarioRepository.findById(repUso.getRepuestoId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Repuesto no encontrado"));
                
                if (repuesto.getCantidadDisponible() < repUso.getCantidad()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock insuficiente para el repuesto: " + repuesto.getNombre());
                }

                repuesto.setCantidadDisponible(repuesto.getCantidadDisponible() - repUso.getCantidad());
                inventarioRepository.save(repuesto);

                com.example.demo.modelos.TrabajoRepuesto trabajoRepuesto = com.example.demo.modelos.TrabajoRepuesto.builder()
                        .trabajo(trabajo)
                        .repuesto(repuesto)
                        .cantidadUsada(repUso.getCantidad())
                        .precioUnitarioHistorico(repuesto.getCostoUnitario())
                        .build();
                
                trabajo.getRepuestos().add(trabajoRepuesto);
                costoInsumoFinal += repUso.getCantidad() * repuesto.getCostoUnitario();
            }
        }

        trabajo.setCostoInsumos(costoInsumoFinal);
        return trabajoRepository.save(trabajo);
    }
}
