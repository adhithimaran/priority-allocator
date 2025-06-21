import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/schedules - Get schedules for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const active = searchParams.get('active');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const whereClause = {
      userId: parseInt(userId)
    };

    if (active === 'true') {
      whereClause.isActive = true;
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      orderBy: {
        generatedAt: 'desc'
      }
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// PUT /api/schedules - Update schedule (mainly to activate/deactivate)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { scheduleId, isActive, userId } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    // If activating a schedule, deactivate all others for this user
    if (isActive && userId) {
      await prisma.schedule.updateMany({
        where: {
          userId: parseInt(userId),
          isActive: true
        },
        data: {
          isActive: false
        }
      });
    }

    const schedule = await prisma.schedule.update({
      where: {
        id: parseInt(scheduleId)
      },
      data: {
        isActive: isActive
      }
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

// DELETE /api/schedules - Delete a schedule and its associated time blocks
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const userId = searchParams.get('userId');

    if (!scheduleId || !userId) {
      return NextResponse.json({ 
        error: 'Schedule ID and User ID are required' 
      }, { status: 400 });
    }

    // Delete associated scheduled time blocks first
    await prisma.timeBlock.deleteMany({
      where: {
        userId: parseInt(userId),
        type: 'scheduled_task'
      }
    });

    // Delete the schedule record
    await prisma.schedule.delete({
      where: {
        id: parseInt(scheduleId)
      }
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}