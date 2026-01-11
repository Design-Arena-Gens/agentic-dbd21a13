import { NextRequest, NextResponse } from 'next/server'
import { saveVideo } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const scheduledDate = formData.get('scheduledDate') as string

    if (!videoFile || !title || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bytes = await videoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const blob = await saveVideo(
      buffer,
      `videos/${videoFile.name}`,
      {
        title,
        description,
        scheduledDate,
      }
    )

    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
      scheduledDate,
    })
  } catch (error: any) {
    console.error('Error scheduling video:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to schedule video' },
      { status: 500 }
    )
  }
}
