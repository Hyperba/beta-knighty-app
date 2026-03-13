import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - The Story Behind KnightyBuilds',
  description: 'Learn about KnightyBuilds and our mission to deliver premium Minecraft builds to builders worldwide. Join thousands of creators.',
  keywords: ['about knighty builds', 'minecraft creators', 'build team', 'minecraft community'],
  openGraph: {
    title: 'About Us - The Story Behind KnightyBuilds',
    description: 'Learn about KnightyBuilds and our mission to deliver premium Minecraft builds to builders worldwide.',
    url: '/about',
    type: 'website',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - The Story Behind KnightyBuilds',
    description: 'Learn about KnightyBuilds and our mission to deliver premium Minecraft builds to builders worldwide.',
    images: ['/og-image.jpeg'],
  },
}
