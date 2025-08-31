// config/database.ts (Strapi v5)
export default ({ env }) => {
  const url = env('DATABASE_URL');

  if (url) {
    // Para Render/Neon/Remoto: usa la URL y permite controlar SSL por env
    return {
      connection: {
        client: 'postgres',
        connection: url,
        ssl: env.bool('DATABASE_SSL', true)
          ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) }
          : false,
      },
      pool: { min: 0, max: 10 },
    };
  }

  // Local: sin SSL
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'puntoycoma'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        ssl: false,
      },
    },
  };
};
