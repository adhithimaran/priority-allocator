// Create this file at: /app/api/tasks/[id]/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update a specific task
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    console.log(`Updating task ${id} to status: ${status}`);

    // Convert status to uppercase to match your enum
    const upperStatus = status.toUpperCase();
    
    const task = await prisma.task.update({
      where: { id: id },
      data: { 
        status: upperStatus,
        updatedAt: new Date()
      }
    });

    console.log('Updated task:', task);

    return NextResponse.json({ 
      message: 'Task updated successfully',
      task 
    });
    
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Task not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

// Delete a specific task
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    console.log(`Deleting task ${id}`);

    await prisma.task.delete({
      where: { id: id }
    });

    console.log('Task deleted successfully');

    return NextResponse.json({ 
      message: 'Task deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Task not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

// Get a specific task
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: id }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
    
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}