import { prisma } from '@/lib/database'
import { calculatePriority } from '@/lib/algorithms/priority-calculator'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()

    // Calculate priority using your algorithm
    const priorityScore = calculatePriority(data)

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
        difficultyLevel: data.difficultyLevel,
        dueDate: new Date(data.dueDate),
        importanceLevel: data.importanceLevel,
        priorityScore,
        userId: 'temp-user-id', // For MVP single user
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { priorityScore: 'desc' },
      include: {
        timeBlocks: true, // Include related time blocks
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
