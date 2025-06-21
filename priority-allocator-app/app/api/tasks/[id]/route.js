import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tasks/[id] - Get a specific task
export async function GET(request, { params }) {
  try {
    const taskId = parseInt(params.id);
    
    const task = await prisma.task.findUnique({
      where: {
        id: taskId
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request, { params }) {
  try {
    const taskId = parseInt(params.id);
    const body = await request.json();
    const {
      title,
      description,
      estimatedDuration,
      difficultyLevel,
      dueDate,
      status
    } = body;

    // Recalculate priority if relevant fields changed
    let priorityScore;
    if (estimatedDuration || difficultyLevel || dueDate) {
      const now = new Date();
      const due = new Date(dueDate);
      const hoursUntilDue = Math.max(1, (due - now) / (1000 * 60 * 60));
      const urgencyFactor = Math.max(1, 168 / hoursUntilDue);
      priorityScore = ((difficultyLevel * 10) + urgencyFactor) / estimatedDuration;
      priorityScore = Math.round(priorityScore * 100) / 100;
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (estimatedDuration) updateData.estimatedDuration = parseFloat(estimatedDuration);
    if (difficultyLevel) updateData.difficultyLevel = parseInt(difficultyLevel);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status) updateData.status = status;
    if (priorityScore) updateData.priorityScore = priorityScore;

    const task = await prisma.task.update({
      where: {
        id: taskId
      },
      data: updateData
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request, { params }) {
  try {
    const taskId = parseInt(params.id);

    await prisma.task.delete({
      where: {
        id: taskId
      }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}