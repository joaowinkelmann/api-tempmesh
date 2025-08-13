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
    // Optionally, you can associate the device with the user's mesh here
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }
}
