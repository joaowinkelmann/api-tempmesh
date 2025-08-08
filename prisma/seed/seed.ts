import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash the password
  const hashedPassword = await argon2.hash('password123');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create a mesh for the user
  const mesh = await prisma.mesh.upsert({
    where: { id: 'mesh-1' },
    update: {},
    create: {
      id: 'mesh-1',
      name: 'Office Temperature Network',
      userId: user.id,
    },
  });

  console.log('✅ Created mesh:', mesh.name);

  // Create a controller
  const controller = await prisma.controller.upsert({
    where: { macAddress: '00:11:22:33:44:55' },
    update: {},
    create: {
      macAddress: '00:11:22:33:44:55',
      name: 'Main Controller',
      lat: -23.5505,
      long: -46.6333,
      description: 'Main controller for office network',
      meshId: mesh.id,
    },
  });

  console.log('✅ Created controller:', controller.name);

  // Create workers (temperature sensors)
  const workers = await Promise.all([
    prisma.worker.upsert({
      where: { macAddress: 'AA:BB:CC:DD:EE:01' },
      update: {},
      create: {
        macAddress: 'AA:BB:CC:DD:EE:01',
        name: 'Sensor - Meeting Room',
        lat: -23.5506,
        long: -46.6334,
        description: 'Temperature sensor in meeting room',
        meshId: mesh.id,
      },
    }),
    prisma.worker.upsert({
      where: { macAddress: 'AA:BB:CC:DD:EE:02' },
      update: {},
      create: {
        macAddress: 'AA:BB:CC:DD:EE:02',
        name: 'Sensor - Kitchen',
        lat: -23.5507,
        long: -46.6335,
        description: 'Temperature sensor in kitchen area',
        meshId: mesh.id,
      },
    }),
    prisma.worker.upsert({
      where: { macAddress: 'AA:BB:CC:DD:EE:03' },
      update: {},
      create: {
        macAddress: 'AA:BB:CC:DD:EE:03',
        name: 'Sensor - Server Room',
        lat: -23.5508,
        long: -46.6336,
        description: 'Temperature sensor in server room',
        meshId: mesh.id,
      },
    }),
  ]);

  console.log('✅ Created workers:', workers.map(w => w.name).join(', '));

  // Create sample readings for each worker
  const readings: any[] = [];
  for (const worker of workers) {
    // Create 5 sample readings for each worker
    for (let i = 0; i < 5; i++) {
      const reading = await prisma.reading.create({
        data: {
          temperature: 20 + Math.random() * 10, // Random temp between 20-30°C
          humidity: 40 + Math.random() * 40,    // Random humidity between 40-80%
          readingTime: new Date(Date.now() - i * 60 * 60 * 1000), // Each reading 1 hour apart
          workerId: worker.id,
        },
      });
      readings.push(reading);
    }
  }

  console.log('✅ Created readings:', readings.length);

  console.log('🎉 Seed completed successfully!');
  console.log('📧 Test user credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });