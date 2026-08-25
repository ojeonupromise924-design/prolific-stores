import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      const authenticated = await super.canActivate(context);

      if (authenticated) {
        return true;
      }
    } catch {
      // Continue as guest
    }

    let guestToken = request.cookies?.guest_token as string | undefined;

    if (!guestToken) {
      guestToken = randomBytes(32).toString('hex');

      response.cookie('guest_token', guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    (request as Request & { guestToken?: string }).guestToken = guestToken;

    return true;
  }
}
