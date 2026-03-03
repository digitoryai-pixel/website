'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  ChevronDown,
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
  Store,
  Beer,
  Utensils,
  CloudCog,
} from 'lucide-react'

const productLinks = [
  { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone, desc: 'Fast, reliable billing for every format' },
  { name: 'Inventory Management', href: '/products/inventory-management', icon: Package, desc: 'Real-time stock control across outlets' },
  { name: 'Recipe Management', href: '/products/recipe-management', icon: ChefHat, desc: 'Standardize recipes, control costs' },
  { name: 'QR Code Ordering', href: '/products/qr-ordering', icon: QrCode, desc: 'Contactless dine-in ordering' },
  { name: 'Kitchen Display System', href: '/products/kitchen-display-system', icon: LayoutDashboard, desc: 'Streamline kitchen operations' },
  { name: 'CRM & Loyalty', href: '/products/crm-loyalty', icon: Users, desc: 'Build lasting customer relationships' },
  { name: 'Prepaid Cards', href: '/products/prepaid-cards', icon: CreditCard, desc: 'Drive repeat visits with stored value' },
  { name: 'DigiBeat - Asset Management', href: '/products/digibeat', icon: Wrench, desc: 'Track equipment & maintenance' },
  { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3, desc: 'Data-driven decisions in real time' },
  { name: 'Tally Automation', href: '/products/tally-automation', icon: Calculator, desc: 'Seamless accounting integration' },
]

const industryLinks = [
  { name: 'Restaurant Chains', href: '/industries/restaurant-chains', icon: Store, desc: 'Multi-outlet chain management' },
  { name: 'Pubs & Breweries', href: '/industries/pubs-breweries', icon: Beer, desc: 'Built for high-volume beverage ops' },
  { name: 'QSR & Fast Casual', href: '/industries/qsr', icon: Utensils, desc: 'Speed and consistency at scale' },
  { name: 'Cloud Kitchens', href: '/industries/cloud-kitchens', icon: CloudCog, desc: 'Multi-brand delivery management' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="11" fill="#ff5a10"/>
              <rect x="12.5" width="11" height="11" fill="#ff5a10"/>
              <rect x="25" width="11" height="11" fill="#ff5a10"/>
              <rect y="12.5" width="11" height="11" fill="#ff5a10"/>
              <rect x="25" y="12.5" width="11" height="11" fill="#ff5a10"/>
              <rect y="25" width="11" height="11" fill="#ff5a10"/>
              <rect x="12.5" y="25" width="11" height="11" fill="#ff5a10"/>
              <rect x="25" y="25" width="11" height="11" fill="#ff5a10"/>
            </svg>
            <span className="text-xl font-semibold text-gray-900">digitory</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
                Products <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[640px]">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-1">
                      {productLinks.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                            <item.icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link href="/products" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        View all products &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Industries Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('industries')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
                Industries <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'industries' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[400px]">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-1 gap-1">
                      {industryLinks.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                            <item.icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Pricing
            </Link>
            <Link href="/compare" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Why Digitory
            </Link>
            <Link href="/about" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              About
            </Link>
            <Link href="/blog" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Resources
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Contact Sales
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white gradient-bg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-600/20"
            >
              Book a Demo
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-6 border-t border-gray-100 mt-2 pt-4">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</div>
              {productLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-primary-600" />
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Industries</div>
              {industryLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-primary-600" />
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-4" />
              <Link href="/pricing" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>
              <Link href="/compare" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Why Digitory
              </Link>
              <Link href="/about" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                About
              </Link>
              <Link href="/blog" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Resources
              </Link>
              <div className="border-t border-gray-100 my-4" />
              <Link href="/contact" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                Contact Sales
              </Link>
              <Link
                href="/demo"
                className="block mx-3 mt-2 px-5 py-3 text-sm font-semibold text-white text-center gradient-bg rounded-xl"
                onClick={() => setMobileOpen(false)}
              >
                Book a Demo
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
