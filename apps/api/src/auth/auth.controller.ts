import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshDto } from './dto/refresh.dto';
// Import Express Request type to extend it safely
import { Request as ExpressRequest } from 'express';
import { Roles } from './roles.decorator';

import { RolesGuard } from './guards/roles.guard';

// Define the shape of your request containing the authenticated user data
interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminRoute() {
    return {
      message: 'Admin Access',
    };
  }

  @Get('customer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  customerRoute() {
    return {
      message: 'Customer Access',
    };
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(
    @Body()
    dto: RefreshDto,
  ) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Request()
    req: AuthenticatedRequest,
  ) {
    return this.authService.logout(req.user.id);
  }
}
