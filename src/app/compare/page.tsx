import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, XCircle, ArrowRight, Shield, Zap, Building2, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why Digitory - Compare Restaurant Management Software India',
  description:
    'See how Digitory compares to other restaurant management software in India. 10 integrated modules, 48-hour deployment, India-first design. No hidden fees.',
  keywords: ['best restaurant software India', 'restaurant POS comparison India', 'Digitory vs Petpooja', 'restaurant management software comparison', 'best restaurant ERP India'],
}

const comparisonData = [
  { feature: 'Integrated Modules', digitory: '10 modules', typical: '2-4 modules', enterprise: '6-8 modules' },
  { feature: 'Multi-Outlet Support', digitory: 'Native (unlimited)', typical: 'Add-on (extra cost)', enterprise: 'Native (limited)' },
  { feature: 'Recipe Management', digitory: 'Built-in with costing', typical: 'Not available', enterprise: 'Basic' },
  { feature: 'QR Code Ordering', digitory: 'Included', typical: '₹2-5K/mo extra', enterprise: 'Included' },
  { feature: 'Kitchen Display System', digitory: 'Included', typical: '₹1-3K/mo extra', enterprise: 'Included' },
  { feature: 'CRM & Loyalty', digitory: 'Full-featured', typical: 'Basic', enterprise: 'Full-featured' },
  { feature: 'Tally Integration', digitory: 'Automated sync', typical: 'Manual CSV export', enterprise: 'Semi-automated' },
  { feature: 'Asset Management', digitory: 'DigiBeat included', typical: 'Not available', enterprise: 'Third-party' },
  { feature: 'Prepaid Cards', digitory: 'Built-in', typical: 'Not available', enterprise: 'Third-party' },
  { feature: 'Aggregator Integration', digitory: 'Swiggy + Zomato', typical: 'Limited', enterprise: 'Swiggy + Zomato' },
  { feature: 'Offline Billing', digitory: 'Full capability', typical: 'Limited', enterprise: 'Partial' },
  { feature: 'Deployment Time', digitory: '48 hours', typical: '1-2 weeks', enterprise: '4-12 weeks' },
  { feature: 'GST Compliance', digitory: 'Built-in', typical: 'Built-in', enterprise: 'Built-in' },
  { feature: 'Pricing Model', digitory: 'Flat monthly', typical: 'Per-transaction', enterprise: 'Annual contract' },
  { feature: 'Implementation Fee', digitory: 'Free', typical: '₹5-15K', enterprise: '₹50K-5L' },
  { feature: 'Contract Lock-in', digitory: 'None', typical: '6-12 months', enterprise: '12-36 months' },
]

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900">
            Enterprise power. <span className="gradient-text">Startup speed.</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Most restaurant software forces you to choose between comprehensive features and fast deployment. Digitory gives you both.
          </p>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: '10 Integrated Modules', desc: 'No bolt-ons, no third-party integrations to manage. Everything works together natively.' },
              { icon: Clock, title: '48-Hour Go-Live', desc: 'Full deployment including data migration, training, and go-live support in under 48 hours.' },
              { icon: Shield, title: 'India-First Design', desc: 'GST, FSSAI, UPI, Tally — built for Indian operations from day one. Not retrofitted.' },
              { icon: Zap, title: 'Zero Hidden Fees', desc: 'Flat monthly pricing. No per-transaction charges, no implementation fees, no lock-in contracts.' },
            ].map((d) => (
              <div key={d.title} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <d.icon className="w-8 h-8 text-primary-600 mb-4" />
                <h3 className="text-base font-semibold text-gray-900">{d.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Feature-by-feature comparison
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 lg:p-6 bg-gray-50 border-b border-gray-200 text-sm font-semibold">
              <div className="text-gray-500">Feature</div>
              <div className="text-primary-600">Digitory</div>
              <div className="text-gray-500">Typical POS</div>
              <div className="text-gray-500">Enterprise ERP</div>
            </div>
            {/* Rows */}
            {comparisonData.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 gap-4 p-4 lg:px-6 lg:py-4 text-sm ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } border-b border-gray-100 last:border-0`}
              >
                <div className="text-gray-700 font-medium">{row.feature}</div>
                <div className="text-emerald-600 font-medium">{row.digitory}</div>
                <div className="text-gray-500">{row.typical}</div>
                <div className="text-gray-500">{row.enterprise}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Digitory */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                The only restaurant platform you&apos;ll ever need
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Stop stitching together multiple tools. Stop paying for features you don&apos;t use. Stop waiting months for deployment.
              </p>
              <div className="mt-8 space-y-6">
                {[
                  { title: 'Replace 5-8 tools with one', desc: 'POS, inventory, recipes, QR ordering, KDS, CRM, analytics, and accounting — all integrated. One vendor, one bill, one support team.' },
                  { title: 'No implementation headaches', desc: 'Go live in 48 hours with dedicated onboarding. We handle data migration, configuration, and staff training.' },
                  { title: 'Grow without re-platforming', desc: 'Start with 1 outlet on Lite. Scale to 200 outlets on Premium. The platform grows with you — no migration needed.' },
                  { title: 'India-first, global-ready', desc: 'Built for Indian tax regulations, payment methods, and business workflows. Architecturally ready for international expansion.' },
                ].map((point) => (
                  <div key={point.title}>
                    <h3 className="text-base font-semibold text-gray-900">{point.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{point.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 border border-gray-200">
              <div className="text-sm font-semibold text-gray-900 mb-6">What our customers switched from</div>
              <div className="space-y-4">
                {[
                  { from: 'Basic POS + Excel spreadsheets', to: 'Unified platform with real-time data' },
                  { from: '3-4 disconnected SaaS tools', to: 'One integrated system with zero data silos' },
                  { from: 'Expensive enterprise ERP', to: '60% lower TCO with faster deployment' },
                  { from: 'Manual inventory + paper recipes', to: 'Automated tracking with 15% cost savings' },
                  { from: 'Separate loyalty & CRM platform', to: 'Built-in CRM tied to actual purchase data' },
                ].map((switch_) => (
                  <div key={switch_.from} className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200 last:border-0">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-500">{switch_.from}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 font-medium">{switch_.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            See the difference for yourself
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Book a demo and we&apos;ll show you exactly how Digitory compares to your current setup — with your own data and workflows.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book a Free Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-white border border-primary-400 rounded-xl hover:bg-primary-600 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
