package com.example.demo;

import com.example.demo.modelos.CategoriaEquipo;
import com.example.demo.repositorios.CategoriaEquipoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class CategoriaInitializer {

    @Bean
    public CommandLineRunner initCategorias(CategoriaEquipoRepository categoriaRepository) {
        return args -> {
            if (categoriaRepository.count() == 0) {
                CategoriaEquipo laptop = new CategoriaEquipo();
                laptop.setNombre("Laptops");
                laptop.setActiva(true);

                CategoriaEquipo celular = new CategoriaEquipo();
                celular.setNombre("Celulares");
                celular.setActiva(true);

                CategoriaEquipo consola = new CategoriaEquipo();
                consola.setNombre("Consolas");
                consola.setActiva(true);

                categoriaRepository.saveAll(List.of(laptop, celular, consola));
                System.out.println("Categorías iniciales creadas en la base de datos.");
            }
        };
    }
}
