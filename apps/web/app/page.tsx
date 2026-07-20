import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, excerpt, published_at, slug')
    .order('published_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 border-b pb-6">
        <h1 className="text-2xl font-bold">News & Articles</h1>
        <p className="text-gray-500 mt-1 text-sm">Latest updates and stories</p>
      </header>

      <div className="space-y-8">
        {articles?.length ? (
          articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="block group">
              <h2 className="text-lg font-semibold group-hover:underline">{article.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
              <time className="text-xs text-gray-400 mt-2 block">
                {new Date(article.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No articles published yet.</p>
        )}
      </div>
    </main>
  )
}
