import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Challenge {
  title: string
  description: string
}

interface Solution {
  module: string
  description: string
  icon: LucideIcon
  href: string
}

interface FAQ {
  q: string
  a: string
}

interface IndustryPageProps {
  icon: LucideIcon
  iconColor: string
  industry: string
  headline: string
  subheadline: string
  stats: { value: string; label: string }[]
  challenges: Challenge[]
  solutions: Solution[]
  outcomes: string[]
  faqs: FAQ[]
}

export default function IndustryPageLayout({
  icon: Icon,
  iconColor,
  industry,
  headline,
  subheadline,
  stats,
  challenges,
  solutions,
  outcomes,
  faqs,
}: IndustryPageProps) {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-6`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <span className="text-sm font-medium text-primary-700">{industry}</span>
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
                href="/products"
                className="inline-flex items-center px-7 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Explore Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold text-gray-900">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Challenges we solve for {industry.toLowerCase()}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We understand the unique operational complexities of your format.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((c) => (
              <div key={c.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                <h3 className="text-base font-semibold text-gray-900">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              How Digitory powers your operations
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((s) => (
              <Link
                key={s.module}
                href={s.href}
                className="flex items-start gap-5 p-6 lg:p-8 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                  <s.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {s.module}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{s.description}</p>
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-primary-600">
                    Learn more <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20 lg:py-28 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Measurable outcomes from day one
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Digitory isn&apos;t just software — it&apos;s an operational transformation that pays for itself.
              </p>
            </div>
            <div className="space-y-4">
              {outcomes.map((o) => (
                <div key={o} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">{o}</span>
                </div>
              ))}
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

      {/* CTA */}
      <section className="py-20 lg:py-28 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to transform your {industry.toLowerCase()} operations?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Book a personalized demo and see how Digitory is purpose-built for your format.
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
