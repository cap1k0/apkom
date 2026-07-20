import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteArticle } from '@/lib/admin/actions'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, published_at')
    .order('published_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">CMS Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/pages" className="text-sm text-gray-600 hover:underline">
            Privacy & Terms
          </Link>
          <Link href="/articles/new" className="bg-black text-white text-sm px-4 py-2 rounded-lg">
            New Article
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {articles?.map((a) => (
          <div key={a.id} className="flex justify-between items-center border rounded-lg px-4 py-3">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-gray-400">{a.slug}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/articles/${a.id}`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <form
                action={async () => {
                  'use server'
                  await deleteArticle(a.id)
                }}
              >
                <button className="text-red-600 hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
