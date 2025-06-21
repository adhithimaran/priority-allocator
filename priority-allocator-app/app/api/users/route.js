import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users - Get user profile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    
    if (!email && !userId) {
      return NextResponse.json({ error: 'Email or User ID is required' }, { status: 400 });
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, timezone, preferences } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Default preferences for MVP
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
      maxContinuousWork: 120 // minutes
    };

    const user = await prisma.user.create({
      data: {
        email,
        timezone: timezone || 'UTC',
        preferences: preferences || defaultPreferences
      },
      select: {
        id: true,
        email: true,
        timezone: true,
        preferences: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT /api/users - Update user preferences
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, timezone, preferences } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (timezone) updateData.timezone = timezone;
    if (preferences) updateData.preferences = preferences;

    const user = await prisma.user.update({
      where: {
        id: parseInt(userId)
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        timezone: true,
        preferences: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}