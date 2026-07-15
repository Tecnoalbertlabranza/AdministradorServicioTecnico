package com.example.demo.servicios;

import com.example.demo.dto.TrabajoRequestDTO;
import com.example.demo.modelos.Cliente;
import com.example.demo.modelos.EstadoTrabajo;
import com.example.demo.modelos.Trabajo;
import com.example.demo.repositorios.ClienteRepository;
import com.example.demo.repositorios.TrabajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrabajoService {

    private final TrabajoRepository trabajoRepository;
    private final ClienteRepository clienteRepository;

    public List<Trabajo> listarTodos() {
        return trabajoRepository.findAll();
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
        if (dto.getIdCliente() != null) {
            cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        } else if (dto.getNombreCliente() != null && !dto.getNombreCliente().trim().isEmpty()) {
            cliente = clienteRepository.findByNombreIgnoreCase(dto.getNombreCliente().trim())
                    .orElseGet(() -> {
                        Cliente nuevoCliente = Cliente.builder()
                                .nombre(dto.getNombreCliente().trim())
                                .build();
                        return clienteRepository.save(nuevoCliente);
                    });
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
                .abono(0)
                .costoInsumos(dto.getCostoInsumos() != null ? dto.getCostoInsumos() : 0)
                .plataforma("Local")
                .build();

        return trabajoRepository.save(nuevoTrabajo);
    }
}
