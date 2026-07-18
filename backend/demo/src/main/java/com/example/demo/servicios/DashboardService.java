package com.example.demo.servicios;

import com.example.demo.dto.ResumenDashboardDTO;
import com.example.demo.modelos.Venta;
import com.example.demo.repositorios.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VentaRepository ventaRepository;

    @Transactional(readOnly = true)
    public ResumenDashboardDTO obtenerResumen() {
        List<Venta> ventas = ventaRepository.findAll();
        
        int totalIngresos = 0;
        int totalCostos = 0;
        
        for (Venta venta : ventas) {
            totalIngresos += venta.getPrecioVenta() != null ? venta.getPrecioVenta() : 0;
            totalCostos += venta.getCostoAsociado() != null ? venta.getCostoAsociado() : 0;
        }
        
        int gananciaNeta = totalIngresos - totalCostos;
        
        return ResumenDashboardDTO.builder()
                .totalIngresos(totalIngresos)
                .totalCostos(totalCostos)
                .gananciaNeta(gananciaNeta)
                .cantidadVentas((long) ventas.size())
                .build();
    }
}
