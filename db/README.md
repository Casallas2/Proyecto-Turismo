# Base de datos - Proyecto Turismo

PostgreSQL para el backend. El backend espera:

- **Host:** localhost  
- **Puerto:** 5432  
- **Usuario:** postgres  
- **Contraseña:** 123456  
- **Base de datos:** proyecto_turismo  

---

## Opción 1: Docker (recomendado)

Desde la **raíz del proyecto**:

```bash
docker compose up -d
```

La primera vez se crea la base de datos `proyecto_turismo` y se aplica automáticamente `db/schema.sql`. Cuando el contenedor esté en marcha, arranca el backend:

```bash
cd backend
npm run start:dev
```

Para parar la base de datos:

```bash
docker compose down
```

Los datos se guardan en el volumen `postgres_data`. Si quieres empezar de cero (borrar datos y volver a crear tablas):

```bash
docker compose down -v
docker compose up -d
```

---

## Opción 2: PostgreSQL instalado en el equipo

1. Crea la base de datos (en `psql` o pgAdmin):

   ```sql
   CREATE DATABASE proyecto_turismo WITH ENCODING 'UTF8';
   ```

2. Aplica el esquema. Desde la raíz del proyecto, en una terminal:

   ```bash
   psql -U postgres -d proyecto_turismo -f db/schema.sql
   ```

   (Te pedirá la contraseña del usuario `postgres`.)

3. Asegúrate de que el usuario `postgres` tenga contraseña `123456`, o cambia la contraseña en `backend/src/app.module.ts` (o en un `.env` si lo usas).

Luego arranca el backend:

```bash
cd backend
npm run start:dev
```
