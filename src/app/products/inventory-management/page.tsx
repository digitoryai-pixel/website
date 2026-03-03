import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { Package, MonitorSmartphone, ChefHat, BarChart3, Calculator } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant Inventory Management Software - Real-Time Stock Control',
  description:
    'Real-time inventory tracking for restaurants across all outlets. Automated purchase orders, vendor management, wastage control & stock alerts. Reduce food costs by 10-18%.',
  keywords: ['inventory management for restaurants', 'restaurant stock management software', 'food inventory software India', 'restaurant inventory tracking', 'multi outlet inventory management'],
}

export default function InventoryManagementPage() {
  return (
    <ProductPageLayout
      icon={Package}
      iconColor="text-emerald-600"
      title="Inventory Management"
      headline="Real-time inventory control across every outlet"
      subheadline="Track stock levels, automate purchase orders, manage vendors, and reduce food costs by 10-18% with precision inventory management built for restaurants."
      benefits={[
        { stat: '10-18%', label: 'Reduction in food costs' },
        { stat: 'Real-time', label: 'Stock visibility across outlets' },
        { stat: '90%', label: 'Less manual data entry' },
        { stat: '2x', label: 'Faster stock audits' },
      ]}
      features={[
        { title: 'Real-Time Stock Tracking', description: 'Live inventory levels across all outlets. Know exactly what you have, where it is, and when to reorder.' },
        { title: 'Automated Purchase Orders', description: 'Set reorder points and let the system generate purchase orders automatically when stock falls below threshold.' },
        { title: 'Vendor Management', description: 'Compare vendor pricing, track delivery performance, and maintain a central vendor directory for all outlets.' },
        { title: 'Wastage Monitoring', description: 'Log and categorize wastage by type — spoilage, preparation waste, returns. Identify patterns and reduce losses.' },
        { title: 'Stock Transfer Management', description: 'Transfer inventory between outlets with full audit trail. Track inter-outlet movements with approval workflows.' },
        { title: 'Batch & Expiry Tracking', description: 'FIFO-based batch management with expiry date tracking. Get alerts before items expire to minimize waste.' },
        { title: 'Variance Analysis', description: 'Compare theoretical consumption (from recipes) vs actual usage. Identify discrepancies and plug revenue leaks.' },
        { title: 'Central Kitchen Support', description: 'Manage production orders, raw material consumption, and finished goods distribution from central kitchens.' },
        { title: 'GRN & Quality Checks', description: 'Structured goods receiving with quantity verification, quality inspection checklists, and photo documentation.' },
      ]}
      useCases={[
        'Chain restaurants tracking inventory across 10+ outlets in real-time',
        'Central kitchens managing raw material procurement and finished goods distribution',
        'Pubs and breweries monitoring high-value liquor inventory with bottle-level tracking',
        'QSR chains with standardized procurement and vendor management across locations',
        'Cloud kitchens managing shared ingredients across multiple brands',
      ]}
      faqs={[
        { q: 'How does Digitory reduce food costs?', a: 'Digitory reduces food costs through precise recipe-based consumption tracking, automated reorder points, wastage monitoring, vendor price comparison, and variance analysis. Restaurants typically see 10-18% cost reduction within 6 months.' },
        { q: 'Can I track inventory across multiple outlets?', a: 'Yes, Digitory provides real-time inventory visibility across all your outlets from a single dashboard. You can track stock levels, movements, and consumption patterns for each location independently or in aggregate.' },
        { q: 'Does Digitory support central kitchen operations?', a: 'Yes, Digitory supports central kitchen operations including production orders, raw material consumption tracking, finished goods management, and distribution to satellite outlets with full traceability.' },
        { q: 'How does the automated purchase ordering work?', a: 'You set reorder points and preferred vendors for each item. When stock falls below the threshold, Digitory automatically generates a purchase order and sends it to the designated vendor for approval.' },
      ]}
      relatedProducts={[
        { name: 'Recipe Management', href: '/products/recipe-management', icon: ChefHat },
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
        { name: 'Tally Automation', href: '/products/tally-automation', icon: Calculator },
      ]}
    />
  )
}
