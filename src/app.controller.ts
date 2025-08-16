import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @Redirect('/tempmesh/api/docs', 302)
  getHello() {
    // return this.appService.getHello();
    // Agora redireciona para a documentação em /docs
  }
}
