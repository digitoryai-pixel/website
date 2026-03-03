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
} from 'lucide-react'

const footerLinks = {
  products: [
    { name: 'Point of Sale', href: '/products/point-of-sale' },
    { name: 'Inventory Management', href: '/products/inventory-management' },
    { name: 'Recipe Management', href: '/products/recipe-management' },
    { name: 'QR Code Ordering', href: '/products/qr-ordering' },
    { name: 'Kitchen Display System', href: '/products/kitchen-display-system' },
    { name: 'CRM & Loyalty', href: '/products/crm-loyalty' },
    { name: 'Prepaid Cards', href: '/products/prepaid-cards' },
    { name: 'DigiBeat', href: '/products/digibeat' },
    { name: 'Executive Analytics', href: '/products/analytics' },
    { name: 'Tally Automation', href: '/products/tally-automation' },
  ],
  industries: [
    { name: 'Restaurant Chains', href: '/industries/restaurant-chains' },
    { name: 'Pubs & Breweries', href: '/industries/pubs-breweries' },
    { name: 'QSR & Fast Casual', href: '/industries/qsr' },
    { name: 'Cloud Kitchens', href: '/industries/cloud-kitchens' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Why Digitory', href: '/compare' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact Sales', href: '/contact' },
    { name: 'Book a Demo', href: '/demo' },
    { name: 'Blog', href: '/blog' },
  ],
  resources: [
    { name: 'Help Center', href: '/help' },
    { name: 'API Documentation', href: '/docs' },
    { name: 'Partner Program', href: '/partners' },
    { name: 'System Status', href: '/status' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* CTA Band */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Ready to transform your restaurant operations?
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Join 500+ restaurants across India that run on Digitory. Book a personalized demo and see the platform in action.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center px-8 py-4 text-base font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Book a Free Demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 text-base font-semibold text-white border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Industries</h3>
            <ul className="space-y-3">
              {industryLinks()}
            </ul>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <span className="block text-white font-medium">Email</span>
                hello@digitory.com
              </li>
              <li>
                <span className="block text-white font-medium">Phone</span>
                +91 80-4567-8900
              </li>
              <li>
                <span className="block text-white font-medium">Address</span>
                Bangalore, India
              </li>
            </ul>
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Certifications</h3>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium">
                  GST
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium">
                  FSSAI
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-medium">
                  PCI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="11" fill="#ff5a10"/>
              <rect x="12.5" width="11" height="11" fill="#ff5a10"/>
              <rect x="25" width="11" height="11" fill="#ff5a10"/>
              <rect y="12.5" width="11" height="11" fill="#ff5a10"/>
              <rect x="25" y="12.5" width="11" height="11" fill="#ff5a10"/>
              <rect y="25" width="11" height="11" fill="#ff5a10"/>
              <rect x="12.5" y="25" width="11" height="11" fill="#ff5a10"/>
              <rect x="25" y="25" width="11" height="11" fill="#ff5a10"/>
            </svg>
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Digitory Technologies Pvt. Ltd. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/security" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function industryLinks() {
  return footerLinks.industries.map((link) => (
    <li key={link.name}>
      <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
        {link.name}
      </Link>
    </li>
  ))
}
