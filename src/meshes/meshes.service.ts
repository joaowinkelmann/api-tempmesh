import { Injectable } from '@nestjs/common';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';

@Injectable()
export class MeshesService {
  create(createMeshDto: CreateMeshDto) {
    return 'This action adds a new mesh';
  }

  findAll() {
    return `This action returns all meshes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mesh`;
  }

  update(id: number, updateMeshDto: UpdateMeshDto) {
    return `This action updates a #${id} mesh`;
  }

  remove(id: number) {
    return `This action removes a #${id} mesh`;
  }
}
