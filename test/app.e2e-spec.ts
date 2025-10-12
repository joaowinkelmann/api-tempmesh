import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, DeviceStatus, DeviceRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { promises as fsPromises, existsSync, createReadStream } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

describe('App E2E', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaClient;
  let accessToken: string;

  const runId = randomUUID().replace(/-/g, '');
  const buildMac = (hex: string) =>
    hex
      .padEnd(12, '0')
      .slice(0, 12)
      .toUpperCase()
      .match(/.{1,2}/g)!
      .join(':');

  // Known seed constants
  const userEmail = `e2e+${runId}@example.com`;
  const userPassword = `testsuitepassword189!${runId.slice(0, 6)}`;
  const userName = 'E2E Test Runner';
  const meshId = `mesh-${runId}`;
  const zoneId = `zone-${runId}`;
  const meshUploadId = `mesh-upload-${runId}`;
  const controllerMac = buildMac(runId.slice(0, 12));
  const knownWorkerMac = buildMac(runId.slice(12, 24));

  const newUserEmail = `e2e+new-${runId}@example.com`;
  const newUserPassword = `newtestsuitepassword189!${runId.slice(0, 6)}`;
  const newUserName = 'New E2E User';

  // Minimal seed (idempotent)
  const seed = async () => {
    const hashedPassword = await argon2.hash(userPassword);
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { passwordHash: hashedPassword },
      create: {
        email: userEmail,
        name: userName,
        passwordHash: hashedPassword,
      },
    });

    const mesh = await prisma.mesh.upsert({
      where: { id: meshId },
      update: {},
      create: {
        id: meshId,
        name: 'Mesh dos Guris',
        userId: user.id,
        lat: -23.5505,
        lon: -46.6333,
      },
    });

    const zone = await prisma.zone.upsert({
      where: { id: zoneId },
      update: {},
      create: {
        id: zoneId,
        name: 'Planalto Central',
        meshId: mesh.id,
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 50 },
          { x: 0, y: 50 },
        ],
      },
    });

    await prisma.device.upsert({
      where: { macAddress: controllerMac },
      update: {},
      create: {
        macAddress: controllerMac,
        name: 'Luzes de Natal',
        description: 'Controller device',
        x: 5,
        y: 5,
        meshId: mesh.id,
        zoneId: zone.id,
        status: DeviceStatus.ACTIVE,
        role: DeviceRole.CONTROLLER,
        userId: user.id,
        deviceColor: '#FF0000',
        readingsPerBatch: 2,
        wakeUpInterval: 3600,
      },
    });

    await prisma.device.upsert({
      where: { macAddress: knownWorkerMac },
      update: {},
      create: {
        macAddress: knownWorkerMac,
        name: 'Sensor - Sala de Reuniões',
        description: 'Worker sensor',
        x: 50,
        y: 25,
        meshId: mesh.id,
        zoneId: zone.id,
        status: DeviceStatus.ACTIVE,
        role: DeviceRole.WORKER,
        userId: user.id,
        deviceColor: '#00FF00',
        readingsPerBatch: 1,
        wakeUpInterval: 1800,
      },
    });

    await prisma.mesh.create({
      data: {
        id: meshUploadId,
        name: 'Mesh Upload Target',
        userId: user.id,
        lat: -23.551,
        lon: -46.634,
      },
    });
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600s';

    prisma = new PrismaClient();
    await prisma.$connect();
    await seed();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }, 60000);

  afterAll(async () => {
    // Teardown for the main seeded user
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      await prisma.reading.deleteMany({ where: { device: { userId: user.id } } });
      await prisma.device.deleteMany({ where: { userId: user.id } });
      await prisma.zone.deleteMany({
        where: { meshId: { in: [meshId, meshUploadId] } },
      });
      await prisma.mesh.deleteMany({
        where: { id: { in: [meshId, meshUploadId] } },
      });
      await prisma.user.delete({ where: { id: user.id } });
    }

    const newUser = await prisma.user.findUnique({
      where: { email: newUserEmail },
    });
    if (newUser) {
      await prisma.user.delete({ where: { email: newUserEmail } });
    }

    await app.close();
    await prisma.$disconnect();
    await fsPromises.rm(fixturesDir, { recursive: true, force: true });
  });

  it('redirects root (/) to docs (302)', async () => {
    const res = await request(app.getHttpServer()).get('/');
    expect([301, 302]).toContain(res.status);
  });

  it('logs in and obtains JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(200);
    expect(res.body).toHaveProperty('access_token');
    accessToken = res.body.access_token;
  });

  it('lists user devices', async () => {
    const res = await request(app.getHttpServer())
      .get('/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const worker = res.body.find((d: any) => d.macAddress === knownWorkerMac);
    expect(worker).toBeDefined();
  });

  it('adds sensor readings (1 valid, 1 unregistered MAC)', async () => {
    const payload = {
      data: [
        { mac: knownWorkerMac, temp: 25.4, hum: 60.1 },
        { mac: 'FF:00:11:22:33:44', temp: 30.2, hum: 55.5 },
      ],
    };
    const res = await request(app.getHttpServer())
      .post('/readings/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201);
    expect(res.body).toMatchObject({
      createdCount: 1,
      unregisteredCount: 1,
    });
  });

  it('deletes a reading by ID', async () => {
    const readings = await prisma.reading.findMany({
      where: {
        device: {
          macAddress: knownWorkerMac,
        },
      },
      orderBy: { readingTime: 'desc' },
      take: 1,
    });
    expect(readings.length).toBe(1);
    const readingId = readings[0].id; // get the ID of the most recent reading
    await request(app.getHttpServer())
      .delete(`/readings/${readingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200, { message: 'Leitura deletada com sucesso.' });
  });

  it('fetches zones for mesh', async () => {
    const res = await request(app.getHttpServer())
      .get(`/meshes/${meshId}/zones`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const zone = res.body.find((z: any) => z.id === zoneId);
    expect(zone).toBeDefined();
  });

  it('updates a zone name', async () => {
    const newName = 'Planalto Central Atualizado';
    const res = await request(app.getHttpServer())
      .patch(`/zones/${zoneId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: newName })
      .expect(200);
    expect(res.body.name).toBe(newName);
  });

  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const sampleImagePath = path.join(fixturesDir, 'sample_image.webp');

  beforeAll(async () => {
    await fsPromises.mkdir(fixturesDir, { recursive: true });
    if (!existsSync(sampleImagePath)) {
      const buffer = await sharp({
        create: {
          width: 128,
          height: 128,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .webp()
        .toBuffer();
      await fsPromises.writeFile(sampleImagePath, buffer);
    }
  });

  it('fetches devices by zone', async () => {
    const res = await request(app.getHttpServer())
      .get(`/zones/${zoneId}/devices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((d: any) => d.macAddress === knownWorkerMac)).toBe(
      true,
    );
  });

  it('fetches devices by mesh', async () => {
    const res = await request(app.getHttpServer())
      .get(`/meshes/${meshId}/devices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.map((d: any) => d.meshId)).toContain(meshId);
  });

  it('finds device by MAC', async () => {
    const res = await request(app.getHttpServer())
      .get(`/devices/mac/${controllerMac}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toMatchObject({ macAddress: controllerMac });
  });

  // it('uploads a custom map and persists map metadata', async () => {
  //   const FormData = require('form-data');
  //   const fs = require('fs');
  //   const form = new FormData();
    
  //   // Read file into buffer first
  //   const fileBuffer = await fsPromises.readFile(sampleImagePath);
    
  //   form.append('file', fileBuffer, {
  //     filename: 'sample_image.webp',
  //     contentType: 'image/webp',
  //   });
  //   form.append('meshId', meshUploadId);

  //   const fastifyInstance = app.getHttpAdapter().getInstance();
    
  //   // Get form buffer using the callback-based getBuffer method
  //   const formBuffer = await new Promise<Buffer>((resolve, reject) => {
  //     form.getBuffer((err: Error | null, buffer: Buffer) => {
  //       if (err) reject(err);
  //       else resolve(buffer);
  //     });
  //   });

  //   const response = await fastifyInstance.inject({
  //     method: 'POST',
  //     url: '/meshes/upload-map',
  //     headers: {
  //       ...form.getHeaders(),
  //       'authorization': `Bearer ${accessToken}`
  //     },
  //     payload: formBuffer
  //   });

  //   expect([200, 201]).toContain(response.statusCode);
  //   const body = JSON.parse(response.body);
  //   expect(body).toMatchObject({
  //     mapMinZoom: expect.any(Number),
  //     mapMaxZoom: expect.any(Number),
  //     mapUrl: expect.any(String),
  //     prefix: expect.any(String),
  //     ext: expect.any(String),
  //   });
  //   const mesh = await prisma.mesh.findUnique({
  //     where: { id: meshUploadId },
  //   });
  //   expect(mesh?.mapUrl).toBe(body.mapUrl);
  // }, 10000); // Increase timeout to 10 seconds

  it('registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({ email: newUserEmail, password: newUserPassword, name: newUserName })
      .expect(201);

    expect(res.body).toMatchObject({
      message: 'User created successfully',
      user: expect.objectContaining({
        email: newUserEmail,
        name: newUserName,
      }),
    });
  });
});
