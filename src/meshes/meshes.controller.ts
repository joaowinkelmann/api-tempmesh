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

@UseGuards(AuthGuard)
@Controller('meshes')
export class MeshesController {
  constructor(private readonly meshesService: MeshesService) {}

  @Post()
  async create(@Body() createMeshDto: CreateMeshDto, @Request() req) {
    return this.meshesService.create(createMeshDto, req.user.sub);
  }

  @Get()
  async findAll(@Request() req) {
    return this.meshesService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.meshesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMeshDto: UpdateMeshDto,
    @Request() req,
  ) {
    return this.meshesService.update(id, updateMeshDto, req.user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.meshesService.remove(id, req.user.sub);
  }
}
