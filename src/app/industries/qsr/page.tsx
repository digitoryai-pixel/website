import type { Metadata } from 'next'
import IndustryPageLayout from '@/components/IndustryPageLayout'
import { Utensils, MonitorSmartphone, LayoutDashboard, Package, BarChart3, ChefHat } from 'lucide-react'

export const metadata: Metadata = {
  title: 'QSR & Fast Casual Restaurant Software India - Speed-Optimized POS',
  description:
    'Speed-optimized technology for QSR and fast casual chains. Sub-second billing, kitchen display integration, drive-through management. Handle 1000+ orders daily per outlet.',
  keywords: ['QSR POS software India', 'fast food billing software', 'quick service restaurant software', 'QSR chain management', 'fast casual restaurant POS'],
}

export default function QSRPage() {
  return (
    <IndustryPageLayout
      icon={Utensils}
      iconColor="text-red-600"
      industry="QSR & Fast Casual"
      headline="Speed is your brand. Your technology should match it."
      subheadline="Sub-second billing, integrated KDS, combo management, and drive-through support. Built for QSR chains that process 500-2000+ orders per outlet per day."
      stats={[
        { value: '100+', label: 'QSR locations powered' },
        { value: '<1s', label: 'Average billing time' },
        { value: '1000+', label: 'Orders per outlet daily' },
        { value: '30%', label: 'Faster speed of service' },
      ]}
      challenges={[
        { title: 'Speed-of-Service Pressure', description: 'Every second counts in QSR. Slow billing, kitchen delays, or payment processing bottlenecks directly impact revenue and customer satisfaction.' },
        { title: 'Consistency at Scale', description: 'Maintaining food quality, portion sizes, and taste consistency across 50-200 franchise outlets is nearly impossible without technology.' },
        { title: 'High-Volume Kitchen Coordination', description: 'Processing 1000+ orders daily requires seamless coordination between counter, kitchen, and packaging stations.' },
        { title: 'Combo & Meal Deal Complexity', description: 'Managing complex combo structures, upsell rules, and promotional offers across all outlets without billing errors.' },
        { title: 'Aggregator Order Management', description: 'Handling orders from Swiggy, Zomato, and direct channels simultaneously without dedicated staff for each platform.' },
        { title: 'Franchise Compliance', description: 'Ensuring every franchise outlet follows brand standards for pricing, recipes, and operations without physical audits.' },
      ]}
      solutions={[
        { module: 'Speed-Optimized POS', description: 'Sub-second billing with combo shortcuts, quick-add buttons, and one-tap payment. Designed for QSR counter speed.', icon: MonitorSmartphone, href: '/products/point-of-sale' },
        { module: 'Kitchen Display System', description: 'Multi-station order routing, preparation time tracking, and color-coded priority management for high-volume kitchens.', icon: LayoutDashboard, href: '/products/kitchen-display-system' },
        { module: 'Central Supply Chain', description: 'Centralized procurement, automated reordering, and vendor management across all QSR locations.', icon: Package, href: '/products/inventory-management' },
        { module: 'Recipe Standardization', description: 'Standardize every recipe with exact quantities. Ensure the same taste at every outlet with zero deviation.', icon: ChefHat, href: '/products/recipe-management' },
        { module: 'Performance Analytics', description: 'Speed-of-service reports, peak hour analysis, and outlet comparison dashboards for operations teams.', icon: BarChart3, href: '/products/analytics' },
        { module: 'Franchise Operations', description: 'Outlet-specific access controls, standardized menus, and automated compliance monitoring for franchise partners.', icon: MonitorSmartphone, href: '/products/point-of-sale' },
      ]}
      outcomes={[
        '30% improvement in speed of service with optimized POS and KDS workflows',
        'Sub-second billing handling 1000+ daily orders without slowdowns',
        '100% recipe consistency across all franchise outlets',
        'Automated combo pricing and promotional offers — zero billing errors',
        'Single dashboard for all order channels — counter, delivery, drive-through',
        'Real-time speed-of-service tracking and kitchen efficiency reports',
        'Centralized supply chain reducing procurement costs by 12%',
      ]}
      faqs={[
        { q: 'Can Digitory handle 1000+ orders per day per outlet?', a: 'Yes, Digitory\'s POS is designed for high-volume QSR operations. It handles 1000+ orders per day per outlet with sub-second billing times. Our architecture is built for peak load without degradation — we\'ve tested up to 5000 orders per day on a single terminal.' },
        { q: 'Does Digitory support drive-through operations?', a: 'Yes, Digitory supports drive-through with dedicated order-taking screens, kitchen routing, and fulfillment tracking. Orders are tagged as drive-through and routed with appropriate priority to the kitchen and packaging stations.' },
        { q: 'How does Digitory help with QSR franchise management?', a: 'Digitory provides franchise-specific features: centralized menu and pricing control, outlet-specific access levels, automated compliance monitoring, standardized recipes, and consolidated financial reporting. Franchisees operate within your brand standards while having autonomy for local execution.' },
        { q: 'Can I manage combo meals and promotional offers centrally?', a: 'Yes, you define combo structures, upsell rules, and promotional offers at the chain level and push them to all outlets. Time-based promotions, BOGO deals, and meal deals are configured once and activated across the entire network simultaneously.' },
      ]}
    />
  )
}
