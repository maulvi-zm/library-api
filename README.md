# Library API

A modern RESTful API for managing library books, built with Elysia framework and Bun runtime. Features include CRUD operations for books, static token authentication, and OpenAPI documentation.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Framework**: [Elysia](https://elysiajs.com) - Fast web framework for Bun
- **Database**: PostgreSQL 16
- **ORM**: [Drizzle ORM](https://orm.drizzle.team) - Type-safe SQL ORM
- **API Documentation**: OpenAPI/Swagger
- **Code Quality**: Biome (linting & formatting)
- **Testing**: Bun test with PGLite

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- PostgreSQL 16 (or use Docker Compose)
- Docker & Docker Compose (optional, for containerized deployment)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd library-api
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
DATABASE_URL=postgresql://library:library_password@localhost:5432/library_db
NODE_ENV=development
STATIC_TOKEN=your_secret_token_here
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NODE_ENV` | Environment (development/production/test) | No | development |
| `STATIC_TOKEN` | Bearer token for authentication | Yes | - |

### NODE_ENV Behavior

The application adjusts its behavior based on the `NODE_ENV` setting:

**Development** (default):
- OpenAPI documentation enabled at `/swagger`
- Permissive CORS policy (allows all origins)
- Verbose logging (info, warn, error, debug)
- Database connection pool: 10 max connections

**Production**:
- OpenAPI documentation **disabled** (security)
- Strict CORS policy (only `*.example.com` domains)
- Minimal logging (warn and error only)
- Optimized database pool: 20 max connections, 20s idle timeout

**Test**:
- All logging disabled
- Permissive CORS policy
- Minimal database connections (1 connection)

## Database Setup

### Using Local PostgreSQL

1. Create a database:

```bash
createdb library_db
```

2. Generate migration files:

```bash
bun run db:generate
```

3. Run migrations:

```bash
bun run db:migrate
```

4. Seed the database (optional):

```bash
bun run db:seed
```

### Using Docker Compose

1. Start PostgreSQL:

```bash
docker-compose up postgres -d
```

2. Run migrations:

```bash
bun run db:push
```

3. Seed the database (optional):

```bash
bun run db:seed
```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
bun run dev
```

The API will be available at `http://localhost:3000`

### Using Docker Compose

Run the entire stack (PostgreSQL + API):

```bash
docker-compose up -d
```

## API Documentation

OpenAPI/Swagger documentation is automatically generated and available at:

- Swagger UI: `http://localhost:3000/openapi`

## Testing

Run the test suite:

```bash
bun test
```

The test suite includes:

- Authentication middleware tests
- Book service unit tests
- Book API integration tests

## Development Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun test` | Run test suite |
| `bun run db:generate` | Generate migration files from schema |
| `bun run db:migrate` | Run database migrations |
| `bun run db:push` | Push schema changes directly to database |
| `bun run db:seed` | Seed database with sample data |
| `bun run db:studio` | Open Drizzle Studio (database GUI) |
| `bun run lint:check` | Check code with Biome linter |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code with Biome |

## Database Schema

### Books Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | Primary Key |
| name | varchar(255) | Not Null, Unique |
| author | varchar(255) | Not Null |
| publishedYear | integer | Nullable |
| description | text | Nullable |
| createdAt | timestamp | Not Null, Default: now() |
| updatedAt | timestamp | Not Null, Default: now() |
