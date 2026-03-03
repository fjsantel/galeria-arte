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

-- 3. Crear políticas de acceso (permitir lectura pública, escritura autenticada)
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

-- NOTA: Después de verificar que la migración fue exitosa,
-- puedes opcionalmente eliminar la columna imagen_url de la tabla obras:
-- ALTER TABLE obras DROP COLUMN imagen_url;
-- (Por ahora la dejamos por compatibilidad)
