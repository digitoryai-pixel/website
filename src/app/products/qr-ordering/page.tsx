import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { QrCode, MonitorSmartphone, LayoutDashboard, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'QR Code Ordering System for Restaurants India - Contactless Dine-In',
  description:
    'QR code ordering system for restaurants. Let guests scan, browse menu, order & pay from their phone. Increase table turns by 25%. Boost average order value by 15-20%.',
  keywords: ['QR ordering system India', 'QR code ordering restaurant', 'contactless ordering restaurant', 'digital menu QR code', 'table ordering system India'],
}

export default function QROrderingPage() {
  return (
    <ProductPageLayout
      icon={QrCode}
      iconColor="text-violet-600"
      title="QR Code Ordering"
      headline="Let your guests order from their phones"
      subheadline="Scan, browse, order, pay — all from the guest's smartphone. Reduce wait times, increase table turns, and boost average order value with intelligent upselling."
      benefits={[
        { stat: '25%', label: 'Faster table turns' },
        { stat: '15-20%', label: 'Higher average order value' },
        { stat: '0', label: 'Order entry errors' },
        { stat: '3x', label: 'Faster repeat orders' },
      ]}
      features={[
        { title: 'Branded Digital Menu', description: 'Beautiful, mobile-optimized menu with high-quality images, descriptions, allergen info, and dietary filters.' },
        { title: 'Smart Upselling', description: 'Contextual add-on suggestions and combo recommendations that increase basket size by 15-20% on average.' },
        { title: 'Multi-Language Support', description: 'Serve guests in their preferred language. Support for English, Hindi, Kannada, Tamil, Telugu, and more.' },
        { title: 'Real-Time Menu Updates', description: 'Update prices, mark items as sold out, or add daily specials instantly. No reprinting menus, ever.' },
        { title: 'Table-Linked Ordering', description: 'Each QR code is linked to a specific table. Orders route directly to the kitchen with table identification.' },
        { title: 'Integrated Payments', description: 'Accept UPI, credit cards, and wallets directly through the ordering interface. Or let guests pay at the counter.' },
        { title: 'Order Status Tracking', description: 'Guests can see their order status in real-time — received, preparing, ready. Reduces staff interruptions.' },
        { title: 'Guest Feedback', description: 'Collect feedback and ratings immediately after the meal, while the experience is fresh in the guest\'s mind.' },
        { title: 'Analytics & Insights', description: 'Track QR adoption rates, popular items, peak ordering times, and conversion funnels to optimize the experience.' },
      ]}
      useCases={[
        'Casual dining restaurants reducing wait staff dependency during peak hours',
        'Pubs and breweries with high reorder frequency at tables',
        'Food courts with multiple vendors and centralized ordering',
        'Hotel restaurants offering in-room dining via QR codes',
        'Cafes and coffee shops with counter-service QR ordering',
      ]}
      faqs={[
        { q: 'How does QR code ordering work in a restaurant?', a: 'Guests scan a QR code placed at their table using their smartphone camera. This opens a digital menu in their browser — no app download needed. They browse the menu, add items to their cart, and place the order. The order goes directly to your POS and kitchen display system.' },
        { q: 'Does QR ordering replace waiters?', a: 'No, QR ordering complements your staff, not replaces them. It handles the order-taking process, freeing your waiters to focus on hospitality, recommendations, and service — the things that actually improve guest experience and tips.' },
        { q: 'Do guests need to download an app?', a: 'No. Digitory\'s QR ordering works entirely in the mobile browser. Guests simply scan the QR code and the menu opens instantly — no app download, no sign-up required. They can optionally save their preferences for future visits.' },
        { q: 'Can I customize the look of the digital menu?', a: 'Yes, the digital menu is fully brandable with your restaurant\'s colors, logo, fonts, and imagery. It looks and feels like your own branded experience, not a third-party ordering page.' },
      ]}
      relatedProducts={[
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Kitchen Display System', href: '/products/kitchen-display-system', icon: LayoutDashboard },
        { name: 'CRM & Loyalty', href: '/products/crm-loyalty', icon: Users },
        { name: 'QR Code Ordering', href: '/products/qr-ordering', icon: QrCode },
      ]}
    />
  )
}
