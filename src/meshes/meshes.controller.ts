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

@UseGuards(AuthGuard)
@Controller('meshes')
export class MeshesController {
  constructor(
    private readonly meshesService: MeshesService,
    private readonly zonesService: ZonesService,
  ) {}

  @Post()
  async create(
    @Body() createMeshDto: CreateMeshDto,
    @Request() req: ReqReturnDto,
  ) {
    return this.meshesService.create(createMeshDto, req.user.user_id);
  }

  @Get()
  async findAll(@Request() req: ReqReturnDto) {
    return this.meshesService.findAll(req.user.user_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: ReqReturnDto) {
    return this.meshesService.findOne(id, req.user.user_id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMeshDto: UpdateMeshDto,
    @Request() req: ReqReturnDto,
  ) {
    return this.meshesService.update(id, updateMeshDto, req.user.user_id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: ReqReturnDto) {
    return this.meshesService.remove(id, req.user.user_id);
  }

  @Get(':meshId/zones')
  async findZonesByMesh(
    @Param('meshId') meshId: string,
    @Request() req: ReqReturnDto,
  ) {
    return this.zonesService.findZonesByMesh(meshId, req.user.user_id);
  }
}
