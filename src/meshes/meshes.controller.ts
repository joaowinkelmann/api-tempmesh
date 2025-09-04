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
import { MeshesService } from './meshes.service';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ZonesService } from '../zones/zones.service';
import { ReqReturnDto } from '../auth/dto/req-return.dto';
import { DevicesService } from '../devices/devices.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Mesh } from './entities/mesh.entity';
import { Zone } from '../zones/entities/zone.entity';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Meshes')
@Controller('meshes')
export class MeshesController {
  constructor(
    private readonly meshesService: MeshesService,
    private readonly zonesService: ZonesService,
    private readonly devicesService: DevicesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova Mesh para o usuário autenticado.' })
  @ApiBody({ type: CreateMeshDto })
  @ApiResponse({
    status: 201,
    description: 'Mesh criada com sucesso.',
    type: Mesh,
  })
  create(@Body() createMeshDto: CreateMeshDto, @Request() req: ReqReturnDto) {
    return this.meshesService.create(createMeshDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as meshes do usuário autenticado.' })
  @ApiResponse({
    status: 200,
    description: 'Lista de meshes.',
    type: [Mesh],
  })
  findAll(@Request() req: ReqReturnDto) {
    return this.meshesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma mesh específica do usuário.' })
  @ApiParam({ name: 'id', description: 'ID da mesh.' })
  @ApiResponse({
    status: 200,
    description: 'Mesh encontrada.',
    type: Mesh,
  })
  @ApiResponse({ status: 404, description: 'Mesh não encontrada.' })
  findOne(@Param('id') id: string, @Request() req: ReqReturnDto) {
    return this.meshesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma mesh do usuário.' })
  @ApiParam({ name: 'id', description: 'ID da mesh.' })
  @ApiBody({ type: UpdateMeshDto })
  @ApiResponse({
    status: 200,
    description: 'Mesh atualizada.',
    type: Mesh,
  })
  @ApiResponse({ status: 404, description: 'Mesh não encontrada.' })
  update(
    @Param('id') id: string,
    @Body() updateMeshDto: UpdateMeshDto,
    @Request() req: ReqReturnDto,
  ) {
    return this.meshesService.update(id, updateMeshDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma mesh do usuário.' })
  @ApiParam({ name: 'id', description: 'ID da mesh.' })
  @ApiResponse({
    status: 200,
    description: 'Mesh removida.',
    type: Mesh,
  })
  @ApiResponse({ status: 404, description: 'Mesh não encontrada.' })
  remove(@Param('id') id: string, @Request() req: ReqReturnDto) {
    return this.meshesService.remove(id, req.user.id);
  }

  @Get(':meshId/zones')
  @ApiOperation({
    summary: 'Lista as zones pertencentes a uma mesh do usuário.',
  })
  @ApiParam({ name: 'meshId', description: 'ID da mesh.' })
  @ApiResponse({
    status: 200,
    description: 'Lista de zones da mesh.',
    type: [Zone],
  })
  findZonesByMesh(
    @Param('meshId') meshId: string,
    @Request() req: ReqReturnDto,
  ) {
    return this.zonesService.findZonesByMesh(meshId, req.user.id);
  }

  @ApiOperation({
    summary: 'Busca todos os dispositivos vinculados a uma mesh específica.',
  })
  @Get(':meshId/devices')
  @UseGuards(AuthGuard)
  findDevicesByZone(
    @Param('meshId') meshId: string,
    @Request() req: ReqReturnDto,
  ) {
    return this.devicesService.findDevicesByMesh(meshId, req.user.id);
  }
}
