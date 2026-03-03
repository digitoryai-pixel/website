import type { Metadata } from 'next'
import IndustryPageLayout from '@/components/IndustryPageLayout'
import { Store, MonitorSmartphone, Package, ChefHat, BarChart3, Users, Calculator } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Multi-Outlet Restaurant Chain Management Software India',
  description:
    'Complete technology platform for multi-outlet restaurant chains. Centralized menu management, real-time inventory, recipe standardization & analytics across all outlets.',
  keywords: ['multi outlet restaurant software', 'restaurant chain management software India', 'chain restaurant ERP', 'multi location restaurant POS', 'restaurant franchise software'],
}

export default function RestaurantChainsPage() {
  return (
    <IndustryPageLayout
      icon={Store}
      iconColor="text-primary-600"
      industry="Restaurant Chains"
      headline="Centralized control. Local execution. Chain-wide visibility."
      subheadline="Manage menus, pricing, inventory, recipes, and analytics across all your outlets from a single command center. Scale from 2 outlets to 200 without losing control."
      stats={[
        { value: '200+', label: 'Chain outlets managed' },
        { value: '15%', label: 'Average food cost reduction' },
        { value: '48 hrs', label: 'New outlet go-live time' },
        { value: '100%', label: 'Menu consistency across outlets' },
      ]}
      challenges={[
        { title: 'Menu & Pricing Inconsistency', description: 'Different outlets running different menus and prices without centralized control leads to brand dilution and customer confusion.' },
        { title: 'No Real-Time Visibility', description: 'Waiting for end-of-day reports means problems in one outlet go undetected until it\'s too late to act.' },
        { title: 'Food Cost Leakage', description: 'Without standardized recipes and real-time inventory tracking, food costs vary wildly across outlets with no accountability.' },
        { title: 'Slow New Outlet Launches', description: 'Setting up technology for a new outlet takes weeks of configuration, data entry, and staff training.' },
        { title: 'Disconnected Systems', description: 'Using different tools for POS, inventory, accounting, and CRM creates data silos and manual reconciliation nightmares.' },
        { title: 'Franchise Partner Management', description: 'Maintaining operational standards and financial transparency across franchise-owned outlets without constant physical oversight.' },
      ]}
      solutions={[
        { module: 'Centralized POS', description: 'Push menu changes, pricing updates, and promotions to all outlets instantly. Monitor real-time sales from HQ.', icon: MonitorSmartphone, href: '/products/point-of-sale' },
        { module: 'Chain-Wide Inventory', description: 'Real-time stock levels across all outlets. Centralized purchasing, vendor management, and inter-outlet transfers.', icon: Package, href: '/products/inventory-management' },
        { module: 'Recipe Standardization', description: 'Define every recipe once, deploy everywhere. Ensure taste consistency and cost control at every outlet.', icon: ChefHat, href: '/products/recipe-management' },
        { module: 'Executive Analytics', description: 'Compare outlet performance, identify trends, and make data-driven decisions with real-time dashboards.', icon: BarChart3, href: '/products/analytics' },
        { module: 'Chain CRM & Loyalty', description: 'One loyalty program across all outlets. Customers earn at any location, redeem anywhere.', icon: Users, href: '/products/crm-loyalty' },
        { module: 'Tally Automation', description: 'Consolidate accounting from all outlets into Tally automatically. Close books faster, reconcile easier.', icon: Calculator, href: '/products/tally-automation' },
      ]}
      outcomes={[
        '10-18% reduction in food costs through standardized recipes and real-time inventory tracking',
        '100% menu and pricing consistency across all outlets with centralized control',
        'New outlet go-live in under 48 hours with pre-configured templates',
        'Real-time visibility into every outlet\'s performance from a single dashboard',
        'Unified customer loyalty program driving 40% more repeat visits across the chain',
        '4+ hours saved daily on accounting with automated Tally sync from all outlets',
        'Complete audit trail and role-based access for franchise partner accountability',
      ]}
      faqs={[
        { q: 'How does Digitory help manage multiple restaurant outlets?', a: 'Digitory provides a centralized dashboard where you can manage menus, pricing, inventory, recipes, and operations for all outlets. Changes made at HQ are pushed to outlets instantly. Real-time analytics give you visibility into every outlet\'s performance.' },
        { q: 'Can different outlets have different menus or prices?', a: 'Yes, while Digitory supports centralized menu management, you can also configure outlet-specific menus, prices, and promotions. This is useful for outlets in different cities or formats within the same chain.' },
        { q: 'How quickly can I add a new outlet?', a: 'With Digitory, a new outlet can go live in under 48 hours. We clone your existing configuration — menus, recipes, vendor lists, and workflows — and customize only what needs to be different. Staff training takes just 2-3 hours.' },
        { q: 'Is Digitory suitable for franchise operations?', a: 'Yes, Digitory supports franchise operations with partner-specific access levels, financial transparency, and standardized operations. Franchisees get their own dashboard while the franchisor maintains brand control and visibility.' },
      ]}
    />
  )
}
