import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { CreditCard, MonitorSmartphone, Users, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant Prepaid Card System - Gift Cards & Stored Value',
  description:
    'Issue branded prepaid cards for corporate accounts, gifting, and loyalty. Drive upfront revenue and repeat visits with Digitory prepaid card management.',
  keywords: ['restaurant prepaid cards', 'restaurant gift cards India', 'stored value cards restaurant', 'corporate dining cards', 'restaurant prepaid wallet'],
}

export default function PrepaidCardsPage() {
  return (
    <ProductPageLayout
      icon={CreditCard}
      iconColor="text-amber-600"
      title="Prepaid Cards"
      headline="Drive upfront revenue with branded prepaid cards"
      subheadline="Issue physical and digital prepaid cards for corporate dining, gifting, and loyalty rewards. Lock in revenue, drive repeat visits, and build brand loyalty."
      benefits={[
        { stat: '30%', label: 'Of prepaid balance goes unredeemed' },
        { stat: '2x', label: 'More frequent visits from cardholders' },
        { stat: '₹15L+', label: 'Avg annual prepaid revenue per chain' },
        { stat: '45%', label: 'Higher spend per visit with prepaid' },
      ]}
      features={[
        { title: 'Physical & Digital Cards', description: 'Issue branded plastic cards or digital wallet-based cards. Guests choose their preference at enrollment.' },
        { title: 'Corporate Dining Programs', description: 'Set up corporate accounts with pre-loaded cards, spending limits, and monthly usage reports for corporate clients.' },
        { title: 'Gift Card Management', description: 'Sell gift cards at the counter, online, or through corporate bulk orders. Track activations, balances, and redemptions.' },
        { title: 'Multi-Outlet Redemption', description: 'Cards work across all outlets in your chain. Customers can load at one location and spend at any other.' },
        { title: 'Top-Up & Auto-Reload', description: 'In-store and online top-up. Auto-reload when balance drops below a set threshold for uninterrupted usage.' },
        { title: 'Expiry & Dormancy Rules', description: 'Set custom expiry periods, dormancy fees, and reactivation policies. All compliant with RBI guidelines.' },
        { title: 'Transaction History', description: 'Complete transaction history for every card. Guests can check balance and history via SMS or web portal.' },
        { title: 'Bulk Issuance', description: 'Issue hundreds of cards at once for corporate gifting seasons — Diwali, Christmas, employee appreciation events.' },
        { title: 'Analytics & Reporting', description: 'Track total outstanding liability, redemption rates, top-up patterns, and card utilization across your network.' },
      ]}
      useCases={[
        'Restaurant chains offering branded gift cards for festival seasons',
        'Pubs running membership cards with stored-value benefits',
        'Corporate dining programs for nearby office complexes',
        'Loyalty reward redemptions through prepaid balance credits',
        'Employee meal programs with company-funded prepaid cards',
      ]}
      faqs={[
        { q: 'What types of prepaid cards can I issue?', a: 'Digitory supports both physical (branded plastic) and digital (mobile wallet) prepaid cards. Physical cards can be custom-designed with your branding. Digital cards work via SMS-based balance access or a web portal.' },
        { q: 'Can prepaid cards be used across multiple outlets?', a: 'Yes, prepaid cards work across all outlets in your chain. The balance is maintained centrally, so a customer can load value at one outlet and redeem at any other.' },
        { q: 'How do corporate dining programs work?', a: 'You create a corporate account, set monthly budgets or per-meal limits, issue cards to employees, and provide the company with monthly usage reports. The company pre-pays or settles on a monthly billing cycle.' },
        { q: 'What happens to unspent prepaid balances?', a: 'Industry data shows approximately 20-30% of prepaid value goes unredeemed, which becomes additional revenue for your business. Digitory helps you manage expiry rules and dormancy policies in compliance with regulations.' },
      ]}
      relatedProducts={[
        { name: 'CRM & Loyalty', href: '/products/crm-loyalty', icon: Users },
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
        { name: 'Prepaid Cards', href: '/products/prepaid-cards', icon: CreditCard },
      ]}
    />
  )
}
