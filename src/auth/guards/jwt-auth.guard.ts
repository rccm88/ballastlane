import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard is used to authenticate users using the JWT strategy.
 * It extends the AuthGuard class and uses the 'jwt' strategy.
 * The 'jwt' strategy validates the JWT token from the Authorization header.
 * This guard is used to protect routes that require authentication.
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
