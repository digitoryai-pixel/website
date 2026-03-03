import type { Metadata } from 'next'
import IndustryPageLayout from '@/components/IndustryPageLayout'
import { CloudCog, MonitorSmartphone, LayoutDashboard, Package, BarChart3, ChefHat } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cloud Kitchen Management Software India - Multi-Brand Operations',
  description:
    'Complete cloud kitchen software for multi-brand operations. Aggregator integration, central kitchen management, multi-brand inventory & analytics. Manage 5+ brands from one platform.',
  keywords: ['cloud kitchen software India', 'dark kitchen management software', 'virtual restaurant software', 'multi brand cloud kitchen', 'cloud kitchen POS India'],
}

export default function CloudKitchensPage() {
  return (
    <IndustryPageLayout
      icon={CloudCog}
      iconColor="text-violet-600"
      industry="Cloud Kitchens"
      headline="Multiple brands. One kitchen. Zero chaos."
      subheadline="Manage multiple virtual brands from a single kitchen. Unified aggregator integration, shared inventory, brand-specific menus, and centralized operations."
      stats={[
        { value: '75+', label: 'Cloud kitchen brands managed' },
        { value: '5+', label: 'Brands per kitchen supported' },
        { value: '99.5%', label: 'Order accuracy rate' },
        { value: '12%', label: 'Avg food cost savings' },
      ]}
      challenges={[
        { title: 'Multi-Brand Complexity', description: 'Running 3-10 brands from one kitchen means separate menus, separate pricing, and separate aggregator listings — but shared kitchen resources.' },
        { title: 'Aggregator Chaos', description: 'Managing separate tablets for Swiggy, Zomato, and direct orders leads to missed orders, manual errors, and kitchen confusion.' },
        { title: 'Shared Inventory Allocation', description: 'When multiple brands share the same raw ingredients, tracking consumption and costs per brand becomes a nightmare without technology.' },
        { title: 'Kitchen Throughput Optimization', description: 'Maximizing orders per hour from a fixed kitchen size requires intelligent order routing and preparation sequencing.' },
        { title: 'Brand-Level P&L', description: 'Understanding profitability at the brand level — not just the kitchen level — requires precise cost allocation and revenue tracking.' },
        { title: 'Rider Coordination', description: 'Coordinating with multiple delivery aggregator riders while maintaining order accuracy and packaging correctness.' },
      ]}
      solutions={[
        { module: 'Unified Order Management', description: 'All orders from Swiggy, Zomato, direct channels, and walk-ins flow into a single dashboard. No more juggling multiple tablets.', icon: MonitorSmartphone, href: '/products/point-of-sale' },
        { module: 'Multi-Brand KDS', description: 'Kitchen screens show orders by brand with clear visual differentiation. Station-based routing ensures the right kitchen team handles each brand.', icon: LayoutDashboard, href: '/products/kitchen-display-system' },
        { module: 'Shared Inventory Management', description: 'Track common ingredients used across brands. Automatically allocate consumption costs to the correct brand based on recipe definitions.', icon: Package, href: '/products/inventory-management' },
        { module: 'Brand-Level Recipe Costing', description: 'Define brand-specific recipes using shared ingredients. Know the exact cost of every item for every brand in real-time.', icon: ChefHat, href: '/products/recipe-management' },
        { module: 'Brand P&L Analytics', description: 'Revenue, food costs, and profitability reports at the brand level. Make informed decisions about which brands to scale, optimize, or sunset.', icon: BarChart3, href: '/products/analytics' },
        { module: 'Central Kitchen Operations', description: 'Manage production orders, batch cooking, and distribution to satellite kitchens or direct delivery fulfillment.', icon: Package, href: '/products/inventory-management' },
      ]}
      outcomes={[
        'Unified dashboard replacing 3-5 aggregator tablets per kitchen',
        '99.5% order accuracy with integrated aggregator and KDS workflow',
        'Precise brand-level P&L tracking with shared ingredient cost allocation',
        '12% food cost savings through centralized procurement and recipe management',
        'Maximized kitchen throughput with intelligent order sequencing',
        'Brand-specific analytics for data-driven portfolio decisions',
        'Single vendor relationship replacing 5-8 point solutions',
      ]}
      faqs={[
        { q: 'Can Digitory manage multiple brands from one cloud kitchen?', a: 'Yes, Digitory is purpose-built for multi-brand cloud kitchen operations. You can manage 5+ brands from a single kitchen with separate menus, pricing, and aggregator listings — but shared inventory, kitchen staff, and equipment. Each brand gets its own P&L tracking.' },
        { q: 'Does Digitory integrate with Swiggy and Zomato?', a: 'Yes, Digitory integrates directly with Swiggy, Zomato, and other major aggregators. Orders flow into a unified dashboard and automatically route to the kitchen display system. No more missed orders from juggling multiple tablets.' },
        { q: 'How does shared inventory work across brands?', a: 'You define recipes for each brand using shared raw ingredients. When an order is placed for Brand A, the ingredients are consumed from the shared inventory and the cost is allocated to Brand A. This gives you accurate brand-level food costing without separate inventory for each brand.' },
        { q: 'Can I track profitability per brand?', a: 'Yes, Digitory provides brand-level P&L analytics. Revenue from each aggregator is attributed to the correct brand. Ingredient costs are allocated based on recipes. This gives you clear visibility into which brands are profitable and which need optimization.' },
      ]}
    />
  )
}
