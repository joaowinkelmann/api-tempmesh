import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { CreateReadingsDto } from './dto/create-readings.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('readings')
@ApiTags('Readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Post('add')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Registra novas leituras de sensores. Pode ser passado um array de leituras.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registros criados com sucesso.',
    schema: {
      example: {
        message: '3 registros criados com sucesso.',
        createdCount: 3,
        unregisteredCount: 1,
      },
    },
  })
  @ApiBody({ type: CreateReadingsDto })
  @HttpCode(HttpStatus.CREATED) // HTTP 201 se conseguiu criar
  async createReadings(@Body() createReadingsDto: CreateReadingsDto) {
    const result = await this.readingsService.createReadings(createReadingsDto);
    return {
      message: `${result.createdCount} registros criados com sucesso.`,
      ...result,
    };
  }
}
