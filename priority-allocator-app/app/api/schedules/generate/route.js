import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/schedules/generate - Generate optimized schedule
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, startDate, endDate, includeTasks } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, startDate, endDate' 
      }, { status: 400 });
    }

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { preferences: true, timezone: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get pending tasks to schedule
    const tasks = await prisma.task.findMany({
      where: {
        userId: parseInt(userId),
        status: 'pending',
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...(includeTasks && { id: { in: includeTasks.map(id => parseInt(id)) } })
      },
      orderBy: {
        priorityScore: 'desc'
      }
    });

    // Get existing time blocks (fixed commitments)
    const existingBlocks = await prisma.timeBlock.findMany({
      where: {
        userId: parseInt(userId),
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Generate schedule using simple algorithm for MVP
    const scheduledBlocks = await generateSimpleSchedule(
      tasks, 
      existingBlocks, 
      user.preferences, 
      new Date(startDate), 
      new Date(endDate)
    );

    // Check for impossible tasks (not enough time before deadline)
    const impossibleTasks = tasks.filter(task => {
      const taskBlocks = scheduledBlocks.filter(block => block.taskId === task.id);
      const scheduledTime = taskBlocks.reduce((total, block) => {
        return total + (new Date(block.endTime) - new Date(block.startTime)) / (1000 * 60 * 60);
      }, 0);
      return scheduledTime < task.estimatedDuration;
    });

    if (impossibleTasks.length > 0) {
      return NextResponse.json({
        error: 'Some tasks cannot fit in the available time',
        impossibleTasks: impossibleTasks.map(task => ({
          id: task.id,
          title: task.title,
          required: task.estimatedDuration,
          available: calculateAvailableTime(task, existingBlocks, user.preferences, startDate, endDate),
          dueDate: task.dueDate
        }))
      }, { status: 422 });
    }

    // Create schedule record
    const schedule = await prisma.schedule.create({
      data: {
        userId: parseInt(userId),
        optimizationSettings: {
          algorithm: 'priority-based',
          factors: ['priority', 'due_date', 'difficulty'],
          generated_at: new Date().toISOString()
        },
        isActive: true
      }
    });

    // Save the scheduled time blocks
    const createdBlocks = await Promise.all(
      scheduledBlocks.map(block => 
        prisma.timeBlock.create({
          data: {
            userId: parseInt(userId),
            startTime: new Date(block.startTime),
            endTime: new Date(block.endTime),
            type: 'scheduled_task',
            taskId: block.taskId,
            title: block.title,
            isFlexible: true
          },
          include: {
            task: {
              select: {
                id: true,
                title: true,
                difficultyLevel: true,
                priorityScore: true,
                estimatedDuration: true
              }
            }
          }
        })
      )
    );

    return NextResponse.json({ 
      schedule,
      timeBlocks: createdBlocks,
      summary: {
        tasksScheduled: scheduledBlocks.length,
        totalHours: scheduledBlocks.reduce((total, block) => {
          return total + (new Date(block.endTime) - new Date(block.startTime)) / (1000 * 60 * 60);
        }, 0)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
  }
}

// Simple scheduling algorithm for MVP
async function generateSimpleSchedule(tasks, existingBlocks, preferences, startDate, endDate) {
  const scheduledBlocks = [];
  const workHours = preferences.workHours || { start: '09:00', end: '17:00' };
  const maxContinuousWork = preferences.maxContinuousWork || 120; // minutes
  const breakDuration = preferences.breakDuration || 15; // minutes

  // Create available time slots
  const availableSlots = generateAvailableSlots(existingBlocks, workHours, startDate, endDate);

  for (const task of tasks) {
    const taskDuration = task.estimatedDuration * 60; // convert to minutes
    let remainingDuration = taskDuration;

    // Try to fit task in available slots
    for (const slot of availableSlots) {
      if (remainingDuration <= 0) break;

      const slotDuration = (new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60);
      const workBlockDuration = Math.min(remainingDuration, slotDuration, maxContinuousWork);

      if (workBlockDuration >= 30) { // Minimum 30-minute blocks
        const blockEndTime = new Date(slot.startTime.getTime() + workBlockDuration * 60 * 1000);
        
        scheduledBlocks.push({
          taskId: task.id,
          title: `Work on: ${task.title}`,
          startTime: new Date(slot.startTime),
          endTime: blockEndTime
        });

        remainingDuration -= workBlockDuration;
        
        // Update slot availability
        slot.startTime = new Date(blockEndTime.getTime() + breakDuration * 60 * 1000);
      }
    }
  }

  return scheduledBlocks;
}

// Generate available time slots
function generateAvailableSlots(existingBlocks, workHours, startDate, endDate) {
  const slots = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    // Skip weekends for MVP (can be made configurable later)
    if (current.getDay() === 0 || current.getDay() === 6) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    const dayStart = new Date(current);
    const [startHour, startMinute] = workHours.start.split(':');
    dayStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const dayEnd = new Date(current);
    const [endHour, endMinute] = workHours.end.split(':');
    dayEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    // Find gaps between existing blocks
    let currentTime = dayStart;
    const dayBlocks = existingBlocks
      .filter(block => {
        const blockDate = new Date(block.startTime);
        return blockDate.toDateString() === current.toDateString();
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    for (const block of dayBlocks) {
      const blockStart = new Date(block.startTime);
      if (currentTime < blockStart) {
        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(blockStart)
        });
      }
      currentTime = new Date(Math.max(currentTime, new Date(block.endTime)));
    }

    // Add remaining time after last block
    if (currentTime < dayEnd) {
      slots.push({
        startTime: new Date(currentTime),
        endTime: new Date(dayEnd)
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return slots.filter(slot => (slot.endTime - slot.startTime) >= 30 * 60 * 1000); // At least 30 minutes
}

// Calculate available time for a specific task
function calculateAvailableTime(task, existingBlocks, preferences, startDate, endDate) {
  const taskDeadline = new Date(Math.min(new Date(task.dueDate), new Date(endDate)));
  const availableSlots = generateAvailableSlots(existingBlocks, preferences.workHours, startDate, taskDeadline);
  
  return availableSlots.reduce((total, slot) => {
    return total + (slot.endTime - slot.startTime) / (1000 * 60 * 60);
  }, 0);
}