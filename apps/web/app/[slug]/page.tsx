import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

const ALLOWED = ['privacy-policy', 'terms']

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!ALLOWED.includes(slug)) notFound()

  const supabase = await createClient()
  const { data: page } = await supabase.from('pages').select('*').eq('slug', slug).single()
  if (!page) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{page.title}</h1>
      <div className="whitespace-pre-wrap text-gray-700">{page.content}</div>
    </main>
  )
}
