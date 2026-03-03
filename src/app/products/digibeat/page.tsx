import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { Wrench, MonitorSmartphone, Package, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'DigiBeat - Restaurant Asset & Maintenance Management Software',
  description:
    'Track restaurant equipment, schedule preventive maintenance, manage service requests. Reduce equipment downtime by 60% with DigiBeat asset management.',
  keywords: ['restaurant asset management', 'restaurant equipment maintenance software', 'preventive maintenance restaurant', 'restaurant facility management', 'DigiBeat asset tracking'],
}

export default function DigiBeatPage() {
  return (
    <ProductPageLayout
      icon={Wrench}
      iconColor="text-slate-600"
      title="DigiBeat - Asset & Maintenance"
      headline="Keep every piece of equipment running"
      subheadline="Track your entire equipment fleet, schedule preventive maintenance, manage service vendors, and resolve breakdowns faster. Because downtime costs money."
      benefits={[
        { stat: '60%', label: 'Reduction in equipment downtime' },
        { stat: '35%', label: 'Lower maintenance costs' },
        { stat: '100%', label: 'Equipment visibility across outlets' },
        { stat: '2x', label: 'Faster breakdown resolution' },
      ]}
      features={[
        { title: 'Asset Registry', description: 'Complete digital record of every piece of equipment — make, model, serial number, purchase date, warranty, and location.' },
        { title: 'Preventive Maintenance', description: 'Schedule recurring maintenance tasks based on time intervals or usage hours. Never miss a service window.' },
        { title: 'Breakdown Management', description: 'Log breakdowns with photos, assign to vendors, track resolution time, and maintain full repair history.' },
        { title: 'Vendor Management', description: 'Maintain a directory of service vendors with ratings, response times, and cost history. Choose the right vendor faster.' },
        { title: 'AMC Tracking', description: 'Track Annual Maintenance Contracts — coverage periods, included services, and renewal dates for every piece of equipment.' },
        { title: 'Depreciation Tracking', description: 'Automatic depreciation calculation for all assets. Know the current book value and plan replacement budgets.' },
        { title: 'Mobile App for Staff', description: 'Outlet staff can log issues, attach photos, and track resolution status from their phones. No paperwork required.' },
        { title: 'SLA Monitoring', description: 'Set service level agreements with vendors. Track response time, resolution time, and escalate automatically when SLAs breach.' },
        { title: 'Cost Analysis', description: 'Track total cost of ownership for every asset category. Identify equipment that costs more to maintain than replace.' },
      ]}
      useCases={[
        'Chain restaurants managing kitchen equipment across 20+ outlets',
        'Breweries tracking specialized brewing equipment and maintenance schedules',
        'QSR chains with standardized equipment sets and replacement cycles',
        'Facility managers handling HVAC, plumbing, and electrical maintenance',
        'Operations heads planning annual capex budgets based on equipment lifecycle data',
      ]}
      faqs={[
        { q: 'What is DigiBeat?', a: 'DigiBeat is Digitory\'s asset and maintenance management module. It helps restaurants track all equipment, schedule preventive maintenance, manage breakdowns, and control maintenance costs across all outlets.' },
        { q: 'Can outlet staff report breakdowns via mobile?', a: 'Yes, DigiBeat includes a mobile app that lets outlet staff log breakdowns with photos, descriptions, and urgency levels. The request is automatically routed to the assigned vendor, and the staff member can track resolution progress in real-time.' },
        { q: 'Does DigiBeat track warranty and AMC information?', a: 'Yes, DigiBeat maintains complete warranty and AMC records for every asset. It alerts you before warranties expire, tracks AMC coverage and renewal dates, and helps you make informed decisions about extending contracts vs. self-managing maintenance.' },
        { q: 'How does preventive maintenance scheduling work?', a: 'You define maintenance tasks and set schedules based on time intervals (e.g., monthly deep clean) or usage hours (e.g., every 500 hours of operation). DigiBeat automatically generates work orders and notifies the assigned vendor or in-house team.' },
      ]}
      relatedProducts={[
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Inventory Management', href: '/products/inventory-management', icon: Package },
        { name: 'Asset Management', href: '/products/digibeat', icon: Wrench },
      ]}
    />
  )
}
