import { getRegisterDto } from '../auth/auth.test-data';
import request from 'supertest';
import { THttpServer } from '../utils/types';

export async function getAccessToken(httpServer: THttpServer) {
  const {
    body: { data },
  } = await request(httpServer).post('/register').send(getRegisterDto());

  return data.token;
}
