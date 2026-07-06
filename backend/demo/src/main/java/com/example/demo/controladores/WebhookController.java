package com.example.demo.controladores;

import com.example.demo.dto.WebhookN8nDTO;
import com.example.demo.servicios.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/n8n")
    public ResponseEntity<Map<String, String>> recibirWebhook(@RequestBody WebhookN8nDTO dto) {
        webhookService.procesarWebhook(dto);
        return ResponseEntity.ok(Map.of("mensaje", "Webhook procesado exitosamente"));
    }
}
