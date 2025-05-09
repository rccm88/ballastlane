import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    const existingUser = await this.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(options?: FindOneOptions<User>) {
    return this.usersRepository.find(options);
  }

  async findOne(options: FindOneOptions<User>) {
    return this.usersRepository.findOne(options);
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedEntity = this.usersRepository.merge(user, updateUserDto);

    return this.usersRepository.save(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
  }
}
