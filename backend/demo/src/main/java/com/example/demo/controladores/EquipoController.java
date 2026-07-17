package com.example.demo.controladores;

import com.example.demo.dto.EquipoVentaRequestDTO;
import com.example.demo.dto.EquipoVentaResponseDTO;
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

    @GetMapping
    public ResponseEntity<List<EquipoVentaResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(equipoService.obtenerTodos());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EquipoVentaResponseDTO> crearEquipo(
            @RequestPart("datos") EquipoVentaRequestDTO datos,
            @RequestPart("fotoPortada") MultipartFile fotoPortada,
            @RequestPart(value = "fotosGaleria", required = false) List<MultipartFile> fotosGaleria) {
        
        try {
            EquipoVentaResponseDTO nuevoEquipo = equipoService.crearEquipo(datos, fotoPortada, fotosGaleria);
            return ResponseEntity.ok(nuevoEquipo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
