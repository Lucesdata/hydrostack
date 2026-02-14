# 🎬 Video Hero Background - Instrucciones

## Ubicación del Video
Coloca tu video en la siguiente ruta:
```
public/videos/plant-hero.mp4
```

## Especificaciones Técnicas

### **Formato Recomendado**
- **Codec**: H.264 (MP4)
- **Resolución**: 1920x1080 (Full HD) o 1280x720 (HD)
- **Aspect Ratio**: 16:9
- **Frame Rate**: 24-30 fps
- **Bitrate**: 2-5 Mbps (para web)
- **Tamaño**: <10 MB (ideal <5 MB)
- **Duración**: 10-30 segundos (loop infinito)
- **Audio**: Remover (muted)

### **Contenido Sugerido**
- ✅ Planta de tratamiento de agua en operación
- ✅ Tomas aéreas (drone) o establisher shots
- ✅ Filtros en funcionamiento (FGDi, FLA)
- ✅ Movimiento lento (smooth panning o zoom)
- ✅ Colores: tonos azules, verdes, industriales

### **Optimización para Web**
Si tu video es muy pesado, comprime con:

#### **Opción 1: FFmpeg (Terminal)**
```bash
ffmpeg -i tu-video-original.mp4 -vcodec h264 -acodec aac -vf "scale=1920:1080" -b:v 3M -an public/videos/plant-hero.mp4
```

#### **Opción 2: Herramientas Online**
- [HandBrake](https://handbrake.fr/) (Desktop)
- [CloudConvert](https://cloudconvert.com/mp4-converter) (Web)
- [Clideo](https://clideo.com/compress-video) (Web)

### **Configuración en el Código**
El video está configurado con:
```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover opacity-50"
  poster="/hero-bg.jpg"
>
  <source src="/videos/plant-hero.mp4" type="video/mp4" />
</video>
```

### **Fallback Automático**
- Si el video no se encuentra, la imagen `hero-bg.jpg` se muestra automáticamente
- El atributo `poster` muestra la imagen mientras carga el video
- Navegadores antiguos sin soporte de video mostrarán la imagen de respaldo

## 🚀 Pasos para Implementar

1. **Prepara tu video** (comprímelo si es necesario)
2. **Copia el archivo** a `public/videos/plant-hero.mp4`
3. **Reinicia el servidor** de desarrollo:
   ```bash
   npm run dev
   ```
4. **Verifica** que el video se reproduce en `http://localhost:3000`

## 📌 Notas
- El video se reproduce en **loop infinito** automáticamente
- La opacidad está al 50% para no competir con el contenido
- El gradiente oscuro ayuda a la legibilidad del texto
- En móvil, considera reducir la resolución o usar solo imagen

## 🎨 Alternativas si no tienes video
Si no tienes un video listo, puedes:
1. Usar la imagen actual (`hero-bg.jpg`) - **ya funciona automáticamente**
2. Buscar stock footage en:
   - [Pexels](https://www.pexels.com/search/videos/water%20treatment%20plant/)
   - [Pixabay](https://pixabay.com/videos/search/water%20treatment/)
   - [Coverr](https://coverr.co/)

---

**¿Necesitas ayuda optimizando tu video? Compártelo y te ayudo con FFmpeg!**
