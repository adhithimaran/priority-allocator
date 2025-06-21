import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/auth - Simple authentication/user creation for MVP
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, action } = body; // action: 'login' or 'register'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (action === 'register') {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ 
          error: 'User already exists. Try logging in instead.' 
        }, { status: 409 });
      }

      // Create new user with default preferences
      const defaultPreferences = {
        workHours: {
          start: '09:00',
          end: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        energyPatterns: {
          morning: 8,
          afternoon: 6,
          evening: 4
        },
        breakDuration: 15, // minutes
        maxContinuousWork: 120, // minutes
        notifications: {
          taskReminders: true,
          scheduleUpdates: true,
          dailySummary: true
        }
      };

      const user = await prisma.user.create({
        data: {
          email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          preferences: defaultPreferences
        },
        select: {
          id: true,
          email: true,
          timezone: true,
          preferences: true,
          createdAt: true
        }
      });

      return NextResponse.json({ 
        user,
        message: 'User created successfully',
        isNewUser: true
      }, { status: 201 });

    } else if (action === 'login') {
      // Find existing user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          timezone: true,
          preferences: true,
          createdAt: true
        }
      });

      if (!user) {
        return NextResponse.json({ 
          error: 'User not found. Please register first.' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        user,
        message: 'Login successful',
        isNewUser: false
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "login" or "register"' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in auth:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// GET /api/auth - Validate user session (basic check for MVP)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({ error: 'User ID or email is required' }, { status: 400 });
    }

    const whereClause = userId ? { id: parseInt(userId) } : { email };

    const user = await prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        email: true,
        timezone: true,
        preferences: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's current stats for session info
    const taskCount = await prisma.task.count({
      where: { userId: user.id }
    });

    const activeSchedule = await prisma.schedule.findFirst({
      where: { 
        userId: user.id,
        isActive: true 
      },
      select: {
        id: true,
        generatedAt: true
      }
    });

    return NextResponse.json({ 
      user,
      session: {
        valid: true,
        taskCount,
        hasActiveSchedule: !!activeSchedule,
        lastScheduleGenerated: activeSchedule?.generatedAt || null
      }
    });

  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json({ error: 'Session validation failed' }, { status: 500 });
  }
}