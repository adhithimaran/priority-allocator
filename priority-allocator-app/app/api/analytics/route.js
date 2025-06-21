import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/analytics - Get productivity analytics for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId);
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get task completion stats
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      where: {
        userId: userIdInt,
        ...dateFilter
      },
      _count: {
        status: true
      }
    });

    // Get tasks by difficulty level
    const difficultyStats = await prisma.task.groupBy({
      by: ['difficultyLevel'],
      where: {
        userId: userIdInt,
        ...dateFilter
      },
      _count: {
        difficultyLevel: true
      },
      _avg: {
        priorityScore: true
      }
    });

    // Get completed tasks with time tracking
    const completedTasks = await prisma.task.findMany({
      where: {
        userId: userIdInt,
        status: 'completed',
        ...dateFilter
      },
      select: {
        id: true,
        title: true,
        estimatedDuration: true,
        difficultyLevel: true,
        priorityScore: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Calculate productivity metrics
    const totalTasks = taskStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const completedCount = taskStats.find(stat => stat.status === 'completed')?._count.status || 0;
    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    // Get time blocks for the period
    const timeBlocks = await prisma.timeBlock.findMany({
      where: {
        userId: userIdInt,
        type: 'scheduled_task',
        startTime: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            difficultyLevel: true
          }
        }
      }
    });

    // Calculate scheduled vs actual time
    const scheduledHours = timeBlocks.reduce((total, block) => {
      return total + (new Date(block.endTime) - new Date(block.startTime)) / (1000 * 60 * 60);
    }, 0);

    // Daily productivity pattern
    const dailyStats = await getDailyProductivityStats(userIdInt, startDate, endDate);

    // Priority accuracy (how well priorities predicted completion)
    const priorityAccuracy = calculatePriorityAccuracy(completedTasks);

    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks: completedCount,
        completionRate: Math.round(completionRate * 100) / 100,
        scheduledHours: Math.round(scheduledHours * 100) / 100
      },
      tasksByStatus: taskStats,
      tasksByDifficulty: difficultyStats,
      dailyProductivity: dailyStats,
      priorityAccuracy,
      recentCompletions: completedTasks.slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// Helper function to get daily productivity stats
async function getDailyProductivityStats(userId, startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  const dailyData = [];
  const current = new Date(start);

  while (current <= end) {
    const dayStart = new Date(current);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTasks = await prisma.task.findMany({
      where: {
        userId,
        updatedAt: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    const completed = dayTasks.filter(task => task.status === 'completed').length;
    const total = dayTasks.length;

    dailyData.push({
      date: current.toISOString().split('T')[0],
      completed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    });

    current.setDate(current.getDate() + 1);
  }

  return dailyData;
}

// Helper function to calculate priority accuracy
function calculatePriorityAccuracy(completedTasks) {
  if (completedTasks.length === 0) return 0;

  // Sort by priority score (higher = more important)
  const sortedByPriority = [...completedTasks].sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Sort by completion time (earlier completion = better)
  const sortedByCompletion = [...completedTasks].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

  // Calculate correlation between priority order and completion order
  let matches = 0;
  const totalComparisons = completedTasks.length * (completedTasks.length - 1) / 2;

  for (let i = 0; i < completedTasks.length; i++) {
    for (let j = i + 1; j < completedTasks.length; j++) {
      const task1 = completedTasks[i];
      const task2 = completedTasks[j];
      
      const priorityOrder = task1.priorityScore > task2.priorityScore;
      const completionOrder = new Date(task1.updatedAt) < new Date(task2.updatedAt);
      
      if (priorityOrder === completionOrder) {
        matches++;
      }
    }
  }

  return totalComparisons > 0 ? (matches / totalComparisons) * 100 : 0;
}