import { PrismaClient, DeviceStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Usuário de teste
  const hashedPassword = await argon2.hash('password123');
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

  // 2. Cria um mesh pro cara
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

  // 3. Cria uma Zone dentro dessa Mesh
  const zone = await prisma.zone.upsert({
    where: { id: 'zone-1' },
    update: {},
    create: {
      id: 'zone-1',
      name: 'Main Office Area',
      meshId: mesh.id,
      // Example vertices for a rectangular zone
      vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ],
    },
  });
  console.log('✅ Created zone:', zone.name);

  // 4. Create an ACTIVE Controller assigned to the Zone
  const controller = await prisma.controller.upsert({
    where: { macAddress: '00:11:22:33:44:55' },
    update: {},
    create: {
      macAddress: '00:11:22:33:44:55',
      name: 'Main Gateway',
      description: 'Main controller for office network, placed near the entrance.',
      x: 5,
      y: 5,
      zoneId: zone.id, // Assign to the created zone
      status: DeviceStatus.ACTIVE, // Set status to ACTIVE
    },
  });
  console.log(`✅ Created ACTIVE controller: ${controller.name}`);

  // 5. Create Workers with different statuses
  const activeWorker = await prisma.worker.upsert({
    where: { macAddress: 'AA:BB:CC:DD:EE:01' },
    update: {},
    create: {
      macAddress: 'AA:BB:CC:DD:EE:01',
      name: 'Sensor - Meeting Room',
      description: 'Temperature sensor in the main meeting room.',
      x: 50,
      y: 25,
      zoneId: zone.id, // Assign to the created zone
      status: DeviceStatus.ACTIVE,
    },
  });
  console.log(`✅ Created ACTIVE worker: ${activeWorker.name}`);

  const pendingWorker = await prisma.worker.upsert({
    where: { macAddress: 'AA:BB:CC:DD:EE:02' },
    update: {},
    create: {
      macAddress: 'AA:BB:CC:DD:EE:02',
      name: 'New Unassigned Sensor',
      description: 'A newly discovered device.',
      x: 0, // Default position
      y: 0, // Default position
      // zoneId is null by default, making it unassigned
      status: DeviceStatus.PENDING, // This device needs configuration
    },
  });
  console.log(`✅ Created PENDING worker: ${pendingWorker.name}`);

  // 6. Create sample readings ONLY for the active worker
  const readings: any[] = [];
  for (let i = 0; i < 5; i++) {
    const reading = await prisma.reading.create({
      data: {
        temperature: 20 + Math.random() * 5, // Random temp between 20-25°C
        humidity: 45 + Math.random() * 10,  // Random humidity between 45-55%
        readingTime: new Date(Date.now() - i * 60 * 60 * 1000), // Each reading 1 hour apart
        workerId: activeWorker.id, // Link reading to the ACTIVE worker
      },
    });
    readings.push(reading);
  }
  console.log(`✅ Created ${readings.length} sample readings for ${activeWorker.name}.`);

  console.log('\n🎉 Seed completed successfully!');
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