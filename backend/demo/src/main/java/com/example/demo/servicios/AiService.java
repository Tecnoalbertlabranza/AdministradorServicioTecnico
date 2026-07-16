package com.example.demo.servicios;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";

    public String mejorarRedaccion(String textoCrudo) {
        if (textoCrudo == null || textoCrudo.trim().isEmpty()) {
            return "";
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = GEMINI_API_URL + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = "Eres un técnico informático experto redactando informes para clientes. Tu objetivo es tomar las notas rápidas del técnico y transformarlas en un párrafo profesional, técnico, educado y claro que irá en el informe de entrega. Corrige ortografía y mejora el léxico, pero MANTÉN estrictamente los hechos y no inventes servicios no mencionados. Devuelve SOLO el texto mejorado, sin saludos, sin markdown ni comillas.";
        String textToSend = prompt + "\nNotas: " + textoCrudo;

        Map<String, Object> part = new HashMap<>();
        part.put("text", textToSend);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentResp = (Map<String, Object>) candidate.get("content");
                    if (contentResp != null) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            return "Error al procesar la respuesta de la IA.";
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            throw new RuntimeException("Error al comunicarse con la IA: " + e.getMessage());
        }
    }
}
