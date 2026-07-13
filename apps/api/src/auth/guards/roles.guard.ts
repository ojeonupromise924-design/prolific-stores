import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

// 1. Define what your user object looks like to clear the ESLint errors
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 2. Fetch the required roles from the route metadata safely with generics
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    // 3. Typecast the request to your new AuthenticatedRequest interface
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // 4. Safely check if the user exists and has a role before using .includes()
    if (!user || !user.role) {
      return false;
    }

    return roles.includes(user.role);
  }
}
