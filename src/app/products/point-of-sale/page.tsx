import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import {
  MonitorSmartphone,
  Package,
  ChefHat,
  QrCode,
  LayoutDashboard,
  Users,
  BarChart3,
  Calculator,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant POS System India - Fast, Reliable Point of Sale',
  description:
    'Lightning-fast restaurant POS software built for Indian restaurants. Multi-format billing, offline mode, GST compliance, UPI payments. Perfect for chains, pubs & QSRs.',
  keywords: ['restaurant POS India', 'point of sale restaurant', 'restaurant billing software', 'POS system for restaurants India', 'GST billing software restaurant'],
}

export default function PointOfSalePage() {
  return (
    <ProductPageLayout
      icon={MonitorSmartphone}
      iconColor="text-primary-600"
      title="Point of Sale"
      headline="The fastest restaurant POS in India"
      subheadline="Sub-second billing for dine-in, takeaway, delivery, and bar orders. Works offline. GST-compliant. Built for speed at scale."
      benefits={[
        { stat: '<1s', label: 'Average billing time' },
        { stat: '99.9%', label: 'Uptime guarantee' },
        { stat: '30%', label: 'Faster table turns' },
        { stat: '0', label: 'Missed orders with offline mode' },
      ]}
      features={[
        { title: 'Multi-Format Billing', description: 'Handle dine-in, takeaway, delivery, bar tabs, and drive-through from a single terminal. Switch between modes seamlessly.' },
        { title: 'Offline Mode', description: 'Full billing capability even without internet. All data syncs automatically when connectivity is restored.' },
        { title: 'GST-Compliant Invoicing', description: 'Automatic GST calculation, GSTIN validation, and compliant invoice generation. Stay audit-ready at all times.' },
        { title: 'Table Management', description: 'Visual floor plan with real-time table status. Merge, split, and transfer tables with drag-and-drop simplicity.' },
        { title: 'Split Billing', description: 'Split bills by item, by person, or by percentage. Support for multiple payment methods on a single bill.' },
        { title: 'Menu Management', description: 'Centrally manage menus with categories, modifiers, combos, and dynamic pricing rules across all outlets.' },
        { title: 'Payment Integration', description: 'Accept UPI, cards, wallets, and cash. Integrated with Razorpay, Pine Labs, Paytm, and Google Pay.' },
        { title: 'Staff Management', description: 'Role-based access, shift management, and per-waiter performance tracking for complete accountability.' },
        { title: 'Real-Time Sync', description: 'All transactions sync to the cloud in real-time. Monitor every outlet from your headquarters dashboard.' },
      ]}
      useCases={[
        'Multi-outlet chains managing 10-200 outlets from a central dashboard',
        'Pubs and bars handling complex tab management and happy hour pricing',
        'QSR chains needing sub-second billing speed during peak hours',
        'Fine dining restaurants with split billing and floor plan management',
        'Cloud kitchens processing high-volume delivery orders',
      ]}
      faqs={[
        { q: 'Does the POS work offline?', a: 'Yes, Digitory POS has full offline capability. You can process orders, print bills, and manage tables without internet. All data syncs automatically when connectivity is restored.' },
        { q: 'Is Digitory POS GST compliant?', a: 'Absolutely. Digitory automatically calculates GST (CGST, SGST, IGST), validates GSTIN numbers, and generates compliant invoices. All tax reports are available for easy filing.' },
        { q: 'What hardware does Digitory POS support?', a: 'Digitory POS runs on Android tablets, Windows terminals, and iPads. It supports all major thermal printers, barcode scanners, and EDC machines from Pine Labs, Ingenico, and Verifone.' },
        { q: 'Can I manage multiple outlets from one POS system?', a: 'Yes, Digitory is designed for multi-outlet management. You can centrally control menus, pricing, promotions, and view real-time analytics for all outlets from a single dashboard.' },
      ]}
      relatedProducts={[
        { name: 'Kitchen Display System', href: '/products/kitchen-display-system', icon: LayoutDashboard },
        { name: 'QR Code Ordering', href: '/products/qr-ordering', icon: QrCode },
        { name: 'Inventory Management', href: '/products/inventory-management', icon: Package },
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
      ]}
    />
  )
}
