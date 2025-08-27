// config/database.ts
export default ({ env }) => {
  const isProd = env('NODE_ENV') === 'production';
  const client = env('DATABASE_CLIENT', 'sqlite'); // 'postgres' o 'sqlite' según tu .env local

  // --- Producción (Render) ---
  if (isProd || env('DATABASE_URL')) {
    // En Render define DATABASE_URL, idealmente con '?sslmode=require'
    // y además habilitamos SSL relajado para evitar el error de cert self-signed.
    const sslEnabled = env.bool('DATABASE_SSL', true);
    const rejectUnauthorized = env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false);

    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: env('DATABASE_URL'),
          ssl: sslEnabled ? { rejectUnauthorized } : false,
        },
        pool: { min: 0, max: 10 },
        acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
      },
    };
  }

  // --- Desarrollo/local ---
  if (client === 'postgres') {
    // Tu Postgres local con variables separadas
    const sslEnabled = env.bool('DATABASE_SSL', false);
    const rejectUnauthorized = env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true);

    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST', '127.0.0.1'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'postgres'),
          password: env('DATABASE_PASSWORD', ''),
          ssl: sslEnabled ? { rejectUnauthorized } : false,
        },
        pool: { min: 0, max: 10 },
        acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
      },
    };
  }

  // SQLite por defecto (si en tu .env local tienes DATABASE_CLIENT=sqlite)
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: env('DATABASE_FILENAME', '.tmp/data.db'),
      },
      useNullAsDefault: true,
    },
  };
};
