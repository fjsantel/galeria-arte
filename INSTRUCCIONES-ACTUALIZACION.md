# Instrucciones de Actualización - Galería de Arte

## ✨ Nuevas Funcionalidades Implementadas

### 1. **Landing Page** ([index.html](index.html))
   - **Carrusel de imágenes**: Muestra automáticamente las últimas 6 obras agregadas
   - **Información de la galería**: Secciones con historia, misión, colección, servicios y contacto
   - **Scroll suave**: Navegación entre secciones
   - **Responsive**: Adaptado para móviles y tablets

### 2. **Página de Obras Mejorada** ([obras.html](obras.html))
   - **Agrupación por artistas**: Las obras se organizan automáticamente por artista
   - **Múltiples imágenes por obra**: Cada obra puede tener hasta 10 imágenes
   - **Lightbox/Zoom**: Click en cualquier imagen para ampliarla
   - **Miniaturas**: Vista previa de las primeras 5 imágenes de cada obra
   - **Navegación con teclado**: Usa ← → para navegar entre imágenes, ESC para cerrar

### 3. **Panel de Administración Mejorado** ([admin.html](admin.html))
   - **Subida múltiple de imágenes**: Selecciona hasta 10 imágenes al agregar una obra
   - **Progreso de subida**: Indicador visual del progreso de carga
   - **Primera imagen principal**: La primera imagen seleccionada es la principal

---

## 🗄️ PASO IMPORTANTE: Actualizar Base de Datos

**DEBES ejecutar el siguiente SQL en Supabase para que las múltiples imágenes funcionen:**

### Opción 1: SQL Editor en Supabase

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. En el menú lateral, selecciona **SQL Editor**
3. Copia y pega el contenido del archivo [database-update.sql](database-update.sql)
4. Haz click en **Run** para ejecutar

### Opción 2: Copiar el SQL directamente

```sql
-- ACTUALIZACIÓN DE BASE DE DATOS PARA MÚLTIPLES IMÁGENES POR OBRA

-- 1. Crear tabla para imágenes de obras (relación uno a muchos)
CREATE TABLE IF NOT EXISTS obra_imagenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
  imagen_url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Habilitar Row Level Security
ALTER TABLE obra_imagenes ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de acceso
CREATE POLICY "Permitir lectura pública de imágenes"
  ON obra_imagenes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción autenticada"
  ON obra_imagenes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización autenticada"
  ON obra_imagenes FOR UPDATE
  USING (true);

CREATE POLICY "Permitir eliminación autenticada"
  ON obra_imagenes FOR DELETE
  USING (true);

-- 4. Migrar imágenes existentes de la tabla obras a obra_imagenes
INSERT INTO obra_imagenes (obra_id, imagen_url, orden, es_principal)
SELECT id, imagen_url, 0, true
FROM obras
WHERE imagen_url IS NOT NULL AND imagen_url != '';
```

---

## 📋 Estructura de Archivos

```
pagina/
├── index.html                    # Landing page con carrusel
├── obras.html                    # Catálogo de obras (agrupado por artista)
├── admin.html                    # Panel de administración
├── style.css                     # Estilos completos
├── cart.js                       # Funcionalidad del carrito
├── config.js                     # Configuración de Supabase
├── database-update.sql           # SQL para actualizar la base de datos
└── INSTRUCCIONES-ACTUALIZACION.md # Este archivo
```

---

## 🚀 Cómo Usar las Nuevas Funcionalidades

### Agregar una obra con múltiples imágenes:

1. Ve a [admin.html](admin.html)
2. Inicia sesión con la contraseña de admin
3. En el formulario "Agregar Nueva Obra":
   - Completa todos los campos
   - En **Imágenes**, haz click y selecciona múltiples archivos (Ctrl/Cmd + Click)
   - La primera imagen será la principal
   - Click en "AGREGAR OBRA"

### Ver las obras en la galería pública:

1. Ve a [obras.html](obras.html)
2. Las obras están agrupadas por artista
3. Haz click en la imagen principal para ampliarla
4. Usa las miniaturas para ver otras imágenes
5. En el lightbox:
   - Usa las flechas ← → para navegar
   - Presiona ESC para cerrar
   - Haz click fuera de la imagen para cerrar

---

## 🎨 Navegación del Sitio

- **[index.html](index.html)**: Página de inicio con carrusel e información
- **[obras.html](obras.html)**: Catálogo completo con carrito de compras
- **[admin.html](admin.html)**: Panel de administración

---

## ⚠️ Notas Importantes

1. **Compatibilidad**: Las obras antiguas (con una sola imagen) seguirán funcionando perfectamente
2. **Migración automática**: El script SQL migra las imágenes existentes a la nueva tabla
3. **Sin pérdida de datos**: La columna `imagen_url` en la tabla `obras` se mantiene por compatibilidad
4. **Límite de imágenes**: Máximo 10 imágenes por obra (configurable en admin.html línea 159)

---

## 🐛 Solución de Problemas

### Las múltiples imágenes no aparecen:
- Verifica que ejecutaste el SQL en Supabase
- Revisa la consola del navegador (F12) para ver errores
- Confirma que el bucket `imagenes` existe en Supabase Storage

### El lightbox no funciona:
- Asegúrate de que la obra tiene imágenes en la tabla `obra_imagenes`
- Verifica que los estilos CSS se cargaron correctamente

### Error al subir imágenes:
- Verifica los permisos del bucket en Supabase Storage
- Confirma que las credenciales en [config.js](config.js) son correctas

---

## 📞 Contacto

Si tienes problemas o necesitas ayuda, verifica:
- Consola del navegador (F12 → Console)
- Network tab para ver errores de API
- Supabase Dashboard para revisar datos

---

**¡Tu galería de arte está lista para mostrar múltiples imágenes por obra!** 🎨✨
