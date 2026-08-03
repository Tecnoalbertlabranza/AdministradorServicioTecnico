package com.example.demo.controladores;

import com.example.demo.dto.ResumenDashboardDTO;
import com.example.demo.servicios.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/dashboard", "/dashboard"})
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<ResumenDashboardDTO> obtenerResumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }
}
