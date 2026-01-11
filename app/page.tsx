'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !scheduledDate) {
      setMessage('Please fill in all required fields')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('scheduledDate', scheduledDate)

      const response = await fetch('/api/schedule', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Video scheduled successfully!')
        setFile(null)
        setTitle('')
        setDescription('')
        setScheduledDate('')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to schedule video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">YouTube Auto Uploader</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Schedule Video Upload</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="video" className="block text-sm font-medium mb-2">
              Video File *
            </label>
            <input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Video title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Video description"
            />
          </div>

          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium mb-2">
              Upload Date *
            </label>
            <input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded disabled:opacity-50"
          >
            {uploading ? 'Scheduling...' : 'Schedule Upload'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload your video and set the scheduled date</li>
          <li>Video is stored securely in Vercel Blob storage</li>
          <li>Use external cron service (e.g., cron-job.org) to trigger daily uploads</li>
          <li>Videos scheduled for today are automatically uploaded to YouTube</li>
        </ol>

        <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
          <h3 className="font-semibold mb-2">Setup Required:</h3>
          <p className="text-sm mb-2">1. Configure environment variables in Vercel:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-4">
            <li>YOUTUBE_CLIENT_ID</li>
            <li>YOUTUBE_CLIENT_SECRET</li>
            <li>YOUTUBE_REDIRECT_URI</li>
            <li>YOUTUBE_REFRESH_TOKEN</li>
            <li>BLOB_READ_WRITE_TOKEN</li>
            <li>KV_REST_API_URL</li>
            <li>KV_REST_API_TOKEN</li>
            <li>CRON_SECRET (random string)</li>
          </ul>
          <p className="text-sm mt-3 mb-2">2. Set up daily trigger at cron-job.org:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-4">
            <li>URL: https://agentic-dbd21a13.vercel.app/api/trigger</li>
            <li>Method: POST</li>
            <li>Body: {'{"secret": "your_CRON_SECRET"}'}</li>
            <li>Schedule: Daily at 10:00 AM</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
