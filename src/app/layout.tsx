import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Digitory - Restaurant Management Software India | POS, Inventory & ERP Platform',
    template: '%s | Digitory',
  },
  description:
    'India\'s most comprehensive restaurant technology platform. POS, inventory management, recipe management, QR ordering, KDS, CRM & analytics for chains, pubs, QSRs and cloud kitchens.',
  keywords: [
    'restaurant management software India',
    'restaurant POS India',
    'inventory management for restaurants',
    'QR ordering system India',
    'restaurant ERP India',
    'multi outlet restaurant software',
    'restaurant chain management software',
    'cloud kitchen software India',
    'pub brewery management software',
    'restaurant analytics platform',
  ],
  authors: [{ name: 'Digitory Technologies' }],
  creator: 'Digitory Technologies',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Digitory',
    title: 'Digitory - Restaurant Management Software India',
    description:
      'India\'s most comprehensive restaurant technology platform for chains, pubs, QSRs and cloud kitchens.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digitory - Restaurant Management Software India',
    description:
      'India\'s most comprehensive restaurant technology platform for chains, pubs, QSRs and cloud kitchens.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Digitory',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web, Android, iOS',
              description:
                'India\'s most comprehensive restaurant technology platform offering POS, inventory management, recipe management, QR ordering, and analytics.',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'INR',
                lowPrice: '2999',
                highPrice: '14999',
                offerCount: '3',
              },
              author: {
                '@type': 'Organization',
                name: 'Digitory Technologies Pvt. Ltd.',
                url: 'https://www.digitory.com',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '520',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Digitory Technologies',
              url: 'https://www.digitory.com',
              logo: 'https://www.digitory.com/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-80-4567-8900',
                contactType: 'sales',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
              },
              sameAs: [
                'https://www.linkedin.com/company/digitory',
                'https://twitter.com/digitoryai',
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
