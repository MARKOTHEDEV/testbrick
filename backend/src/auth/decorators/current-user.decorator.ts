import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthPayload {
  userId: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const auth: AuthPayload = request.auth;

    if (!auth) {
      return null;
    }

    return data ? auth[data] : auth;
  },
);
