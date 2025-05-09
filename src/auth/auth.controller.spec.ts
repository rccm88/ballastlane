import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from './constants/roles.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  // Mock data for testing
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    name: 'Test User',
    roles: [UserRole.USER],
    isActive: true,
  };

  const mockLoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterDto = {
    email: 'new@example.com',
    password: 'password123',
    name: 'New User',
  };

  const mockToken = { access_token: 'jwt-token' };

  // Create mock implementations of the services
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return a JWT token', async () => {
      // Program our mocks
      mockUsersService.create.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockToken);

      // Call the controller
      const result = await controller.register(mockRegisterDto);

      // Verify the result
      expect(result).toEqual(mockToken);

      // Verify the services were called correctly
      expect(usersService.create).toHaveBeenCalledWith(mockRegisterDto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(usersService.create).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle user creation errors', async () => {
      // Program our mock to simulate a database error
      const error = new Error('Database error');
      mockUsersService.create.mockRejectedValue(error);

      // Verify the error is propagated
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(error);

      // Verify the services were called
      expect(usersService.create).toHaveBeenCalledWith(mockRegisterDto);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      // Program our mocks
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockToken);

      // Call the controller
      const result = await controller.login(mockLoginDto);

      // Verify the result
      expect(result).toEqual(mockToken);

      // Verify the services were called correctly
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Program our mock to simulate invalid credentials
      mockAuthService.validateUser.mockResolvedValue(null);

      // Verify the correct exception is thrown
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      // Verify the services were called correctly
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Program our mock to simulate a validation error
      const error = new Error('Validation error');
      mockAuthService.validateUser.mockRejectedValue(error);

      // Verify the error is propagated
      await expect(controller.login(mockLoginDto)).rejects.toThrow(error);

      // Verify the services were called
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
