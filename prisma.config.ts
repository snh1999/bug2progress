import { defineConfig } from 'prisma/config';

export default defineConfig({
  migrations: {
    seed: 'ts-node --require tsconfig-paths/register ./seed.ts',
  },
});
