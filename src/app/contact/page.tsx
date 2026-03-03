'use client'

import { useState } from 'react'
import { CheckCircle2, Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left - Contact Info */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
                Let&apos;s talk about your restaurant
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Whether you&apos;re exploring options, ready to switch, or have a specific question — our team is here to help.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Email</h3>
                    <p className="text-sm text-gray-600">hello@digitory.com</p>
                    <p className="text-sm text-gray-600">sales@digitory.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Phone</h3>
                    <p className="text-sm text-gray-600">+91 80-4567-8900</p>
                    <p className="text-sm text-gray-600">+91 98765-43210 (WhatsApp)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Office</h3>
                    <p className="text-sm text-gray-600">
                      Digitory Technologies Pvt. Ltd.<br />
                      Bangalore, Karnataka, India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Support Hours</h3>
                    <p className="text-sm text-gray-600">Mon - Sat: 9:00 AM - 9:00 PM IST</p>
                    <p className="text-sm text-gray-600">Sunday: 10:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Regional Offices</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <span>Mumbai</span>
                  <span>Delhi NCR</span>
                  <span>Hyderabad</span>
                  <span>Chennai</span>
                  <span>Kolkata</span>
                  <span>Pune</span>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg shadow-gray-100/50">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Message sent!</h2>
                  <p className="mt-2 text-gray-600">Our team will get back to you within 4 hours during business hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setSubmitted(true)
                    }}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" id="name" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" id="email" name="email" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" id="phone" name="phone" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select id="subject" name="subject" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white">
                        <option value="">Select a topic</option>
                        <option value="sales">Sales Inquiry</option>
                        <option value="demo">Book a Demo</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="careers">Careers</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20"
                    >
                      Send Message
                    </button>
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
