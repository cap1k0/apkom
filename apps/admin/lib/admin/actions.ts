'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveArticle(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string

  const payload = { slug, title, excerpt, content, published_at: new Date().toISOString() }

  const { error } = id
    ? await supabase.from('articles').update(payload).eq('id', id)
    : await supabase.from('articles').insert(payload)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function deleteArticle(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function uploadMedia(file: File) {
  const supabase = await createClient()
  const path = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('media').upload(path, file)
  if (error) return { error: error.message }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function savePage(formData: FormData) {
  const supabase = await createClient()
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('pages')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (error) return { error: error.message }
  revalidatePath(`/${slug}`)
  return { success: true }
}
