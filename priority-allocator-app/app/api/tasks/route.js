import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// In app/api/tasks/route.js
import { calculatePriorityScore } from '../../lib/algorithms/priority-calculator';

const prisma = new PrismaClient();



export async function POST(request) {
  try {
    console.log('=== API CALL RECEIVED ===', new Date().toISOString(), Math.random());
    const { userId, title, description, estimatedDuration, difficultyLevel, importanceLevel, dueDate } = await request.json();
    console.log('=== DEBUG INFO ===');
    console.log('Received userId:', userId, 'Type:', typeof userId);
    console.log('All received data:', { userId, title, description, estimatedDuration, difficultyLevel, importanceLevel, dueDate });
    
    // Validate required fields
    if (!title || !estimatedDuration || !difficultyLevel || !importanceLevel || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Option 2: Use an existing user or create one if none exist
    let actualUserId;
    const existingUser = await prisma.user.findFirst();

    if (!existingUser) {
      // No users exist, create one
      console.log('No users found, creating a new user...');
      const newUser = await prisma.user.create({
        data: {
          email: "test@example.com", 
          name: "Test User",
          // Add any other required fields from your User model here
        }
      });
      actualUserId = newUser.id;
      console.log('Created new user with ID:', actualUserId);
    } else {
      actualUserId = existingUser.id;
      console.log('Using existing user with ID:', actualUserId);
    }

    // Calculate priority score
    const dueDateTime = new Date(dueDate);
    const currentTime = new Date();
    const hoursUntilDue = Math.max(1, (dueDateTime - currentTime) / (1000 * 60 * 60));
    
    // Priority formula: (difficulty * importance * 10 + urgency_factor) / estimated_duration
    const urgencyFactor = Math.max(1, 168 / hoursUntilDue); // 168 hours = 1 week
    const priorityScore = (difficultyLevel * importanceLevel * 10 + urgencyFactor) / estimatedDuration;

    console.log('Creating task with userId:', actualUserId);

    // Create task with the valid user ID
    const task = await prisma.task.create({
      data: {
        userId: actualUserId,
        title,
        description,
        estimatedDuration: parseFloat(estimatedDuration),
        difficultyLevel: parseInt(difficultyLevel),
        importanceLevel: parseInt(importanceLevel),
        dueDate: new Date(dueDate),
        priorityScore,
        status: 'PENDING' // Use enum value instead of lowercase string
      }
    });

    return NextResponse.json({ 
      message: 'Task created successfully', 
      task 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId provided, use the first available user
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: 'No users found' }, { status: 404 });
      }
      userId = firstUser.id;
    }

    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      orderBy: { priorityScore: 'desc' }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}


// Add these methods to your existing /app/api/tasks/route.js file

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Convert status to uppercase to match your enum
    const upperStatus = status.toUpperCase();
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: upperStatus,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Task updated successfully',
      task 
    });
    
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Check if task exists before deleting
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ 
      message: 'Task deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}