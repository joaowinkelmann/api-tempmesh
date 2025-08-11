import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('controllers')
export class ControllersController {
  constructor(private readonly controllersService: ControllersService) {}

  @Post(':meshId')
  async create(
    @Param('meshId') meshId: string,
    @Body() createControllerDto: CreateControllerDto,
    @Request() req,
  ) {
    return this.controllersService.create(
      createControllerDto,
      meshId,
      req.user.sub,
    );
  }

  @Get(':meshId')
  async findAll(@Param('meshId') meshId: string, @Request() req) {
    return this.controllersService.findAll(meshId, req.user.sub);
  }

  @Get(':meshId/:id')
  async findOne(
    @Param('meshId') meshId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.controllersService.findOne(id, meshId, req.user.sub);
  }

  @Patch(':meshId/:id')
  async update(
    @Param('meshId') meshId: string,
    @Param('id') id: string,
    @Body() updateControllerDto: UpdateControllerDto,
    @Request() req,
  ) {
    return this.controllersService.update(
      id,
      updateControllerDto,
      meshId,
      req.user.sub,
    );
  }

  @Delete(':meshId/:id')
  async remove(
    @Param('meshId') meshId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.controllersService.remove(id, meshId, req.user.sub);
  }
}
