import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtPayload } from './interfaces/jwt-payload.interface';

import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { randomBytes, createHash } from 'crypto';
import { MailService } from '../mail/mail.service';
import { resetPasswordTemplate } from '../mail/templates/reset-password.template';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google Sign-In. Please continue with Google.',
      );
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      this.logger.warn(`Failed login attempt for ${data.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      // Added <JwtPayload> generic here to strictly type the returned payload
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      // If user is deleted or token doesn't match the DB
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      // Cast error to safely access .message
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Refresh Token Error:', errorMessage);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string,
    avatarPublicId: string,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl, avatarPublicId },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async removeAvatar(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null, avatarPublicId: null },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async getCustomers() {
    const users = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
    }));
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: string;
  }) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '30d' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (user) {
        // Existing email/password account — link Google to it.
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            googleId: profile.googleId,
            emailVerified: true,
          },
        });
      }
    }

    return user;
  }

  async generateTokensPublic(user: {
    id: string;
    email: string;
    role: string;
  }) {
    return this.generateTokens(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return the same generic response, whether or not the
    // email exists — prevents leaking which emails are registered.
    const genericResponse = {
      message:
        'If an account exists for that email, a reset link has been sent.',
    };

    if (!user) {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    void this.mailService.send({
      to: user.email,
      subject: 'Reset your Prolific Store password',
      html: resetPasswordTemplate({ firstName: user.firstName, resetUrl }),
    });

    return genericResponse;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'This reset link is invalid or has expired.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null, // sign out of all existing sessions for security
      },
    });

    return { message: 'Password reset successfully. Please log in.' };
  }
}
