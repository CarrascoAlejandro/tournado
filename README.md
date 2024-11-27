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


## Brackets Model

```ts
/*-----------------------------------------------------------------|
 * Contains the types which are persisted in the chosen storage.
 *----------------------------------------------------------------*/

import { StageSettings } from './input';
import { MatchResults } from './other';
import { Id, StageType } from './unions';

/**
 * A participant of a stage (team or individual).
 */
export interface Participant {
    /** ID of the participant. */
    id: Id,

    /** ID of the tournament this participant belongs to. */
    tournament_id: Id,

    /** Name of the participant. */
    name: string,
}

/**
 * A stage, which can be a round-robin stage or a single/double elimination stage.
 */
export interface Stage {
    /** ID of the stage. */
    id: Id,

    /** ID of the tournament this stage belongs to. */
    tournament_id: Id,

    /** Name of the stage. */
    name: string,

    /** Type of the stage. */
    type: StageType,

    /** Settings of the stage. */
    settings: StageSettings,

    /** The number of the stage in its tournament. */
    number: number,
}

/**
 * A group of a stage.
 */
export interface Group {
    /** ID of the group. */
    id: Id,

    /** ID of the parent stage. */
    stage_id: Id,

    /** The number of the group in its stage. */
    number: number,
}

// The next levels don't have a `name` property. They are automatically named with their `number` and their context (parent levels).

/**
 * A round of a group.
 */
export interface Round {
    /** ID of the round. */
    id: Id,

    /** ID of the parent stage. */
    stage_id: Id,

    /** ID of the parent group. */
    group_id: Id,

    /** The number of the round in its group. */
    number: number,
}

/**
 * A match of a round.
 */
export interface Match extends MatchResults {
    /** ID of the match. */
    id: Id,

    /** ID of the parent stage. */
    stage_id: Id,

    /** ID of the parent group. */
    group_id: Id,

    /** ID of the parent round. */
    round_id: Id,

    /** The number of the match in its round. */
    number: number,

    /** The count of match games this match has. Can be `0` if it's a simple match, or a positive number for "Best Of" matches. */
    child_count: number,
}

/**
 * A game of a match.
 */
export interface MatchGame extends MatchResults {
    /** ID of the match game. */
    id: Id,

    /** ID of the parent stage. */
    stage_id: Id,

    /** ID of the parent match. */
    parent_id: Id,

    /** The number of the match game in its parent match. */
    number: number,
}
```