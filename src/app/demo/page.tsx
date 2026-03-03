'use client'

import { useState } from 'react'
import { CheckCircle2, ArrowRight, Shield, Clock, Users } from 'lucide-react'

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column - Value Prop */}
            <div className="lg:pt-8">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
                See Digitory in action
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Book a personalized demo with our product team. We&apos;ll walk you through the platform using scenarios relevant to your restaurant format.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: Clock, title: '30-minute personalized walkthrough', desc: 'Focused on your specific restaurant format and operational challenges.' },
                  { icon: Users, title: 'Live Q&A with product experts', desc: 'Ask anything about features, implementation, pricing, or technical requirements.' },
                  { icon: Shield, title: 'Custom ROI analysis', desc: 'We\'ll show you projected cost savings and revenue impact for your specific operations.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-sm font-semibold text-gray-900 mb-3">Trusted by restaurants like</div>
                <div className="flex flex-wrap gap-3">
                  {['Spice Route (12 outlets)', 'The Brewing Co (5 outlets)', 'CloudBite (8 brands)', 'Curry House (22 outlets)'].map((name) => (
                    <span key={name} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded-full border border-gray-200">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg shadow-gray-100/50">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
                  <p className="mt-2 text-gray-600">Our team will reach out within 2 hours to schedule your personalized demo.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Book your free demo</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setSubmitted(true)
                    }}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Rajesh"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Kumar"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="rajesh@restaurant.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">Restaurant / Brand Name *</label>
                      <input
                        type="text"
                        id="restaurant"
                        name="restaurant"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Your Restaurant Name"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="outlets" className="block text-sm font-medium text-gray-700 mb-1">Number of Outlets *</label>
                        <select
                          id="outlets"
                          name="outlets"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select</option>
                          <option value="1">1 outlet</option>
                          <option value="2-5">2-5 outlets</option>
                          <option value="6-10">6-10 outlets</option>
                          <option value="11-25">11-25 outlets</option>
                          <option value="26-50">26-50 outlets</option>
                          <option value="50+">50+ outlets</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">Restaurant Format *</label>
                        <select
                          id="format"
                          name="format"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select</option>
                          <option value="casual-dining">Casual Dining</option>
                          <option value="fine-dining">Fine Dining</option>
                          <option value="qsr">QSR / Fast Casual</option>
                          <option value="pub-brewery">Pub / Brewery</option>
                          <option value="cloud-kitchen">Cloud Kitchen</option>
                          <option value="cafe">Cafe / Bakery</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Anything specific you&apos;d like to see?</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Tell us about your current challenges..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20"
                    >
                      Book My Free Demo <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      By submitting, you agree to our privacy policy. We&apos;ll never share your information.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
