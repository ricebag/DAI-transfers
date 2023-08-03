import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IsAuthed implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Basic Auth credentials not provided.');
    }

    const encodedCredentials = authorizationHeader.split(' ')[1];
    const [username, password] = Buffer.from(encodedCredentials, 'base64')
      .toString('utf8')
      .split(':');

    return username === 'admin' && password === 'pass';
  }
}
