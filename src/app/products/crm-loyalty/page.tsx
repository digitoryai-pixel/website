import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { Users, MonitorSmartphone, CreditCard, QrCode } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant CRM & Loyalty Program Software India',
  description:
    'Build customer profiles, run targeted campaigns, and create loyalty programs that drive repeat visits. Increase customer retention by 40% with Digitory CRM.',
  keywords: ['restaurant CRM India', 'restaurant loyalty program software', 'customer loyalty restaurant', 'restaurant marketing automation', 'CRM for restaurant chains'],
}

export default function CRMLoyaltyPage() {
  return (
    <ProductPageLayout
      icon={Users}
      iconColor="text-pink-600"
      title="CRM & Loyalty"
      headline="Turn first-time guests into lifelong regulars"
      subheadline="Build rich customer profiles, segment your audience, run targeted campaigns, and create loyalty programs that genuinely drive repeat visits and higher spending."
      benefits={[
        { stat: '40%', label: 'Increase in repeat visits' },
        { stat: '22%', label: 'Higher customer lifetime value' },
        { stat: '3x', label: 'Campaign ROI vs generic promotions' },
        { stat: '60%', label: 'Loyalty program enrollment rate' },
      ]}
      features={[
        { title: 'Unified Customer Profiles', description: 'Auto-build profiles from POS transactions, QR orders, and feedback. Track visit frequency, spend patterns, and preferences.' },
        { title: 'Smart Segmentation', description: 'Segment customers by visit frequency, spend level, favorite items, dietary preferences, and more. Target the right message to the right guest.' },
        { title: 'Points-Based Loyalty', description: 'Flexible points earning and redemption rules. Bonus points on birthdays, double points on slow days, tiered membership levels.' },
        { title: 'Automated Campaigns', description: 'Trigger campaigns based on customer behavior — win-back lapsed guests, reward high-spenders, celebrate milestones.' },
        { title: 'WhatsApp & SMS Marketing', description: 'Send personalized offers via WhatsApp and SMS. Higher open rates than email, instant delivery, direct response.' },
        { title: 'Feedback & Reviews', description: 'Collect post-visit feedback, track NPS scores, and route negative feedback to managers for immediate resolution.' },
        { title: 'Birthday & Anniversary Rewards', description: 'Automatically identify upcoming celebrations and send personalized offers to drive special occasion visits.' },
        { title: 'Referral Programs', description: 'Let your best customers bring new ones. Track referrals, reward advocates, and measure program effectiveness.' },
        { title: 'RFM Analysis', description: 'Recency-Frequency-Monetary analysis to identify your most valuable customers and those at risk of churning.' },
      ]}
      useCases={[
        'Restaurant chains building a unified customer database across all outlets',
        'Pubs running weekly promotions and happy hour campaigns to regulars',
        'Casual dining brands creating tiered loyalty programs (Silver, Gold, Platinum)',
        'QSR chains driving app-less loyalty through phone number-based enrollment',
        'Multi-brand operators sharing customer data across their restaurant portfolio',
      ]}
      faqs={[
        { q: 'How does the restaurant loyalty program work?', a: 'Customers enroll by sharing their phone number at billing. They earn points on every visit based on spend. Points can be redeemed for discounts, free items, or experiences. You set the earning rate, redemption rules, and tier thresholds.' },
        { q: 'Can I run different loyalty programs for different outlets?', a: 'Yes, you can run a unified loyalty program across all outlets, or create outlet-specific programs. Most chains prefer a unified program so customers earn and redeem across any location.' },
        { q: 'Does the CRM integrate with POS and QR ordering?', a: 'Completely. Customer data flows from every touchpoint — POS transactions, QR ordering, feedback forms, and reservations. This gives you a 360-degree view of each customer without any manual data entry.' },
        { q: 'What types of campaigns can I run?', a: 'You can run birthday campaigns, win-back campaigns for lapsed guests, reward campaigns for top spenders, festival promotions, new menu item announcements, and location-specific offers. All campaigns can be automated based on triggers.' },
      ]}
      relatedProducts={[
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Prepaid Cards', href: '/products/prepaid-cards', icon: CreditCard },
        { name: 'QR Code Ordering', href: '/products/qr-ordering', icon: QrCode },
        { name: 'CRM & Loyalty', href: '/products/crm-loyalty', icon: Users },
      ]}
    />
  )
}
