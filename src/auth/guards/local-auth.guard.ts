import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard is used to authenticate users using the local strategy.
 * It extends the AuthGuard class and uses the 'local' strategy.
 * The 'local' strategy is Passport's built-in strategy for username/password authentication.
 * The guard is used in the AuthController to authenticate users during the login process.
 */

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
