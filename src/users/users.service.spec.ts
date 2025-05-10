import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../auth/constants/roles.enum';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
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

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockRepository.find).toHaveBeenCalled();
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

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne({ where: { id: userId } });

      expect(result).toEqual(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user is not found', async () => {
      const userId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne({ where: { id: userId } });
      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '12345678-1234-1234-1234-123456789012';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        isActive: false,
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        name: 'John Doe',
        roles: [UserRole.USER],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.merge.mockReturnValue(updatedUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRepository.merge).toHaveBeenCalledWith(
        existingUser,
        updateUserDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 'non-existent-id';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '12345678-1234-1234-1234-123456789012';
      const existingUser = {
        id: userId,
        email: 'test@example.com',
        name: 'John Doe',
        roles: [UserRole.USER],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.remove.mockResolvedValue(existingUser);

      await service.remove(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
