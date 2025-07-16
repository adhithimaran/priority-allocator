import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, title, description, estimatedDuration, difficultyLevel, importanceLevel, dueDate } = await request.json();
    console.log('=== DEBUG INFO ===');
    console.log('Received userId:', userId, 'Type:', typeof userId);
    console.log('All received data:', { userId, title, description, estimatedDuration, difficultyLevel, importanceLevel, dueDate });
    
    // Validate required fields
    if (!userId || !title || !estimatedDuration || !difficultyLevel || !importanceLevel || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate priority score
    const dueDateTime = new Date(dueDate);
    const currentTime = new Date();
    const hoursUntilDue = Math.max(1, (dueDateTime - currentTime) / (1000 * 60 * 60));
    
    // Priority formula: (difficulty * importance * 10 + urgency_factor) / estimated_duration
    const urgencyFactor = Math.max(1, 168 / hoursUntilDue); // 168 hours = 1 week
    const priorityScore = (difficultyLevel * importanceLevel * 10 + urgencyFactor) / estimatedDuration;

    // Create task with proper enum value
    const task = await prisma.task.create({
      data: {
        userId: userId,
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
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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