import { Metadata } from 'next'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await getSupabaseServiceClient()
  const { data } = await supabase
    .from('products')
    .select('title, subtitle, description, image_url, tags, tier, build_type, theme_category')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!data) {
    return {
      title: 'Build Not Found',
      description: 'The requested Minecraft build could not be found.',
    }
  }

  const buildTypeLabel = data.build_type.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const title = `${data.title} - ${buildTypeLabel} Minecraft Build Download`
  const description = data.subtitle || data.description?.substring(0, 160) || `Download ${data.title}, a premium ${data.theme_category} Minecraft build with instant access and step-by-step guide.`

  return {
    title,
    description,
    keywords: [
      data.title,
      `minecraft ${data.build_type}`,
      `minecraft ${data.theme_category}`,
      `${data.tier} tier`,
      ...(data.tags || []),
      'minecraft schematic',
      'minecraft download',
      'litematic',
      'world download',
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

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return children
}
