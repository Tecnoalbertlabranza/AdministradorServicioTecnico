package com.example.demo.servicios;

import com.example.demo.dto.ResumenDashboardDTO;
import com.example.demo.modelos.EquipoVenta;
import com.example.demo.modelos.Trabajo;
import com.example.demo.modelos.Venta;
import com.example.demo.repositorios.TrabajoRepository;
import com.example.demo.repositorios.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final TrabajoRepository trabajoRepository;

    @Transactional(readOnly = true)
    public ResumenDashboardDTO obtenerResumen() {
        List<Venta> ventas = ventaRepository.findAll();
        List<Trabajo> trabajos = trabajoRepository.findAll();

        // 1. Cálculo de Trabajos de Servicio Técnico (Taller)
        int ingresosTrabajos = 0;
        int costosTrabajos = 0;

        for (Trabajo trabajo : trabajos) {
            int cobroTrabajo = (trabajo.getPrecioTotal() != null && trabajo.getPrecioTotal() > 0)
                    ? trabajo.getPrecioTotal()
                    : (trabajo.getAbono() != null ? trabajo.getAbono() : 0);

            ingresosTrabajos += cobroTrabajo;
            costosTrabajos += trabajo.getCostoInsumos() != null ? trabajo.getCostoInsumos() : 0;
        }
        int gananciaTrabajos = ingresosTrabajos - costosTrabajos;

        // 2. Cálculo de Ventas de Equipos (Vitrina)
        int ingresosVentas = 0;
        int costosVentas = 0;

        for (Venta venta : ventas) {
            ingresosVentas += venta.getPrecioVenta() != null ? venta.getPrecioVenta() : 0;

            if (venta.getEquipoVenta() != null) {
                EquipoVenta equipo = venta.getEquipoVenta();
                double cCompra = equipo.getCostoCompra() != null ? equipo.getCostoCompra() : 0.0;
                double cReacondicionamiento = equipo.getCostoReacondicionamiento() != null ? equipo.getCostoReacondicionamiento() : 0.0;
                costosVentas += (int) Math.round(cCompra + cReacondicionamiento);
            } else {
                costosVentas += venta.getCostoAsociado() != null ? venta.getCostoAsociado() : 0;
            }
        }
        int gananciaVentas = ingresosVentas - costosVentas;

        // 3. Totales globales
        int totalIngresos = ingresosTrabajos + ingresosVentas;
        int totalCostos = costosTrabajos + costosVentas;
        int gananciaNeta = gananciaTrabajos + gananciaVentas;

        return ResumenDashboardDTO.builder()
                .ingresosTrabajos(ingresosTrabajos)
                .costosTrabajos(costosTrabajos)
                .gananciaTrabajos(gananciaTrabajos)
                .ingresosVentas(ingresosVentas)
                .costosVentas(costosVentas)
                .gananciaVentas(gananciaVentas)
                .totalIngresos(totalIngresos)
                .totalCostos(totalCostos)
                .gananciaNeta(gananciaNeta)
                .cantidadVentas((long) (ventas.size() + trabajos.size()))
                .build();
    }
}

