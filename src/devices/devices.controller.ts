import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ReqReturnDto } from '../auth/dto/req-return.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Device } from './entities/device.entity';

@ApiBearerAuth()
@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Cria um novo dispositivo vinculado ao usuário logado.',
  })
  // @ApiBody() // TODO: Preencher o api body no futuro
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDeviceDto: CreateDeviceDto,
    @Request() req: ReqReturnDto,
  ) {
    return this.devicesService.create(createDeviceDto, req.user.sub);
  }

  @ApiResponse({
    status: 200,
    description: 'Retorna todos os dispositivos do usuário.',
    type: [Device],
  })
  @ApiOperation({ summary: 'Busca todos os dispositivos do usuário logado.' })
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.devicesService.findAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Retorna um dispositivo específico.',
    type: Device,
  })
  @ApiOperation({ summary: 'Busca um dispositivo do usuário logado.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualiza um item pertencente a um usuário.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Request() req: ReqReturnDto,
  ) {
    return this.devicesService.update(id, updateDeviceDto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Deleta um dispositivo pertencente ao usuário logado.',
  })
  async remove(@Param('id') id: string, @Request() req: ReqReturnDto) {
    return this.devicesService.remove(id, req.user.sub);
  }
}
