package com.example.demo.servicios;

import com.example.demo.modelos.*;
import com.example.demo.repositorios.*;
import com.example.demo.dto.EquipoVentaRequestDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipoVentaService {

    private final EquipoVentaRepository equipoRepository;
    private final CategoriaEquipoRepository categoriaRepository;
    private final ImagenEquipoRepository imagenRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public EquipoVenta crearEquipo(EquipoVentaRequestDTO dto, MultipartFile fotoPortada, List<MultipartFile> fotosGaleria) throws IOException {
        
        CategoriaEquipo categoria = categoriaRepository.findById(dto.getIdCategoria())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + dto.getIdCategoria()));

        EquipoVenta equipo = new EquipoVenta();
        equipo.setTitulo(dto.getTitulo());
        equipo.setEspecificaciones(dto.getEspecificaciones());
        equipo.setPrecioVenta(dto.getPrecioVenta());
        equipo.setCondicionEstetica(dto.getCondicionEstetica());
        equipo.setCostoCompra(dto.getCostoCompra());
        equipo.setCostoReacondicionamiento(dto.getCostoReacondicionamiento());
        equipo.setEstadoInventario(dto.getEstadoInventario() != null ? dto.getEstadoInventario() : EstadoInventarioVenta.EN_TALLER);
        equipo.setCategoria(categoria);
        
        equipo = equipoRepository.save(equipo);

        if (fotoPortada != null && !fotoPortada.isEmpty()) {
            String urlPortada = cloudinaryService.subirImagen(fotoPortada);
            if (urlPortada != null) {
                ImagenEquipo imagenPortada = new ImagenEquipo();
                imagenPortada.setUrlImagen(urlPortada);
                imagenPortada.setEsPortada(true);
                imagenPortada.setEquipo(equipo);
                imagenRepository.save(imagenPortada);
            }
        }

        if (fotosGaleria != null && !fotosGaleria.isEmpty()) {
            for (MultipartFile foto : fotosGaleria) {
                if (foto != null && !foto.isEmpty()) {
                    String urlGaleria = cloudinaryService.subirImagen(foto);
                    if (urlGaleria != null) {
                        ImagenEquipo imagenGaleria = new ImagenEquipo();
                        imagenGaleria.setUrlImagen(urlGaleria);
                        imagenGaleria.setEsPortada(false);
                        imagenGaleria.setEquipo(equipo);
                        imagenRepository.save(imagenGaleria);
                    }
                }
            }
        }

        return equipo;
    }
}
