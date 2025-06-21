import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/timeblocks - Get time blocks for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const whereClause = {
      userId: parseInt(userId)
    };

    // Filter by date range if provided
    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const timeBlocks = await prisma.timeBlock.findMany({
      where: whereClause,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            difficultyLevel: true,
            priorityScore: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({ timeBlocks });
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 });
  }
}

// POST /api/timeblocks - Create a new time block
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      startTime,
      endTime,
      type,
      taskId,
      title,
      isFlexible
    } = body;

    if (!userId || !startTime || !endTime || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, startTime, endTime, type' 
      }, { status: 400 });
    }

    // Validate time block doesn't overlap with existing blocks
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      return NextResponse.json({ 
        error: 'Start time must be before end time' 
      }, { status: 400 });
    }

    // Check for overlapping time blocks
    const overlappingBlocks = await prisma.timeBlock.findMany({
      where: {
        userId: parseInt(userId),
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ]
      }
    });

    if (overlappingBlocks.length > 0) {
      return NextResponse.json({ 
        error: 'Time block overlaps with existing schedule',
        conflictingBlocks: overlappingBlocks
      }, { status: 409 });
    }

    const timeBlockData = {
      userId: parseInt(userId),
      startTime: startDateTime,
      endTime: endDateTime,
      type,
      title: title || '',
      isFlexible: isFlexible || false
    };

    if (taskId) {
      timeBlockData.taskId = parseInt(taskId);
    }

    const timeBlock = await prisma.timeBlock.create({
      data: timeBlockData,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            difficultyLevel: true,
            priorityScore: true
          }
        }
      }
    });

    return NextResponse.json({ timeBlock }, { status: 201 });
  } catch (error) {
    console.error('Error creating time block:', error);
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 });
  }
}

// DELETE /api/timeblocks - Delete time blocks
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');
    const userId = searchParams.get('userId');
    const taskId = searchParams.get('taskId');

    if (blockId) {
      // Delete specific time block
      await prisma.timeBlock.delete({
        where: {
          id: parseInt(blockId)
        }
      });
      return NextResponse.json({ message: 'Time block deleted successfully' });
    } else if (userId && taskId) {
      // Delete all time blocks for a specific task
      await prisma.timeBlock.deleteMany({
        where: {
          userId: parseInt(userId),
          taskId: parseInt(taskId)
        }
      });
      return NextResponse.json({ message: 'Task time blocks deleted successfully' });
    } else {
      return NextResponse.json({ 
        error: 'Either blockId or both userId and taskId are required' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting time block:', error);
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 });
  }
}