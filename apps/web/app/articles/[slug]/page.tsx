import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!article) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <time className="text-xs text-gray-400">
        {new Date(article.published_at).toLocaleDateString('en-US')}
      </time>
      <div className="mt-6 prose whitespace-pre-wrap">{article.content}</div>
    </main>
  )
}
