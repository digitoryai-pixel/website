import Link from 'next/link'
import {
  MonitorSmartphone,
  Package,
  ChefHat,
  QrCode,
  LayoutDashboard,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Star,
  Building2,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Store,
  Beer,
  Utensils,
  CloudCog,
  ChevronRight,
  Play,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digitory - Restaurant Management Software India | POS, Inventory & ERP Platform',
  description:
    'India\'s most comprehensive restaurant technology platform. POS, inventory management, recipe management, QR ordering, KDS, CRM & analytics for chains, pubs, QSRs and cloud kitchens. Trusted by 500+ restaurants.',
}

const stats = [
  { value: '500+', label: 'Restaurants Powered' },
  { value: '50+', label: 'Cities Across India' },
  { value: '2M+', label: 'Orders Processed Monthly' },
  { value: '99.9%', label: 'Platform Uptime' },
]

const modules = [
  {
    icon: MonitorSmartphone,
    name: 'Point of Sale',
    desc: 'Lightning-fast billing with multi-format support. Handle dine-in, takeaway, delivery, and bar orders from a single interface.',
    href: '/products/point-of-sale',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Package,
    name: 'Inventory Management',
    desc: 'Real-time stock tracking across all outlets. Automated purchase orders, vendor management, and wastage control.',
    href: '/products/inventory-management',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: ChefHat,
    name: 'Recipe Management',
    desc: 'Standardize recipes across your chain. Track ingredient costs, manage portion sizes, and maintain consistency.',
    href: '/products/recipe-management',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: QrCode,
    name: 'QR Code Ordering',
    desc: 'Let guests order directly from their phones. Reduce wait times, increase table turns, and boost average order value.',
    href: '/products/qr-ordering',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: LayoutDashboard,
    name: 'Kitchen Display System',
    desc: 'Paperless kitchen operations with real-time order routing, preparation tracking, and multi-station coordination.',
    href: '/products/kitchen-display-system',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Users,
    name: 'CRM & Loyalty',
    desc: 'Build customer profiles, run targeted campaigns, and create loyalty programs that drive repeat visits.',
    href: '/products/crm-loyalty',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: CreditCard,
    name: 'Prepaid Cards',
    desc: 'Issue branded prepaid cards for corporate accounts, gifting, and loyalty rewards. Drive upfront revenue.',
    href: '/products/prepaid-cards',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Wrench,
    name: 'DigiBeat - Asset Management',
    desc: 'Track equipment lifecycle, schedule preventive maintenance, and manage service requests across all outlets.',
    href: '/products/digibeat',
    color: 'bg-slate-50 text-slate-600',
  },
  {
    icon: BarChart3,
    name: 'Executive Analytics',
    desc: 'Real-time dashboards with sales trends, outlet comparisons, product mix analysis, and actionable insights.',
    href: '/products/analytics',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Calculator,
    name: 'Tally Automation',
    desc: 'Automatic sync of daily sales, purchases, and expenses to Tally. Eliminate manual data entry errors.',
    href: '/products/tally-automation',
    color: 'bg-teal-50 text-teal-600',
  },
]

const industries = [
  {
    icon: Store,
    name: 'Restaurant Chains',
    desc: 'Centralized control over menus, pricing, inventory, and analytics across all your outlets.',
    href: '/industries/restaurant-chains',
    stats: '200+ chain outlets managed',
  },
  {
    icon: Beer,
    name: 'Pubs & Breweries',
    desc: 'Built for high-volume beverage operations with tab management, happy hour automation, and liquor inventory.',
    href: '/industries/pubs-breweries',
    stats: '50+ pubs & breweries',
  },
  {
    icon: Utensils,
    name: 'QSR & Fast Casual',
    desc: 'Speed-optimized ordering, kitchen display integration, and drive-through management for fast service.',
    href: '/industries/qsr',
    stats: '100+ QSR locations',
  },
  {
    icon: CloudCog,
    name: 'Cloud Kitchens',
    desc: 'Multi-brand management, aggregator integration, and central kitchen operations from one platform.',
    href: '/industries/cloud-kitchens',
    stats: '75+ cloud kitchen brands',
  },
]

const testimonials = [
  {
    quote: 'Digitory transformed how we manage our 12-outlet chain. Real-time inventory visibility alone saved us 15% on food costs.',
    name: 'Rajesh Kumar',
    role: 'COO, Spice Route Restaurants',
    outlets: '12 outlets',
  },
  {
    quote: 'The QR ordering system increased our average table turn rate by 25%. Guests love the convenience, and our staff can focus on service.',
    name: 'Priya Sharma',
    role: 'Founder, The Brewing Company',
    outlets: '5 outlets',
  },
  {
    quote: 'Moving from spreadsheets to Digitory\'s recipe management was a game-changer. Consistency across all our cloud kitchen brands finally became achievable.',
    name: 'Arjun Mehta',
    role: 'Director, CloudBite Kitchens',
    outlets: '8 brands',
  },
]

const faqs = [
  {
    q: 'What is Digitory and how does it help restaurants?',
    a: 'Digitory is India\'s most comprehensive restaurant technology platform. It combines POS, inventory management, recipe management, QR ordering, kitchen display systems, CRM, analytics, and more into a single integrated platform. Digitory helps restaurant chains, pubs, QSRs, and cloud kitchens streamline operations, reduce costs, and grow revenue.',
  },
  {
    q: 'How much does restaurant management software cost in India?',
    a: 'Digitory offers flexible pricing starting from ₹2,999/month per outlet for the Lite plan. Standard plans start at ₹6,999/month and Premium plans with full ERP capabilities start at ₹14,999/month. All plans include implementation support, training, and regular updates.',
  },
  {
    q: 'Can Digitory manage multiple restaurant outlets from one dashboard?',
    a: 'Yes, Digitory is purpose-built for multi-outlet restaurant chains. You can manage menus, pricing, inventory, staff, and analytics for all your outlets from a single centralized dashboard. Real-time data sync ensures you always have an up-to-date view of operations across locations.',
  },
  {
    q: 'Does Digitory integrate with food delivery aggregators like Swiggy and Zomato?',
    a: 'Yes, Digitory integrates seamlessly with Swiggy, Zomato, and other major food delivery aggregators. Orders flow directly into your POS and KDS, eliminating the need for manual order entry and reducing errors.',
  },
  {
    q: 'Is Digitory suitable for pubs and breweries?',
    a: 'Absolutely. Digitory has specialized features for pubs and breweries including tab management, happy hour pricing automation, draught beer tracking, liquor inventory management, and age verification workflows. Over 50 pubs and breweries across India use Digitory.',
  },
  {
    q: 'How does Digitory help reduce food costs?',
    a: 'Digitory reduces food costs through precise recipe management, real-time inventory tracking, automated purchase ordering, wastage monitoring, and variance analysis. On average, restaurants using Digitory report 10-18% reduction in food costs within the first 6 months.',
  },
  {
    q: 'What is QR code ordering and how does it work?',
    a: 'QR code ordering allows your dine-in guests to scan a QR code at their table, browse your digital menu, place orders, and pay — all from their smartphone. Orders go directly to your KDS. This reduces wait times, increases order accuracy, and can boost average order value by 15-20% through suggestive selling.',
  },
  {
    q: 'Does Digitory work offline?',
    a: 'Yes, Digitory\'s POS module works offline and automatically syncs data when connectivity is restored. This ensures your billing and kitchen operations never stop, even during internet outages.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-6">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Trusted by 500+ restaurants across India</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 text-balance">
              The Operating System for{' '}
              <span className="gradient-text">Modern Restaurants</span>
            </h1>

            <p className="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto text-balance">
              One unified platform for POS, inventory, recipes, QR ordering, kitchen display, CRM, and analytics.
              Built for chains, pubs, QSRs, and cloud kitchens that demand scale.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center px-8 py-4 text-base font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/25 w-full sm:w-auto justify-center"
              >
                Book a Free Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Platform Tour
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              No credit card required &middot; 14-day free trial &middot; Setup in under 48 hours
            </p>
          </div>

          {/* Platform Mockup */}
          <div className="mt-16 lg:mt-20 relative">
            <div className="bg-gray-900 rounded-2xl lg:rounded-3xl p-2 shadow-2xl shadow-gray-900/20 max-w-5xl mx-auto">
              <div className="bg-gray-800 rounded-xl lg:rounded-2xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-700 rounded-md px-3 py-1.5 text-xs text-gray-400 max-w-sm mx-auto">
                      app.digitory.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard Mockup */}
                <div className="p-6 lg:p-8 bg-gray-50 min-h-[300px] lg:min-h-[420px]">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Today\'s Revenue', value: '₹4,82,350', change: '+12.5%', color: 'text-emerald-600' },
                      { label: 'Orders', value: '847', change: '+8.2%', color: 'text-emerald-600' },
                      { label: 'Avg Order Value', value: '₹569', change: '+3.1%', color: 'text-emerald-600' },
                      { label: 'Active Outlets', value: '12/12', change: '100%', color: 'text-blue-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-xs text-gray-500">{stat.label}</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{stat.value}</div>
                        <div className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.change}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-h-[200px]">
                      <div className="text-sm font-semibold text-gray-900 mb-4">Revenue by Outlet</div>
                      <div className="space-y-3">
                        {['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'JP Nagar'].map((outlet, i) => (
                          <div key={outlet} className="flex items-center gap-3">
                            <div className="text-xs text-gray-500 w-24">{outlet}</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                              <div
                                className="bg-primary-500 h-2.5 rounded-full"
                                style={{ width: `${90 - i * 12}%` }}
                              />
                            </div>
                            <div className="text-xs font-medium text-gray-700 w-16 text-right">
                              ₹{(48 - i * 7).toFixed(0)}K
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="text-sm font-semibold text-gray-900 mb-4">Order Mix</div>
                      <div className="space-y-2">
                        {[
                          { label: 'Dine-in', pct: '45%', color: 'bg-primary-500' },
                          { label: 'Delivery', pct: '30%', color: 'bg-emerald-500' },
                          { label: 'Takeaway', pct: '15%', color: 'bg-amber-500' },
                          { label: 'QR Order', pct: '10%', color: 'bg-violet-500' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                            <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                            <span className="text-xs font-medium text-gray-900">{item.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 lg:py-16 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Digitory */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Why India&apos;s top restaurant brands choose Digitory
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Purpose-built for the complexity of multi-outlet food service operations. Not a generic POS with bolt-ons.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: 'Built for Chains',
                desc: 'Centralized menu, pricing, and operations management. Every outlet stays aligned with headquarters.',
              },
              {
                icon: Zap,
                title: 'Lightning Fast POS',
                desc: 'Sub-second billing with offline capability. Your operations never stop, even during internet outages.',
              },
              {
                icon: TrendingUp,
                title: 'Reduce Food Costs by 10-18%',
                desc: 'Precise recipe costing, real-time inventory tracking, and wastage monitoring that directly impacts your bottom line.',
              },
              {
                icon: Shield,
                title: 'Enterprise-Grade Security',
                desc: 'Role-based access, audit trails, data encryption, and PCI-compliant payment processing across all outlets.',
              },
              {
                icon: Clock,
                title: '48-Hour Deployment',
                desc: 'Go live in under 48 hours with dedicated onboarding support, data migration, and staff training included.',
              },
              {
                icon: Star,
                title: 'India-First Design',
                desc: 'GST-compliant billing, FSSAI integration, UPI/Paytm payments, and built for Indian restaurant workflows.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Modules */}
      <section className="py-20 lg:py-28 bg-gray-50" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              10 powerful modules. One unified platform.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Every module works together seamlessly. No more juggling disconnected tools or losing data between systems.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {modules.map((mod) => (
              <Link
                key={mod.name}
                href={mod.href}
                className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${mod.color} flex items-center justify-center mb-3`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {mod.name}
                </h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
                <div className="mt-3 flex items-center text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-3 h-3 ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Tailored for every restaurant format
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Whether you run a fine-dining chain, a craft brewery, a QSR franchise, or a multi-brand cloud kitchen — Digitory adapts to your operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {industries.map((ind) => (
              <Link
                key={ind.name}
                href={ind.href}
                className="flex items-start gap-5 p-6 lg:p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                  <ind.icon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {ind.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-600">{ind.desc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                      {ind.stats}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Trusted by restaurant leaders across India
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hear from operators who transformed their businesses with Digitory.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm text-gray-700 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.role}</div>
                  <div className="text-xs text-primary-600 font-medium mt-1">{t.outlets}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Connects with the tools you already use
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Seamless integrations with payment gateways, delivery aggregators, accounting software, and more.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {['Swiggy', 'Zomato', 'Tally', 'Razorpay', 'Paytm', 'Pine Labs', 'Petpooja', 'Google Pay'].map((partner) => (
              <div
                key={partner}
                className="px-6 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-500"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Teaser */}
      <section className="py-20 lg:py-28 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Still comparing restaurant management software?
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Most restaurant software in India forces you to compromise — either it&apos;s a basic POS with limited
                features, or it&apos;s enterprise software that takes months to deploy. Digitory gives you both: enterprise
                power with startup speed.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  '10 integrated modules vs. cobbled-together point solutions',
                  'Go live in 48 hours, not 6 months',
                  'India-first: GST, FSSAI, UPI built-in from day one',
                  'Transparent pricing — no hidden fees or per-transaction charges',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/compare"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  See Full Comparison <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-800">
              <div className="text-sm font-semibold text-gray-400 mb-6">Digitory vs. Typical Solutions</div>
              <div className="space-y-4">
                {[
                  { feature: 'Integrated Modules', digitory: '10', others: '2-4' },
                  { feature: 'Multi-Outlet Support', digitory: 'Native', others: 'Add-on' },
                  { feature: 'Recipe Costing', digitory: 'Built-in', others: 'Manual' },
                  { feature: 'QR Ordering', digitory: 'Included', others: '₹2K-5K/mo extra' },
                  { feature: 'Tally Integration', digitory: 'Automated', others: 'Manual export' },
                  { feature: 'Deployment Time', digitory: '48 hours', others: '2-8 weeks' },
                  { feature: 'Offline Billing', digitory: 'Yes', others: 'Limited' },
                ].map((row) => (
                  <div key={row.feature} className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-800 last:border-0">
                    <div className="text-gray-400">{row.feature}</div>
                    <div className="text-emerald-400 font-medium">{row.digitory}</div>
                    <div className="text-gray-500">{row.others}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (AEO Optimized) */}
      <section className="py-20 lg:py-28 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about Digitory&apos;s restaurant management platform.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors"
              >
                <h3 className="text-base font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.a,
                },
              })),
            }),
          }}
        />
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-500 via-primary-700 to-accent-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Start running your restaurants smarter today
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join 500+ restaurants that trust Digitory to power their operations. Get a personalized demo and see how Digitory can transform your business.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto justify-center"
            >
              Book a Free Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-white border border-primary-400 rounded-xl hover:bg-primary-600 transition-colors w-full sm:w-auto justify-center"
            >
              Contact Sales
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-200">
            Free 14-day trial &middot; No setup fees &middot; Cancel anytime
          </p>
        </div>
      </section>
    </>
  )
}
