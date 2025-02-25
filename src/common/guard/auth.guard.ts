import { ResponseCode, ServiceException } from '@common/error';
import { PUBLIC_API_KEY } from '@constants';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpStatusCode } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_SECRET } from '@environment';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new ServiceException(
        ResponseCode.UNAUTHORIZED,
        'unauthorized',
        HttpStatusCode.Unauthorized,
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload['payload'];
    } catch {
      throw new ServiceException(
        ResponseCode.INVALID_USER_TOKEN,
        'token expired',
        HttpStatusCode.Unauthorized,
      );
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
