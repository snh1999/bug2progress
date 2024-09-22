import { RegisterDto } from '@/auth/dto';
import { faker } from '@faker-js/faker/.';

export const getRegisterDto = (): RegisterDto => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.person.fullName(),
  username: faker.internet.userName(),
  photo: '',
  country: faker.location.country(),
});
