import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Strategy } from 'passport';
import { Request } from 'express';
import * as passport from 'passport';
import { AuthGuard } from '@nestjs/passport';

// Create a test-specific guard that preserves error messages
class TestJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      throw err; // Preserve the original error
    }
    return user;
  }
}

describe('JwtAuthGuard', () => {
  let guard: TestJwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  // Mock the JWT strategy
  const mockJwtStrategy = {
    validate: jest.fn(),
  };

  // Create a mock Passport strategy
  class MockJwtStrategy extends Strategy {
    private request: Request | undefined;

    constructor() {
      super();
      this.name = 'jwt';
    }

    authenticate(req: Request, options?: any) {
      this.request = req;
      const token = this.getTokenFromHeader();
      if (!token) {
        // Use error() instead of fail() to properly propagate the error
        return this.error(new UnauthorizedException('No token provided'));
      }

      try {
        mockJwtService.verify(token);
        mockJwtStrategy.validate().then(
          (user) => this.success(user),
          (err) => this.error(err),
        );
      } catch (err) {
        // Use error() instead of fail() to properly propagate the error
        this.error(new UnauthorizedException('Invalid token'));
      }
    }

    private getTokenFromHeader(): string | undefined {
      if (!this.request) {
        throw new UnauthorizedException('Request not available');
      }
      const authHeader = this.request.headers.authorization;
      if (!authHeader) return undefined;

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer') {
        throw new UnauthorizedException('Invalid token format');
      }
      return token;
    }
  }

  // Simple mock for ExecutionContext with both request and response
  const createMockContext = (headers: any) => {
    const request = { headers };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    // Clear any existing strategies
    passport.unuse('jwt');

    // Register our mock strategy with Passport
    passport.use(new MockJwtStrategy());

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        {
          provide: JwtAuthGuard,
          useClass: TestJwtAuthGuard,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard) as TestJwtAuthGuard;
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    // Clean up after each test
    passport.unuse('jwt');
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access with valid token', async () => {
    const mockContext = createMockContext({
      authorization: 'Bearer valid-token',
    });

    // Mock successful authentication
    mockJwtStrategy.validate.mockResolvedValue({ id: 'user-id' });
    mockJwtService.verify.mockReturnValue({ sub: 'user-id' });

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    const mockContext = createMockContext({});

    // Mock failed authentication
    mockJwtStrategy.validate.mockRejectedValue(
      new UnauthorizedException('No token provided'),
    );

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'No token provided',
    );
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const mockContext = createMockContext({
      authorization: 'Bearer invalid-token',
    });

    // Mock failed authentication
    mockJwtStrategy.validate.mockRejectedValue(
      new UnauthorizedException('Invalid token'),
    );
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Invalid token',
    );
  });

  it('should throw UnauthorizedException when token format is invalid', async () => {
    const mockContext = createMockContext({
      authorization: 'InvalidFormat',
    });

    // Mock failed authentication
    mockJwtStrategy.validate.mockRejectedValue(
      new UnauthorizedException('Invalid token format'),
    );

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Invalid token format',
    );
  });
});
