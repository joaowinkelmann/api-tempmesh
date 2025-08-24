import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Redireciona para a documentação da API. (Essa página)',
  })
  @Redirect('/tempmesh/api/docs', 302)
  getHello() {
    // return this.appService.getHello();
    // Agora redireciona para a documentação em /docs
  }
}
