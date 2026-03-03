import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Users, Building2, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Digitory - India\'s Restaurant Technology Platform',
  description:
    'Digitory is India\'s most comprehensive restaurant technology platform. Founded in Bangalore, we power 500+ restaurants across 50+ cities with our integrated ERP platform.',
  keywords: ['about Digitory', 'Digitory restaurant software', 'restaurant technology company India', 'Digitory Bangalore'],
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 text-balance">
              Building the operating system for India&apos;s restaurant industry
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-gray-600">
              We believe every restaurant — whether it&apos;s a 2-outlet chai chain or a 200-outlet QSR franchise — deserves
              enterprise-grade technology. Digitory makes that possible.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-6">
                <Target className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Our Mission</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                Democratize restaurant technology for the Indian food service industry
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                India has over 7.5 million food service establishments. Less than 5% use any form of technology beyond a billing machine.
                We&apos;re here to change that — starting with the operators who are ready to scale.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                We build technology that&apos;s comprehensive enough for a 200-outlet chain, yet simple enough for a first-time restaurateur.
                Every module is designed for Indian workflows, Indian regulations, and Indian business realities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '2019', label: 'Founded', icon: Building2 },
                { value: '500+', label: 'Restaurants powered', icon: Users },
                { value: '50+', label: 'Cities across India', icon: MapPin },
                { value: '80+', label: 'Team members', icon: Users },
              ].map((s) => (
                <div key={s.label} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <s.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">What drives us</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Operator-First Thinking', desc: 'Every feature starts with a real problem faced by a real restaurant operator. We don\'t build features for feature lists — we build solutions for operational pain.' },
              { title: 'Depth Over Breadth', desc: 'We go deep into restaurant operations rather than building a generic SaaS. Recipe management isn\'t a checkbox — it\'s a full module with sub-recipes, yield tracking, and cost analysis.' },
              { title: 'India-First Architecture', desc: 'GST logic, FSSAI compliance, UPI integration, Tally sync, and regional language support aren\'t afterthoughts — they\'re core to our architecture.' },
              { title: 'Speed of Deployment', desc: '48-hour go-live isn\'t a marketing claim — it\'s an engineering achievement. We\'ve optimized every step of implementation for speed.' },
              { title: 'Data as a Product', desc: 'We believe the data generated by restaurants is as valuable as the operations it tracks. Our analytics turn raw transactions into actionable business intelligence.' },
              { title: 'Scale Without Compromise', desc: 'Our architecture handles single-outlet restaurants and 200-outlet chains with the same reliability. Growth should never require re-platforming.' },
            ].map((v) => (
              <div key={v.title} className="p-6 rounded-2xl bg-white border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Headquartered */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
            Headquartered in Bangalore. Serving all of India.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our engineering, product, and customer success teams work from Bangalore, with field support teams in
            Mumbai, Delhi, Hyderabad, Chennai, Kolkata, and Pune.
          </p>
          <div className="mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20"
            >
              Get in Touch <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Join us in transforming India&apos;s restaurant industry
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Whether you&apos;re a restaurant operator looking for better technology, or a talented individual looking to build it — we&apos;d love to hear from you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book a Demo
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-white border border-primary-400 rounded-xl hover:bg-primary-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
