import { google } from 'googleapis'
import { Readable } from 'stream'

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
)

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
})

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
})

export async function uploadToYouTube(
  videoBuffer: Buffer,
  title: string,
  description: string
) {
  try {
    const videoStream = Readable.from(videoBuffer)

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: 'public',
        },
      },
      media: {
        body: videoStream,
      },
    })

    return {
      success: true,
      videoId: response.data.id,
      url: `https://www.youtube.com/watch?v=${response.data.id}`,
    }
  } catch (error: any) {
    console.error('YouTube upload error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export function getAuthUrl() {
  const scopes = ['https://www.googleapis.com/auth/youtube.upload']

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })
}

export async function getTokenFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}
