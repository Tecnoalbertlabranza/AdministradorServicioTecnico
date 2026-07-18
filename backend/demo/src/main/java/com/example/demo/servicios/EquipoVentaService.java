package com.example.demo.servicios;

import com.example.demo.modelos.*;
import com.example.demo.repositorios.*;
import com.example.demo.dto.EquipoVentaRequestDTO;
import com.example.demo.dto.EquipoVentaResponseDTO;
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
    private final VentaRepository ventaRepository;

    @Transactional
    public EquipoVentaResponseDTO crearEquipo(EquipoVentaRequestDTO dto, MultipartFile fotoPortada, List<MultipartFile> fotosGaleria) throws IOException {
        
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

        return mapearADto(equipo);
    }

    @Transactional
    public EquipoVentaResponseDTO venderEquipo(Long id, com.example.demo.dto.VentaRequestDTO request) {
        EquipoVenta equipo = equipoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipo no encontrado con ID: " + id));

        if (equipo.getEstadoInventario() == EstadoInventarioVenta.VENDIDO) {
            throw new RuntimeException("El equipo ya se encuentra vendido");
        }

        equipo.setEstadoInventario(EstadoInventarioVenta.VENDIDO);
        equipo = equipoRepository.save(equipo);

        Venta venta = new Venta();
        venta.setTipoVenta("EQUIPO");
        venta.setDetalle(equipo.getTitulo());
        venta.setPrecioVenta(request.getPrecioVenta());
        venta.setCostoAsociado((equipo.getCostoCompra() != null ? equipo.getCostoCompra().intValue() : 0) + 
                               (equipo.getCostoReacondicionamiento() != null ? equipo.getCostoReacondicionamiento().intValue() : 0));
        venta.setMetodoPago(request.getMetodoPago());
        venta.setCanal(request.getCanal() != null ? request.getCanal() : "Local");
        venta.setEquipoVenta(equipo);
        
        ventaRepository.save(venta);

        return mapearADto(equipo);
    }

    @Transactional(readOnly = true)
    public List<EquipoVentaResponseDTO> obtenerTodos() {
        return equipoRepository.findAll().stream()
                .map(this::mapearADto)
                .toList();
    }

    private EquipoVentaResponseDTO mapearADto(EquipoVenta equipo) {
        EquipoVentaResponseDTO dto = new EquipoVentaResponseDTO();
        dto.setId(equipo.getId());
        dto.setTitulo(equipo.getTitulo());
        dto.setEspecificaciones(equipo.getEspecificaciones());
        dto.setPrecioVenta(equipo.getPrecioVenta());
        dto.setCondicionEstetica(equipo.getCondicionEstetica());
        dto.setCostoCompra(equipo.getCostoCompra());
        dto.setCostoReacondicionamiento(equipo.getCostoReacondicionamiento());
        dto.setEstadoInventario(equipo.getEstadoInventario());
        
        if (equipo.getCategoria() != null) {
            dto.setNombreCategoria(equipo.getCategoria().getNombre());
        }

        if (equipo.getImagenes() != null) {
            List<com.example.demo.dto.ImagenEquipoDTO> imagenesDTO = equipo.getImagenes().stream()
                    .map(img -> {
                        com.example.demo.dto.ImagenEquipoDTO imgDTO = new com.example.demo.dto.ImagenEquipoDTO();
                        imgDTO.setId(img.getId());
                        imgDTO.setUrlImagen(img.getUrlImagen());
                        imgDTO.setEsPortada(img.isEsPortada());
                        return imgDTO;
                    }).toList();
            dto.setImagenes(imagenesDTO);
        }

        return dto;
    }
}
