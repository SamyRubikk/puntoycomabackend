// config/server.ts
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Si despliegas en Render/Vercel, define STRAPI_PUBLIC_URL en el panel
  url: env('STRAPI_PUBLIC_URL'), 
  proxy: true, // útil detrás de proxy (Render)
  app: { keys: env.array('APP_KEYS') },
});
