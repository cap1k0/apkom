import { createClient } from '@/lib/supabase/server'
import { savePage } from '@/lib/admin/actions'

export default async function PagesAdmin() {
  const supabase = await createClient()
  const { data: pages } = await supabase.from('pages').select('*')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-xl font-semibold">Privacy & Terms</h1>

      {pages?.map((p) => (
        <form key={p.slug} action={savePage} className="space-y-3 border-b pb-8">
          <input type="hidden" name="slug" value={p.slug} />
          <h2 className="font-medium text-sm text-gray-500">{p.slug}</h2>
          <input
            name="title"
            defaultValue={p.title}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            name="content"
            defaultValue={p.content}
            rows={10}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          />
          <button className="bg-black text-white rounded-lg px-5 py-2 text-sm font-medium">
            Save
          </button>
        </form>
      ))}
    </div>
  )
}
