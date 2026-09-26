import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const redirect =
      typeof req.query.redirect === 'string' ? req.query.redirect : '/';

    return {
      prompt: 'select_account',
      state: encodeURIComponent(redirect),
    };
  }
}
