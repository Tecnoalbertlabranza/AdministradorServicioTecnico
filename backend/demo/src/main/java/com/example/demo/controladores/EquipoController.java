package com.example.demo.controladores;

import com.example.demo.dto.EquipoVentaRequestDTO;
import com.example.demo.modelos.EquipoVenta;
import com.example.demo.servicios.EquipoVentaService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/v1/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoVentaService equipoService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EquipoVenta> crearEquipo(
            @RequestPart("datos") EquipoVentaRequestDTO datos,
            @RequestPart("fotoPortada") MultipartFile fotoPortada,
            @RequestPart(value = "fotosGaleria", required = false) List<MultipartFile> fotosGaleria) {
        
        try {
            EquipoVenta nuevoEquipo = equipoService.crearEquipo(datos, fotoPortada, fotosGaleria);
            return ResponseEntity.ok(nuevoEquipo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
