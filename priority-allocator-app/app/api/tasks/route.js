import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tasks - Get all tasks for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: userId // Remove parseInt() - keep as string
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      estimatedDuration,
      difficultyLevel,
      importanceLevel,
      dueDate
    } = body;

    // Basic validation
    if (!userId || !title || !estimatedDuration || !difficultyLevel || !importanceLevel || !dueDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, title, estimatedDuration, difficultyLevel, importanceLevel, dueDate' 
      }, { status: 400 });
    }

    // Calculate priority score (simple weighted algorithm for MVP)
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = Math.max(1, (due - now) / (1000 * 60 * 60));
    
    // Priority formula: (difficulty * importance * 10 + urgency_factor) / estimated_duration
    const urgencyFactor = Math.max(1, 168 / hoursUntilDue); // 168 hours = 1 week
    const priorityScore = ((difficultyLevel * importanceLevel * 10) + urgencyFactor) / estimatedDuration;

    const task = await prisma.task.create({
      data: {
        userId: userId, // Remove parseInt() - keep as string
        title,
        description: description || '',
        estimatedDuration: parseFloat(estimatedDuration),
        difficultyLevel: parseInt(difficultyLevel),
        importanceLevel: parseInt(importanceLevel),
        dueDate: new Date(dueDate),
        priorityScore: Math.round(priorityScore * 100) / 100,
        status: 'pending'
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}