import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    /** HTTP Request: Typically coming from a rest endpoint */
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest().user;
    }
    /** * Graphql Request */
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
