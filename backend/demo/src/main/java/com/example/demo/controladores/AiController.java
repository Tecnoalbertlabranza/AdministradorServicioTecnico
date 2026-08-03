package com.example.demo.controladores;

import com.example.demo.dto.AiRequestDTO;
import com.example.demo.dto.AiResponseDTO;
import com.example.demo.servicios.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/ai", "/ai"})
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/mejorar-informe")
    public ResponseEntity<?> mejorarInforme(@RequestBody AiRequestDTO request) {
        try {
            String textoMejorado = aiService.mejorarRedaccion(request.getTextoCrudo());
            return ResponseEntity.ok(new AiResponseDTO(textoMejorado));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
