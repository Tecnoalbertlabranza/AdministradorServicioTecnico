package com.example.demo.servicios;

import com.example.demo.dto.VentaRequestDTO;
import com.example.demo.dto.VentaResponseDTO;
import com.example.demo.modelos.Venta;
import com.example.demo.repositorios.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;

    @Transactional
    public VentaResponseDTO registrarVentaManual(VentaRequestDTO request) {
        Venta venta = new Venta();
        venta.setTipoVenta("ACCESORIO");
        venta.setDetalle(request.getDetalle());
        venta.setPrecioVenta(request.getPrecioVenta());
        venta.setCostoAsociado(request.getCostoAsociado() != null ? request.getCostoAsociado() : 0);
        venta.setMetodoPago(request.getMetodoPago());
        venta.setCanal(request.getCanal() != null ? request.getCanal() : "Local");
        venta.setEquipoVenta(null);
        venta.setFechaVenta(java.time.LocalDateTime.now());
        
        venta = ventaRepository.save(venta);
        
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
