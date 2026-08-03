package com.example.demo.controladores;

import com.example.demo.dto.WebhookN8nDTO;
import com.example.demo.servicios.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/webhook", "/webhook"})
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @Value("${webhook.secret}")
    private String webhookSecret;

    @PostMapping("/n8n")
    public ResponseEntity<Map<String, String>> recibirWebhook(
            @RequestHeader(value = "X-Webhook-Token", required = false) String token,
            @RequestBody WebhookN8nDTO dto) {
        
        if (token == null || !token.equals(webhookSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token de Webhook invalido o no autorizado"));
        }

        webhookService.procesarWebhook(dto);
        return ResponseEntity.ok(Map.of("mensaje", "Webhook procesado exitosamente"));
    }
}
