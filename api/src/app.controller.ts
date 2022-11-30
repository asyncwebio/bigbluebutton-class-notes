import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/v1/token')
  async getToken(): Promise<object> {
    const token: string = await this.appService.getToken();
    if (!token) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return { token };
  }
}
