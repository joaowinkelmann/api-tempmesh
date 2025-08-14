import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDeviceDto: CreateDeviceDto, @Request() req) {
    return this.devicesService.create(createDeviceDto, req.user.sub);
  }

  @Get()
  async findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Request() req,
  ) {
    return this.devicesService.update(id, updateDeviceDto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.devicesService.remove(id, req.user.sub);
  }
}
