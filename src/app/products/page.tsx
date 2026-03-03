import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MonitorSmartphone, Package, ChefHat, QrCode, LayoutDashboard,
  Users, CreditCard, Wrench, BarChart3, Calculator, ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant Management Software Products - Complete Technology Platform',
  description:
    'Explore Digitory\'s complete restaurant technology platform: POS, inventory, recipe management, QR ordering, KDS, CRM, prepaid cards, asset management, analytics & Tally automation.',
}

const products = [
  { icon: MonitorSmartphone, name: 'Point of Sale', desc: 'Lightning-fast billing with multi-format support, offline mode, GST compliance, and centralized menu management.', href: '/products/point-of-sale', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { icon: Package, name: 'Inventory Management', desc: 'Real-time stock tracking, automated purchase orders, vendor management, wastage control, and variance analysis.', href: '/products/inventory-management', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { icon: ChefHat, name: 'Recipe Management', desc: 'Standardize recipes, track ingredient costs, manage sub-recipes, and maintain food quality consistency.', href: '/products/recipe-management', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { icon: QrCode, name: 'QR Code Ordering', desc: 'Contactless dine-in ordering with smart upselling, multi-language support, and integrated payments.', href: '/products/qr-ordering', color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { icon: LayoutDashboard, name: 'Kitchen Display System', desc: 'Paperless kitchen operations with multi-station routing, color-coded priorities, and preparation tracking.', href: '/products/kitchen-display-system', color: 'bg-red-50 text-red-600 border-red-100' },
  { icon: Users, name: 'CRM & Loyalty', desc: 'Unified customer profiles, smart segmentation, automated campaigns, and flexible loyalty programs.', href: '/products/crm-loyalty', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { icon: CreditCard, name: 'Prepaid Cards', desc: 'Physical and digital prepaid cards for corporate dining, gifting, and loyalty. Drive upfront revenue.', href: '/products/prepaid-cards', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { icon: Wrench, name: 'DigiBeat - Asset Management', desc: 'Equipment tracking, preventive maintenance scheduling, vendor management, and cost analysis.', href: '/products/digibeat', color: 'bg-slate-50 text-slate-600 border-slate-100' },
  { icon: BarChart3, name: 'Executive Analytics', desc: 'Real-time dashboards, outlet comparisons, product mix analysis, and 50+ pre-built report templates.', href: '/products/analytics', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { icon: Calculator, name: 'Tally Automation', desc: 'Automatic sync of sales, purchases, and expenses to Tally ERP. GST-ready accounting integration.', href: '/products/tally-automation', color: 'bg-teal-50 text-teal-600 border-teal-100' },
]

export default function ProductsPage() {
  return (
    <>
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900">
              10 modules. One platform. <span className="gradient-text">Zero gaps.</span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-gray-600">
              Every module in Digitory is designed to work seamlessly together. No integrations to manage, no data silos to bridge, no compromises to make.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((p) => (
              <Link
                key={p.name}
                href={p.href}
                className="flex items-start gap-5 p-6 lg:p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center shrink-0`}>
                  <p.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {p.name}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-primary-600">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            See all 10 modules working together
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Book a personalized demo and discover how Digitory&apos;s integrated platform can transform your restaurant operations.
          </p>
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book a Free Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
