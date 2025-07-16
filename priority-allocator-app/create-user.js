import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.user.create({
      data: {
        id: '1', // Simple string ID
        email: 'test@example.com',
        name: 'Test User',
        // Add any other required fields from your User model
      }
    });
    
    console.log('✅ User created successfully:', user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  User already exists with this ID or email');
    } else {
      console.error('❌ Error creating user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();