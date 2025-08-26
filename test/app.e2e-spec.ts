import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient, DeviceStatus, DeviceRole } from '@prisma/client';
import * as argon2 from 'argon2';

describe('App E2E', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let accessToken: string;

  // Known seed constants
  const userEmail = 'test@example.com';
  const userPassword = 'password123';
  const meshId = 'mesh-1';
  const zoneId = 'zone-1';
  const knownWorkerMac = 'AA:BB:CC:DD:EE:01';

  // Minimal seed (idempotent)
  const seed = async () => {
    const hashedPassword = await argon2.hash(userPassword);
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { passwordHash: hashedPassword },
      create: {
        email: userEmail,
        name: 'Test User',
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
      where: { macAddress: '24:58:7C:CC:E5:B4' },
      update: {},
      create: {
        macAddress: '24:58:7C:CC:E5:B4',
        name: 'Luzes de Natal',
        description: 'Controller device',
        x: 5,
        y: 5,
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
        zoneId: zone.id,
        status: DeviceStatus.ACTIVE,
        role: DeviceRole.WORKER,
        userId: user.id,
        deviceColor: '#00FF00',
        readingsPerBatch: 1,
        wakeUpInterval: 1800,
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

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
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
});
