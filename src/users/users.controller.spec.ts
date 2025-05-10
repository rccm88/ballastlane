import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../auth/constants/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        roles: [UserRole.USER],
        isActive: true,
      };

      const expectedUser = {
        id: '12345678-1234-1234-1234-123456789012',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          id: '12345678-1234-1234-1234-123456789012',
          email: 'test1@example.com',
          name: 'John Doe',
          roles: [UserRole.USER],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '12345678-1234-1234-1234-123456789013',
          email: 'test2@example.com',
          name: 'Jane Smith',
          roles: [UserRole.ADMIN],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const userId = '12345678-1234-1234-1234-123456789012';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'John Doe',
        roles: [UserRole.USER],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 'non-existent-id';

      mockUsersService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '12345678-1234-1234-1234-123456789012';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        isActive: false,
      };

      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        ...updateUserDto,
        roles: [UserRole.USER],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '12345678-1234-1234-1234-123456789012';

      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });
});
