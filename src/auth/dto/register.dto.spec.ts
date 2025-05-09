import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should be valid with correct data', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.name = 'Test User';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new RegisterDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';
    dto.name = 'Test User';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail with empty email', async () => {
    const dto = new RegisterDto();
    dto.email = '';
    dto.password = 'password123';
    dto.name = 'Test User';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail with empty password', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = '';
    dto.name = 'Test User';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail with password too short', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = '123';
    dto.name = 'Test User';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should accept any non-empty string as name', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.name = 'A';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept empty string as name (if this is not desired, add @IsNotEmpty() to CreateUserDto)', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.name = '';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
