import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  migrations: {
    seed: 'ts-node --require tsconfig-paths/register prisma/seed.ts',
  },
});
