# 🚀 Follow Price - Monorepo

Sistema de seguimiento de precios automatizado para hardware, utilizando **NestJS**, **Redis** para comunicación entre microservicios, y **Google Gemini AI** para la normalización de datos.

## 🏗️ Arquitectura del Sistema

El proyecto está diseñado bajo una arquitectura de microservicios para garantizar escalabilidad y separación de responsabilidades:

*   **API Core:** Punto de entrada central. Recibe las URLs de productos, valida la información inicial y gestiona la cola de mensajes en Redis.
*   **Scrapper Service:** El trabajador principal. Escucha eventos de Redis, realiza el web scraping, consume la IA para normalizar datos y gestiona el Cron Job de actualización diaria.
*   **Persistence Lib:** Librería compartida (Shared Library) que centraliza el esquema de Prisma y la lógica de acceso a la base de datos PostgreSQL.

## 🧠 Inteligencia Artificial

Implementamos un pipeline de normalización utilizando **Gemma 3 27B**. El sistema procesa nombres de productos crudos y los estructura en formato JSON para asegurar la consistencia de la base de datos.

- **Input:** `placa-de-video-radeon-rx-7600-8gb-sapphire-pulse-oc`
- **Normalización:** La IA extrae marca, modelo y especificaciones técnicas, eliminando ruido visual y caracteres innecesarios.
- **Formato de salida:** 
  ```json
  {
    "cleanName": "Sapphire Radeon RX 7600",
    "category": "Tarjeta Gráfica",
    "specs": { "capacidad": "8GB", "velocidad": "OC" }
  }

## 🛠️ Instalación y Configuración

Sigue estos pasos para poner en marcha el entorno de desarrollo.

### 1. Requisitos Previos
Asegúrate de tener instalados los siguientes servicios en tu máquina o servidor:
*   **Node.js** (v18 o superior)
*   **PostgreSQL** (Base de datos relacional)
*   **Redis** (Message Broker para la comunicación entre microservicios)

### 2. Clonación y Dependencias
```bash
# Clonar el repositorio
git clone https://github.com/FacundoNSantillan/Follow-Price.git
cd Follow-Price

# Instalar dependencias del monorepo
npm install
```
### 3. Variables de Entorno
Crea un archivo `.env` en la raíz con lo siguiente:
```env
# --- Base de Datos (PostgreSQL) ---
# Cambia 'usuario', 'password' y 'nombre_db' por tus credenciales locales
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db?schema=public"

# --- Comunicación (Redis) ---
# Host y puerto por defecto para el Message Broker
REDIS_HOST="localhost"
REDIS_PORT=6379

# --- Inteligencia Artificial (Google AI Studio) ---
# Consigue tu clave en: https://aistudio.google.com/
GOOGLE_API_KEY="tu_clave_aqui"
# Modelo recomendado para balance velocidad/costo
GOOGLE_MODEL="gemma-3-27b-it"

# --- Aplicación ---
PORT=3000
NODE_ENV="development"
```
### 4. Configuración de Base de Datos y Tipos
```bash
# 1. Generar el cliente de Prisma (crea los tipos en node_modules)
npx prisma generate

# 2. Sincronizar el esquema con la base de datos real
# Usa 'db push' para desarrollo rápido o 'migrate dev' para producción
npx prisma db push

# 3. (Opcional) Abrir el panel visual para verificar los datos
npx prisma studio
```
### 5. Ejecución del Sistema
Como el proyecto es un monorepo, debes iniciar los microservicios en terminales separadas para poder visualizar los logs de cada uno de forma independiente.
```bash
# Terminal 1: API Core (Punto de entrada HTTP)
# Escucha en el puerto configurado (default: 3000)
npm run start:dev:api

# Terminal 2: Scrapper Service (Procesador de eventos)
# Se conecta a Redis para recibir tareas de scraping y normalización
npm run start:dev:scrapper
```
### 6. Verificación del Flujo (Health Check)
Para asegurarte de que los microservicios están comunicados correctamente a través de Redis y la IA, realiza la siguiente prueba:

1. Enviar Petición: Realiza un POST a http://localhost:3000/products. (Actualmente soportado: [FullH4rd](https://fullh4rd.com.ar)).

2. Logs de API Core: Verificación de publicación en la cola de Redis.

3. Logs de Scrapper: Procesamiento de URL y normalización exitosa via Gemma 3.

4. Base de Datos: Verificación de datos estructurados mediante ```npx prisma studio```.

## 📈 Roadmap de Desarrollo

Este proyecto se encuentra en una etapa de desarrollo activo. A continuación se detallan las próximas funcionalidades:

### 🔹 Fase 4: Notificaciones en Tiempo Real
*   [ ] **Integración con Telegram Bot API:** Creación de un bot para recibir alertas instantáneas en el celular.
*   [ ] **Configuración de Umbrales:** Implementar lógica para notificar solo si la baja de precio supera un porcentaje definido (ej. > 5%).
*   [ ] **Alertas por Email:** Uso de Resend para reportes diarios de las mejores ofertas encontradas.

### 🔹 Fase 5: Dashboard & Frontend (Visualización)
*   [ ] **Interfaz en Next.js:** Panel de control para gestionar los productos trackeados y ver sus estados.
*   [ ] **Gráficos de Historial:** Implementación de gráficos de líneas para visualizar la evolución del precio en el tiempo.
*   [ ] **Comparativa entre Tiendas:** Vista unificada de un mismo producto en diferentes proveedores.

### 🔹 Fase 6: Optimización y Escalabilidad
*   [ ] **Nuevas Tiendas Soportadas:** Integración de selectores para [Compra Gamer](https://compragamer.com), [Venex](https://www.venex.com.ar) y [Gezatek](https://www.gezatek.com.ar).
*   [ ] **Resiliencia de Scraping:** Implementación de rotación de *Proxies* y *User-Agents* para evitar bloqueos por IP.
*   [ ] **Renderizado Dinámico:** Soporte para sitios con contenido generado por JavaScript mediante **Puppeteer**.

---
