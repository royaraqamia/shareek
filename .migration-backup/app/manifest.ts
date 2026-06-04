import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'شَريك',
    short_name: 'شَريك',
    description: '',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/shareek_logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/shareek_logo.png',
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
