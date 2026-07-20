'use client'

import { useState } from 'react'
import { saveArticle, uploadMedia } from '@/lib/admin/actions'

export default function ArticleEditor({ article }: { article: any }) {
  const [message, setMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const result = await uploadMedia(file)
    setUploading(false)
    if (result.url) setImageUrl(result.url)
  }

  async function handleSubmit(formData: FormData) {
    if (article?.id) formData.set('id', article.id)
    const result = await saveArticle(formData)
    setMessage(result?.error ?? 'Saved.')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold mb-6">{article ? 'Edit Article' : 'New Article'}</h1>

      <form action={handleSubmit} className="space-y-4">
        <input
          name="title"
          defaultValue={article?.title}
          placeholder="Title"
          required
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="slug"
          defaultValue={article?.slug}
          placeholder="slug-like-this"
          required
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <textarea
          name="excerpt"
          defaultValue={article?.excerpt}
          placeholder="Short excerpt"
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <div>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
          {imageUrl && (
            <p className="text-xs text-gray-500 mt-1 break-all">Copy into content: {imageUrl}</p>
          )}
        </div>

        <textarea
          name="content"
          defaultValue={article?.content}
          placeholder="Full article content (markdown/html)"
          rows={12}
          required
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
        />

        <button type="submit" className="bg-black text-white rounded-lg px-5 py-2 text-sm font-medium">
          Save
        </button>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  )
}
