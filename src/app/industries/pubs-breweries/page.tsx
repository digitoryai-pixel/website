import type { Metadata } from 'next'
import IndustryPageLayout from '@/components/IndustryPageLayout'
import { Beer, MonitorSmartphone, Package, QrCode, BarChart3, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pub & Brewery Management Software India - POS, Inventory & Tab Management',
  description:
    'Purpose-built technology for pubs, breweries, and bars. Tab management, draught beer tracking, happy hour automation, liquor inventory & high-volume beverage operations.',
  keywords: ['pub management software India', 'brewery management software', 'bar POS system India', 'liquor inventory management', 'pub billing software'],
}

export default function PubsBreweriesPage() {
  return (
    <IndustryPageLayout
      icon={Beer}
      iconColor="text-amber-600"
      industry="Pubs & Breweries"
      headline="Built for the speed and complexity of beverage operations"
      subheadline="Tab management, draught beer tracking, happy hour automation, and liquor inventory — all purpose-built for pubs, craft breweries, and cocktail bars."
      stats={[
        { value: '50+', label: 'Pubs & breweries powered' },
        { value: '20%', label: 'Reduction in liquor variance' },
        { value: '25%', label: 'Faster table turns with QR ordering' },
        { value: '2x', label: 'Faster peak-hour billing' },
      ]}
      challenges={[
        { title: 'Complex Tab Management', description: 'Pubs need to open, transfer, split, and close tabs rapidly during peak hours. Slow tab handling kills the vibe and costs revenue.' },
        { title: 'Liquor Inventory Shrinkage', description: 'High-value liquor inventory is prone to pilferage and over-pouring. Without peg-level tracking, losses add up quickly.' },
        { title: 'Happy Hour Complexity', description: 'Managing time-based promotions, BOGO deals, and dynamic pricing across different days and dayparts is error-prone with generic POS.' },
        { title: 'Draught Beer Wastage', description: 'Draught beer lines have inherent wastage. Without keg-level tracking, you can\'t distinguish between operational waste and actual loss.' },
        { title: 'High-Volume Peak Service', description: 'Friday and Saturday nights can see 5-10x normal volume. Your POS needs to keep pace without crashes or slowdowns.' },
        { title: 'Compliance & Age Verification', description: 'Managing excise compliance, age verification, and serving limit regulations adds operational complexity.' },
      ]}
      solutions={[
        { module: 'Bar-Optimized POS', description: 'Open tabs in one tap, split bills by person or item, transfer tabs between bartenders, and close out with multiple payment methods.', icon: MonitorSmartphone, href: '/products/point-of-sale' },
        { module: 'Liquor Inventory Tracking', description: 'Peg-level inventory tracking for bottles, keg-level tracking for draught. Automated variance reports flag discrepancies daily.', icon: Package, href: '/products/inventory-management' },
        { module: 'QR Reordering', description: 'Guests reorder directly from their phone. No waving for the waiter. Especially powerful in high-volume, noisy environments.', icon: QrCode, href: '/products/qr-ordering' },
        { module: 'Revenue Analytics', description: 'Track revenue by daypart, day of week, and drink category. Optimize happy hour timing and promotions with data.', icon: BarChart3, href: '/products/analytics' },
        { module: 'Bar Loyalty Programs', description: 'Create membership programs, track visit frequency, and reward your most loyal regulars with exclusive perks.', icon: Users, href: '/products/crm-loyalty' },
        { module: 'Happy Hour Automation', description: 'Define time-based pricing rules, BOGO deals, and promotional offers that activate and deactivate automatically.', icon: MonitorSmartphone, href: '/products/point-of-sale' },
      ]}
      outcomes={[
        '20% reduction in liquor variance through peg-level inventory tracking',
        '25% faster table turns with QR-based reordering during peak hours',
        '100% accurate happy hour pricing with automated time-based rules',
        'Complete keg-level tracking for draught beer — know exactly what\'s in each line',
        '2x faster tab management during Friday/Saturday peak service',
        'Loyalty programs that turn weekend visitors into weekly regulars',
        'Real-time cost of goods tracking for every drink on the menu',
      ]}
      faqs={[
        { q: 'Does Digitory support tab management for pubs?', a: 'Yes, Digitory has purpose-built tab management for pubs and bars. Open tabs with a single tap, add items from any terminal, transfer between bartenders, split bills by person or item, and close with multiple payment methods. All of this works at bar-speed during peak hours.' },
        { q: 'How does Digitory track liquor inventory?', a: 'Digitory tracks liquor at the peg level for bottles and at the keg level for draught beer. When a drink is billed, the recipe-based consumption is automatically deducted from inventory. Daily variance reports show the difference between theoretical and actual consumption.' },
        { q: 'Can I set up automated happy hour pricing?', a: 'Yes, you define time-based pricing rules — for example, 50% off draught beers from 5-7 PM on weekdays. These rules activate and deactivate automatically. You can set different rules for different days and include complex promotions like BOGO and group deals.' },
        { q: 'Does the QR ordering work well in noisy pub environments?', a: 'Perfectly. In fact, QR ordering is most impactful in pubs and breweries where it\'s hard to get a waiter\'s attention during peak hours. Guests scan, reorder their favorite drinks, and the order goes straight to the bar. Average reorder time drops from 8 minutes to 30 seconds.' },
      ]}
    />
  )
}
