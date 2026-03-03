import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Minus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing - Restaurant Management Software Plans',
  description:
    'Transparent pricing for Digitory restaurant management platform. Plans starting at ₹2,999/month. No hidden fees. No per-transaction charges. Free 14-day trial.',
  keywords: ['restaurant software pricing India', 'restaurant POS pricing', 'restaurant management software cost', 'restaurant ERP pricing'],
}

const plans = [
  {
    name: 'Lite',
    price: '2,999',
    period: '/month per outlet',
    description: 'Essential tools for single-outlet restaurants getting started with technology.',
    features: [
      { name: 'Point of Sale', included: true },
      { name: 'Basic Inventory', included: true },
      { name: 'GST-Compliant Billing', included: true },
      { name: 'Payment Integration', included: true },
      { name: 'Table Management', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'Recipe Management', included: false },
      { name: 'QR Code Ordering', included: false },
      { name: 'Kitchen Display System', included: false },
      { name: 'CRM & Loyalty', included: false },
      { name: 'Multi-Outlet Management', included: false },
      { name: 'Executive Analytics', included: false },
      { name: 'Tally Automation', included: false },
      { name: 'DigiBeat', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Standard',
    price: '6,999',
    period: '/month per outlet',
    description: 'Complete restaurant management for growing multi-outlet operations.',
    features: [
      { name: 'Everything in Lite', included: true },
      { name: 'Recipe Management', included: true },
      { name: 'QR Code Ordering', included: true },
      { name: 'Kitchen Display System', included: true },
      { name: 'CRM & Loyalty', included: true },
      { name: 'Multi-Outlet Management', included: true },
      { name: 'Advanced Inventory', included: true },
      { name: 'Vendor Management', included: true },
      { name: 'Aggregator Integration', included: true },
      { name: 'Custom Reports', included: true },
      { name: 'Executive Analytics', included: false },
      { name: 'Tally Automation', included: false },
      { name: 'DigiBeat', included: false },
      { name: 'Dedicated Account Manager', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Premium',
    price: '14,999',
    period: '/month per outlet',
    description: 'Full enterprise ERP for large chains, franchises, and central kitchen operations.',
    features: [
      { name: 'Everything in Standard', included: true },
      { name: 'Executive Analytics', included: true },
      { name: 'Tally Automation', included: true },
      { name: 'DigiBeat Asset Management', included: true },
      { name: 'Prepaid Cards', included: true },
      { name: 'Central Kitchen Module', included: true },
      { name: 'Franchise Management', included: true },
      { name: 'API Access', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Priority Support (4hr SLA)', included: true },
      { name: 'Onsite Training', included: true },
      { name: 'Data Migration Support', included: true },
      { name: 'Custom Development', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees. No per-transaction charges. No surprises. Choose the plan that fits your operations and scale as you grow.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            All plans include free 14-day trial &middot; No credit card required &middot; Cancel anytime
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? 'border-primary-600 shadow-xl shadow-primary-100'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-white gradient-bg shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 min-h-[40px]">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                  <Link
                    href={plan.name === 'Premium' ? '/contact' : '/demo'}
                    className={`mt-6 block w-full text-center py-3 px-6 rounded-xl text-sm font-semibold transition-colors ${
                      plan.popular
                        ? 'text-white gradient-bg hover:opacity-90 shadow-lg shadow-primary-600/20'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f.name} className="flex items-center gap-3">
                        {f.included ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-300 shrink-0" />
                        )}
                        <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {f.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volume Discounts */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
            Volume discounts for larger chains
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Operating 10+ outlets? We offer custom pricing with volume discounts, dedicated support, and tailored implementation plans.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              { outlets: '5-10 outlets', discount: '10% off' },
              { outlets: '11-25 outlets', discount: '15% off' },
              { outlets: '25+ outlets', discount: 'Custom pricing' },
            ].map((tier) => (
              <div key={tier.outlets} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-sm text-gray-500">{tier.outlets}</div>
                <div className="mt-2 text-xl font-bold text-primary-600">{tier.discount}</div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20"
            >
              Talk to Sales for Custom Pricing <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Every plan includes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Free Implementation', desc: 'We handle setup, configuration, and data migration at no extra cost.' },
              { title: 'Staff Training', desc: 'Comprehensive training for your team — online or onsite for Premium plans.' },
              { title: 'Regular Updates', desc: 'New features and improvements deployed automatically. No upgrade fees.' },
              { title: 'Phone & Chat Support', desc: 'Reach our support team via phone, chat, or email. Premium gets 4hr SLA.' },
              { title: 'Data Security', desc: 'Enterprise-grade encryption, automated backups, and role-based access.' },
              { title: 'No Lock-In', desc: 'Month-to-month billing. Export your data anytime. Cancel with 30 days notice.' },
              { title: 'Uptime Guarantee', desc: '99.9% uptime SLA with automated monitoring and incident response.' },
              { title: 'GST Compliance', desc: 'Always updated for the latest GST rules and regulatory requirements.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Pricing FAQs
          </h2>
          <div className="space-y-6">
            {[
              { q: 'Are there any hidden fees or per-transaction charges?', a: 'No. Digitory pricing is fully transparent. You pay the monthly subscription per outlet — that\'s it. No setup fees, no per-transaction charges, no hidden costs for updates or support.' },
              { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle. If you upgrade mid-cycle, we prorate the difference.' },
              { q: 'Is there a free trial?', a: 'Yes, all plans come with a free 14-day trial. No credit card required. You get full access to all features in your chosen plan during the trial period.' },
              { q: 'What happens to my data if I cancel?', a: 'Your data remains available for 90 days after cancellation. You can export all your data in standard formats at any time. We never hold your data hostage.' },
              { q: 'Do you offer annual billing discounts?', a: 'Yes, annual billing comes with a 15% discount compared to monthly billing. Contact our sales team for annual billing options.' },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-2xl p-6 bg-white">
                <h3 className="text-base font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
