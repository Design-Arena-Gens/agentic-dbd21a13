import { NextRequest, NextResponse } from 'next/server'
import { getScheduledVideosForToday, deleteVideo, downloadVideo } from '@/lib/storage'
import { uploadToYouTube } from '@/lib/youtube'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const scheduledVideos = await getScheduledVideosForToday()

    if (scheduledVideos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No videos scheduled for today',
        uploaded: 0,
      })
    }

    const results = []

    for (const video of scheduledVideos) {
      try {
        console.log(`Downloading video: ${video.title}`)
        const videoBuffer = await downloadVideo(video.url)

        console.log(`Uploading to YouTube: ${video.title}`)
        const uploadResult = await uploadToYouTube(
          videoBuffer,
          video.title,
          video.description
        )

        if (uploadResult.success) {
          console.log(`Successfully uploaded: ${video.title}`)
          await deleteVideo(video.pathname)
          results.push({
            title: video.title,
            success: true,
            youtubeUrl: uploadResult.url,
          })
        } else {
          console.error(`Failed to upload: ${video.title}`, uploadResult.error)
          results.push({
            title: video.title,
            success: false,
            error: uploadResult.error,
          })
        }
      } catch (error: any) {
        console.error(`Error processing video: ${video.title}`, error)
        results.push({
          title: video.title,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} videos, ${successCount} uploaded successfully`,
      results,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    )
  }
}
