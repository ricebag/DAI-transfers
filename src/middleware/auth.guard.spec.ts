import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { IsAuthed } from './auth.gaurd';

describe('IsAuthed', () => {
  let guard: IsAuthed;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [IsAuthed],
    }).compile();

    guard = moduleRef.get<IsAuthed>(IsAuthed);
  });

  it('should return true for valid credentials', () => {
    const buffer = Buffer.from('admin:pass').toString('base64');
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Basic ${buffer}`,
          },
        }),
      }),
    } as ExecutionContext;

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBeTruthy();
  });

  it('should throw UnauthorizedException for missing credentials', () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(() => {
      guard.canActivate(context);
    }).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid credentials', () => {
    const buffer = Buffer.from('Invalid:Credentials').toString('base64');
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Basic ${buffer}`,
          },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBeFalsy();
  });
});
