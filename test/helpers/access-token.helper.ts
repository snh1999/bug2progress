import { getRegisterDto } from '../auth/auth.test-data';
import request from 'supertest';
import { THttpServer } from '../utils/types';

export async function getAccessToken(
  httpServer: THttpServer,
  dto: any = getRegisterDto(),
): Promise<string> {
  const {
    body: { data },
  } = await request(httpServer).post('/register').send(dto);

  return data.token;
}
