import { list, put, del } from '@vercel/blob'
import { createClient } from '@vercel/kv'

export interface ScheduledVideo {
  url: string
  title: string
  description: string
  scheduledDate: string
  pathname: string
  blobUrl: string
}

export async function saveVideo(
  videoBuffer: Buffer,
  filename: string,
  metadata: {
    title: string
    description: string
    scheduledDate: string
  }
) {
  const arrayBuffer = videoBuffer.buffer.slice(
    videoBuffer.byteOffset,
    videoBuffer.byteOffset + videoBuffer.byteLength
  ) as ArrayBuffer
  const blob = new Blob([arrayBuffer])

  const putBlob = await put(filename, blob, {
    access: 'public',
    addRandomSuffix: true,
  })

  const videoData: ScheduledVideo = {
    url: putBlob.url,
    title: metadata.title,
    description: metadata.description,
    scheduledDate: metadata.scheduledDate,
    pathname: putBlob.pathname,
    blobUrl: putBlob.url,
  }

  const key = `video:${putBlob.pathname}`
  if (typeof window === 'undefined') {
    const { default: kv } = await import('@vercel/kv')
    await kv.set(key, videoData)
  }

  return putBlob
}

export async function getScheduledVideosForToday(): Promise<ScheduledVideo[]> {
  const today = new Date().toISOString().split('T')[0]
  const { blobs } = await list()

  const scheduledVideos: ScheduledVideo[] = []

  for (const blob of blobs) {
    if (blob.pathname.startsWith('videos/')) {
      const key = `video:${blob.pathname}`
      if (typeof window === 'undefined') {
        try {
          const { default: kv } = await import('@vercel/kv')
          const videoData = await kv.get<ScheduledVideo>(key)
          if (videoData && videoData.scheduledDate === today) {
            scheduledVideos.push(videoData)
          }
        } catch (error) {
          console.error('Error fetching video metadata:', error)
        }
      }
    }
  }

  return scheduledVideos
}

export async function deleteVideo(pathname: string) {
  await del(pathname)
  const key = `video:${pathname}`
  if (typeof window === 'undefined') {
    try {
      const { default: kv } = await import('@vercel/kv')
      await kv.del(key)
    } catch (error) {
      console.error('Error deleting video metadata:', error)
    }
  }
}

export async function downloadVideo(url: string): Promise<Buffer> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
