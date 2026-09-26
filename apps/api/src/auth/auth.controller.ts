import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from './roles.decorator';

import { RolesGuard } from './guards/roles.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { CartService } from '../cart/cart.service';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import type { Express } from 'express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Throttle } from '@nestjs/throttler';
interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id);
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(dto);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });

    const guestToken = req.cookies?.guest_token as string | undefined;

    const mergeResult = await this.cartService.mergeGuestCart(
      result.user.id,
      guestToken,
    );

    return {
      access_token: result.access_token,
      user: result.user,
      cartMerge: mergeResult,
    };
  }

  @Post('refresh')
  async refresh(@Request() req: ExpressRequest) {
    const refreshToken = req.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.clearCookie('refresh_token', { path: '/' });
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(
      file.buffer,
      'prolific-store/avatars',
    );

    return this.authService.updateAvatar(
      req.user.id,
      result.secure_url,
      result.public_id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/avatar')
  removeAvatar(@Request() req: AuthenticatedRequest) {
    return this.authService.removeAvatar(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/customers')
  async getCustomers() {
    return this.authService.getCustomers();
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('admin-login')
  async adminLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(dto);

    if (!['ADMIN', 'SUPER_ADMIN'].includes(result.user.role)) {
      throw new UnauthorizedException(
        'This account does not have admin access',
      );
    }

    res.cookie('admin_refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });

    return { access_token: result.access_token, user: result.user };
  }

  @Post('admin-refresh')
  async adminRefresh(@Request() req: ExpressRequest) {
    const refreshToken = req.cookies?.admin_refresh_token as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin-logout')
  async adminLogout(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.clearCookie('admin_refresh_token', { path: '/' });
    return this.authService.logout(req.user.id);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Passport redirects to Google — this body never runs.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request()
    req: ExpressRequest & {
      user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
      query: { state?: string };
    },
    @Res() res: ExpressResponse,
  ) {
    const tokens = await this.authService.generateTokensPublic(req.user);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirect = req.query.state
      ? decodeURIComponent(req.query.state)
      : '/';

    res.redirect(
      `${frontendUrl}/google/callback?access_token=${tokens.access_token}&redirect=${encodeURIComponent(redirect)}`,
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
