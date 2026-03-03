import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  title: string
  description: string
}

interface Benefit {
  stat: string
  label: string
}

interface FAQ {
  q: string
  a: string
}

interface ProductPageProps {
  icon: LucideIcon
  iconColor: string
  title: string
  headline: string
  subheadline: string
  features: Feature[]
  benefits: Benefit[]
  useCases: string[]
  faqs: FAQ[]
  relatedProducts: { name: string; href: string; icon: LucideIcon }[]
}

export default function ProductPageLayout({
  icon: Icon,
  iconColor,
  title,
  headline,
  subheadline,
  features,
  benefits,
  useCases,
  faqs,
  relatedProducts,
}: ProductPageProps) {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${iconColor.replace('text-', 'bg-').replace('600', '50')} border ${iconColor.replace('text-', 'border-').replace('600', '100')} mb-6`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <span className={`text-sm font-medium ${iconColor.replace('600', '700')}`}>{title}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 text-balance">
              {headline}
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl">
              {subheadline}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center px-7 py-3.5 text-base font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20"
              >
                Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-7 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 lg:py-20 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b) => (
              <div key={b.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold text-gray-900">{b.stat}</div>
                <div className="mt-1 text-sm text-gray-500">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Purpose-built features that solve real operational challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-md transition-all"
              >
                <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                Built for real-world restaurant operations
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Whether you have 2 outlets or 200, Digitory scales with your business.
              </p>
              <div className="mt-8 space-y-4">
                {useCases.map((uc) => (
                  <div key={uc} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{uc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="bg-gray-50 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Icon className={`w-16 h-16 ${iconColor} mx-auto mb-4 opacity-30`} />
                  <div className="text-sm text-gray-400">Product Screenshot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                <h3 className="text-base font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.q,
                  acceptedAnswer: { '@type': 'Answer', text: faq.a },
                })),
              }),
            }}
          />
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Works seamlessly with</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.name}
                href={rp.href}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group"
              >
                <rp.icon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">{rp.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to see {title} in action?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Book a personalized demo and discover how Digitory can streamline your operations.
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
