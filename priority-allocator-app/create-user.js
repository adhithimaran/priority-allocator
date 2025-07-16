// create-user-commonjs.js
// CommonJS version if you get import errors

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('🔍 Starting user creation process...');
    
    // Check existing users first
    const existingUsers = await prisma.user.findMany({
      select: { id: true, email: true }
    });
    console.log('Existing users:', existingUsers);
    
    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (userExists) {
      console.log('ℹ️  User already exists:', userExists);
      console.log('✅ You can use this userId:', userExists.id);
      return userExists;
    }
    
    // Create user with all required fields
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'dummy_hash_for_testing',
        timezone: 'UTC',
        preferences: null
      }
    });
    
    console.log('✅ User created successfully!');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('');
    console.log('🎉 You can now use this userId in your TaskForm:', user.id);
    
    return user;
    
  } catch (error) {
    console.error('❌ Error creating user:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();