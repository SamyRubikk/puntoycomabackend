// config/server.ts
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: { keys: env.array('APP_KEYS') },

  // 👇 Habilita transferencias remotas y usa tu salt
  transfer: {
    token: { salt: env('TRANSFER_TOKEN_SALT') },
    remote: { enabled: true },
  },
});
