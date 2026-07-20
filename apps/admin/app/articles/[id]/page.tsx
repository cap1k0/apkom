import { createClient } from '@/lib/supabase/server'
import ArticleEditor from './editor'

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const article =
    id === 'new' ? null : (await supabase.from('articles').select('*').eq('id', id).single()).data

  return <ArticleEditor article={article} />
}
