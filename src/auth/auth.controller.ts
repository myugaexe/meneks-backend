import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: any) {
    console.log('>>> SIGNUP request', body);
    const { nomorInduk ,name, email, password } = body;
    return this.authService.signup(nomorInduk, name, email, password);
  }

  @Post('signin')
  signin(@Body() body: any) {
    console.log('>>> SIGNIN request', body);
    const { email, password } = body;
    return this.authService.signin(email, password);
  }
}
