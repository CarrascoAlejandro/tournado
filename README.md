# Tournado

## Instrucciones para levantar

1. Dependencias globales

Este proyecto fue desarrollado con nextJs, por lo que para levantarlo es necesario tener instalado nodeJs y **pnpm**.

```bash
npm i -g pnpm
```

2. Vercel

Este proyecto fue desplegado en Vercel, aunque de momento solo yo tengo acceso a la configuración del proyecto, por lo que si deseas levantarlo en tu máquina local, necesitarás instalar Vercel CLI.

```bash
npm i -g vercel
```

3. configuración del environment

Este proyecto utiliza variables de entorno, por lo que es necesario crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
POSTGRES_URL="**********"
POSTGRES_PRISMA_URL="**********"
POSTGRES_URL_NO_SSL="**********"
POSTGRES_URL_NON_POOLING="**********"
POSTGRES_USER="default"
POSTGRES_HOST="************"
POSTGRES_PASSWORD="**********"
POSTGRES_DATABASE="******************"

NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=**********

# https://authjs.dev/getting-started/providers/github
AUTH_GITHUB_ID=**********
AUTH_GITHUB_SECRET=**********
```	

Para usar la base de datos compartida escribeme para que te proporcione las variables de entorno. Sino puedes usar tu propia base de datos.

4. Levantar el proyecto

Antes no olvides verificar que tengas todas las dependencias instaladas con el siguiente comando:

```bash
pnpm install
```

El proyecto se puede levantar con el siguiente comando:

```bash
pnpm dev
```
