-- Script de creación de esquema para PostgreSQL
-- Proyecto: Plataforma de Turismo y Reservas
--
-- Uso recomendado:
-- 1. Crear la base de datos manualmente (ejemplo):
--    CREATE DATABASE proyecto_turismo WITH ENCODING 'UTF8';
-- 2. Conectarse a esa base:
--    \c proyecto_turismo
-- 3. Ejecutar este script:
--    \i db/schema.sql

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos ENUM

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

CREATE TYPE user_language AS ENUM ('ES', 'EN', 'FR');

CREATE TYPE tourism_type AS ENUM ('ECOTURISMO', 'PLAYA', 'CULTURAL', 'AVENTURA');

CREATE TYPE reservation_status AS ENUM (
  'PENDIENTE_EXTERNO',
  'CONFIRMADA_EXTERNA',
  'NO_RESERVADA',
  'CANCELADA'
);

-- Tabla de usuarios

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name          VARCHAR(255)        NOT NULL,
  email              VARCHAR(255)        NOT NULL UNIQUE,
  password_hash      VARCHAR(255)        NOT NULL,
  role               user_role           NOT NULL DEFAULT 'USER',
  phone              VARCHAR(50),
  address            VARCHAR(255),
  document_id        VARCHAR(100),
  country            VARCHAR(100),
  language           user_language       NOT NULL DEFAULT 'ES',
  created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Tabla de sitios turísticos

CREATE TABLE sites (
  id                 SERIAL              PRIMARY KEY,
  name               VARCHAR(255)        NOT NULL, -- idioma por defecto
  description        TEXT                NOT NULL,
  location           VARCHAR(255)        NOT NULL,
  price_per_person   NUMERIC(10, 2)      NOT NULL,
  type               tourism_type        NOT NULL,
  max_capacity       INTEGER             NOT NULL, -- máximo de personas por día
  official_url       VARCHAR(500),
  active             BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Tabla de traducciones de sitios (multilenguaje)

CREATE TABLE site_translations (
  id                 SERIAL              PRIMARY KEY,
  site_id            INTEGER             NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  language           user_language       NOT NULL,
  name               VARCHAR(255)        NOT NULL,
  description        TEXT                NOT NULL,
  location           VARCHAR(255)        NOT NULL,
  created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_site_language UNIQUE (site_id, language)
);

-- Tabla de imágenes de sitios (almacenadas en base de datos)

CREATE TABLE site_images (
  id                     SERIAL          PRIMARY KEY,
  site_id                INTEGER         NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  uploaded_by_user_id    UUID            REFERENCES users(id) ON DELETE SET NULL,
  full_image_data        BYTEA           NOT NULL,
  thumbnail_image_data   BYTEA           NOT NULL,
  mime_type              VARCHAR(100)    NOT NULL,
  created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Tabla de reservas

CREATE TABLE reservations (
  id                     SERIAL              PRIMARY KEY,
  reservation_number     VARCHAR(100)        UNIQUE,  -- se asigna tras el primer guardado (RES-XXXXXX)
  user_id                UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id                INTEGER             NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  reservation_date       DATE                NOT NULL,
  people_count           INTEGER             NOT NULL,
  status                 reservation_status  NOT NULL,
  total_price            NUMERIC(10, 2)      NOT NULL,
  cancellation_reason    TEXT,
  external_booking_url   VARCHAR(500),
  failure_reason_type    VARCHAR(100),
  failure_reason_text    TEXT,
  created_at             TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Tabla de comprobantes de reserva

CREATE TABLE reservation_receipts (
  id             SERIAL          PRIMARY KEY,
  reservation_id INTEGER         NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  file_data      BYTEA           NOT NULL,
  mime_type      VARCHAR(100)    NOT NULL,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Tabla de auditoría

CREATE TABLE audit_logs (
  id             SERIAL          PRIMARY KEY,
  user_id        UUID            REFERENCES users(id) ON DELETE SET NULL,
  entity_name    VARCHAR(100)    NOT NULL,
  entity_id      VARCHAR(100)    NOT NULL,
  action         VARCHAR(50)     NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE, etc.
  before_data    JSONB,
  after_data     JSONB,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Índices recomendados

-- Búsquedas frecuentes de usuarios
CREATE INDEX idx_users_email ON users(email);

-- Búsquedas de sitios por tipo y estado
CREATE INDEX idx_sites_type_active ON sites(type, active);

-- Filtros de reservas por fecha/sitio/estado
CREATE INDEX idx_reservations_site_date ON reservations(site_id, reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_user ON reservations(user_id);

-- Reportes por tipo de turismo
CREATE INDEX idx_sites_type ON sites(type);

