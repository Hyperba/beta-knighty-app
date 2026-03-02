import { Metadata } from 'next'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await getSupabaseServiceClient()
  const { data } = await supabase
    .from('products')
    .select('title, subtitle, description, image_url, tags, tier, build_type, theme_category')
    .eq('slug', params.slug)
    .single()

  if (!data) {
    return {
      title: 'Build Not Found',
    }
  }

  const title = `${data.title} - Premium Minecraft ${data.build_type.replace('_', ' ')} Download`
  const description = data.subtitle || data.description?.substring(0, 160) || `Download ${data.title}, a premium Minecraft build with instant access and step-by-step guide.`

  return {
    title,
    description,
    keywords: [
      data.title,
      `minecraft ${data.build_type}`,
      `minecraft ${data.theme_category}`,
      data.tier,
      ...(data.tags || []),
      'minecraft schematic',
      'minecraft download',
      'litematic',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/builds/${params.slug}`,
      images: [
        {
          url: data.image_url,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [data.image_url],
    },
  }
}
