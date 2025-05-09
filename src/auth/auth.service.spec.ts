import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './constants/roles.enum';
import * as bcrypt from 'bcrypt';

// UUID v4 regex pattern
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Sample user data that our mock service will return
  // This is what we expect a real database would return
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID v4
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    roles: [UserRole.USER],
    isActive: true,
  };

  // Create mock implementations of the services that AuthService depends on
  // Instead of using real services that would talk to a database or generate real JWT tokens,
  // we create empty functions (jest.fn()) that we can program to return specific values
  const mockUsersService = {
    // jest.fn() creates an empty function that:
    // 1. Records all calls made to it
    // 2. Can be configured to return specific values
    // 3. Allows us to verify how it was called
    findOne: jest.fn(), // Will mock the database query
    create: jest.fn(), // Will mock user creation
  };

  const mockJwtService = {
    sign: jest.fn(), // Will mock JWT token generation
  };

  beforeEach(async () => {
    // Create a test module that uses our mock services instead of real ones
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // When AuthService asks for UsersService, give it our mock instead
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          // When AuthService asks for JwtService, give it our mock instead
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    // Get instances of our services from the test module
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // Reset all mock functions after each test
  // This ensures each test starts with a clean slate
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user object without password when credentials are valid', async () => {
      // Program our mock findOne to return the mockUser when called
      // This simulates a successful database lookup
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Program bcrypt.compare to always return true
      // This simulates a successful password verification
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      // Call the service with test credentials
      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // Verify the result matches what we expect
      const { password, ...expectedResult } = mockUser;
      expect(result).toEqual(expectedResult);

      // Verify that findOne was called with the correct parameters
      // This ensures our service is making the right database query
      expect(usersService.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user is not found', async () => {
      // Program our mock to return null, simulating no user found in database
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(usersService.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should return null when password is invalid', async () => {
      // Program our mock to return a user, but make password verification fail
      mockUsersService.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(usersService.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('login', () => {
    it('should return JWT access token', async () => {
      // Program our mock JWT service to return a fake token
      const mockToken = 'jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      // Verify we got the token we programmed
      expect(result).toEqual({ access_token: mockToken });

      // Verify the JWT service was called with the correct user data
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        roles: mockUser.roles,
      });
    });
  });

  describe('register', () => {
    // Test data for registration
    const registerData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should create a new user with default USER role and valid UUID', async () => {
      // Program our mock to return a new user with our test data
      const createdUser = {
        ...registerData,
        id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID v4
        roles: [UserRole.USER],
        isActive: true,
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(
        registerData.email,
        registerData.password,
        registerData.name,
      );

      // Verify the response structure and data
      expect(result).toMatchObject({
        email: registerData.email,
        name: registerData.name,
        roles: [UserRole.USER],
        isActive: true,
      });

      // Verify the ID is a valid UUID
      expect(result.id).toMatch(UUID_PATTERN);

      // Verify the create method was called with the correct user data
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        roles: [UserRole.USER],
      });

      // Verify the create method was called exactly once
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should not include password in the returned user object', async () => {
      // Program our mock to return a new user
      const createdUser = {
        ...registerData,
        id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID v4
        roles: [UserRole.USER],
        isActive: true,
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(
        registerData.email,
        registerData.password,
        registerData.name,
      );

      // Verify password is excluded from the response
      expect(result).not.toHaveProperty('password');

      // Verify the structure of the returned object
      expect(result).toEqual({
        id: createdUser.id,
        email: registerData.email,
        name: registerData.name,
        roles: [UserRole.USER],
        isActive: true,
      });

      // Verify the ID is a valid UUID
      expect(result.id).toMatch(UUID_PATTERN);
    });
  });
});
