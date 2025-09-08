import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import sharp from 'sharp';

export interface TileResult {
  tmpDir: string;
  id: string;
  maxZoom: number;
  width: number;
  height: number;
  prefix: string;
  ext: 'png' | 'webp';
}

@Injectable()
export class TilerService {
  private readonly logger = new Logger(TilerService.name);

  async makeTilesFromImageBuffer(buffer: Buffer, meshId?: string): Promise<TileResult> {
    this.logger.debug(`Starting tile generation from image buffer: length=${buffer.length} meshId=${meshId}`);
    // Prefer a short, deterministic id when meshId is present; otherwise random
    const id = meshId
      ? crypto.createHash('sha256').update(`mesh:${meshId}`).digest('hex').slice(0, 40)
      : crypto.randomUUID();
    const prefix = `custom-maps/${id}`;

    // Configurable output format (default webp for better size), quality/effort
    const envFmt = (process.env.MAP_TILE_FORMAT || 'webp').toLowerCase();
    const format: 'png' | 'webp' = envFmt === 'png' ? 'png' : 'webp';
    const quality = Number.isFinite(Number(process.env.MAP_TILE_QUALITY))
      ? Math.max(1, Math.min(100, Number(process.env.MAP_TILE_QUALITY)))
      : 80;
    const effort = Number.isFinite(Number(process.env.MAP_TILE_EFFORT))
      ? Math.max(0, Math.min(6, Number(process.env.MAP_TILE_EFFORT)))
      : 4;
    const ext: 'png' | 'webp' = format;

    // Normalize orientation
    const base = sharp(buffer, { limitInputPixels: false }).rotate();
    const baseMeta = await base.metadata();
    const width = baseMeta.width ?? 0;
    const height = baseMeta.height ?? 0;

    if (!width || !height) {
      throw new Error('Invalid image: missing dimensions');
    }

    const tileSize = 256;
    // Always build up to a fixed max zoom (inclusive). Default: 3.
    const maxZoom =
      Number.isFinite(Number(process.env.MAP_MAX_ZOOM))
        ? Math.max(0, Number(process.env.MAP_MAX_ZOOM))
        : 3;

    const tmpDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), `tempmesh-tiles-${id}-`),
    );

    this.logger.debug(`Generating tiles up to maxZoom=${maxZoom} (levels 0..${maxZoom})`);

    // Generate pyramid: z = 0..maxZoom (z=maxZoom uses original dimensions)
    for (let z = 0; z <= maxZoom; z++) {
      const scale = 1 / Math.pow(2, maxZoom - z);
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));

      // Resize, then read actual dims (guard against internal rounding)
      const resizedBuf = await sharp(buffer)
        .rotate()
        .resize(targetW, targetH, { fit: 'fill', withoutEnlargement: true })
        .png()
        .toBuffer();

      const rMeta = await sharp(resizedBuf).metadata();
      const rW = rMeta.width ?? targetW;
      const rH = rMeta.height ?? targetH;

      // Pad to exact multiples of 256 based on actual resized size
      const paddedW = Math.ceil(rW / tileSize) * tileSize;
      const paddedH = Math.ceil(rH / tileSize) * tileSize;

      const extendedBuf = await sharp(resizedBuf)
        .extend({
          left: 0,
          top: 0,
          right: paddedW - rW,
          bottom: paddedH - rH,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

      const eMeta = await sharp(extendedBuf).metadata();
      const eW = eMeta.width ?? paddedW;
      const eH = eMeta.height ?? paddedH;

      const xTiles = Math.floor(eW / tileSize);
      const yTiles = Math.floor(eH / tileSize);

      for (let x = 0; x < xTiles; x++) {
        for (let y = 0; y < yTiles; y++) {
          let tileSharp = sharp(extendedBuf).extract({
            left: x * tileSize,
            top: y * tileSize,
            width: tileSize,
            height: tileSize,
          });

          if (format === 'webp') {
            tileSharp = tileSharp.webp({ quality, effort });
          } else {
            tileSharp = tileSharp.png({ compressionLevel: 9 });
          }

          const outDir = path.join(tmpDir, `${z}`, `${x}`);
          await fs.promises.mkdir(outDir, { recursive: true });
          const outPath = path.join(outDir, `${y}.${ext}`);
          await tileSharp.toFile(outPath);
        }
      }
    }

    this.logger.log(
      `Tiles generated in ${tmpDir} (maxZoom=${maxZoom}, size=${width}x${height}, ext=${ext})`,
    );

    return { tmpDir, id, maxZoom, width, height, prefix, ext };
  }
}