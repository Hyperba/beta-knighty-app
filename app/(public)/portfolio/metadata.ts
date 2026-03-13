import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio - Showcase of Our Best Minecraft Builds',
  description: 'Explore our portfolio of award-winning Minecraft builds. From medieval castles to modern architecture, see what we can create.',
  keywords: ['minecraft portfolio', 'build showcase', 'minecraft gallery', 'best builds', 'minecraft creations'],
  openGraph: {
    title: 'Portfolio - Showcase of Our Best Minecraft Builds',
    description: 'Explore our portfolio of award-winning Minecraft builds. From medieval castles to modern architecture.',
    url: '/portfolio',
    type: 'website',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio - Showcase of Our Best Minecraft Builds',
    description: 'Explore our portfolio of award-winning Minecraft builds.',
    images: ['/og-image.jpeg'],
  },
}
