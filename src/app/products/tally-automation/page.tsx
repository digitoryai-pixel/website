import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { Calculator, MonitorSmartphone, Package, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tally Automation for Restaurants - Seamless Accounting Integration',
  description:
    'Automatic sync of restaurant sales, purchases, and expenses to Tally ERP. Eliminate manual data entry, reduce accounting errors by 95%. GST-ready reports.',
  keywords: ['Tally integration restaurant', 'restaurant accounting software', 'Tally automation restaurant India', 'restaurant ERP Tally', 'restaurant accounting integration'],
}

export default function TallyAutomationPage() {
  return (
    <ProductPageLayout
      icon={Calculator}
      iconColor="text-teal-600"
      title="Tally Automation"
      headline="Your restaurant data, automatically in Tally"
      subheadline="Eliminate manual data entry between your restaurant operations and accounting. Daily sales, purchases, expenses, and GST entries flow to Tally automatically."
      benefits={[
        { stat: '95%', label: 'Reduction in data entry errors' },
        { stat: '4 hrs', label: 'Saved daily on accounting tasks' },
        { stat: '100%', label: 'GST-ready ledger entries' },
        { stat: '1-click', label: 'Daily sync to Tally' },
      ]}
      features={[
        { title: 'Automated Sales Posting', description: 'Daily sales summary with breakdowns by payment mode, tax category, and outlet posted to Tally automatically.' },
        { title: 'Purchase Entry Sync', description: 'Purchase orders and GRN entries from Digitory create corresponding purchase vouchers in Tally with correct ledger mapping.' },
        { title: 'GST Ledger Mapping', description: 'Automatic CGST, SGST, and IGST ledger entries based on your tax configuration. Always audit-ready.' },
        { title: 'Multi-Outlet Consolidation', description: 'Consolidate accounting entries from all outlets into a single Tally company, or maintain separate company files per outlet.' },
        { title: 'Expense Tracking', description: 'Petty cash, staff expenses, and operational costs captured in Digitory sync to appropriate expense ledgers in Tally.' },
        { title: 'Bank Reconciliation', description: 'Payment mode-wise entries (cash, card, UPI, wallet) mapped to correct bank ledgers for easy reconciliation.' },
        { title: 'Custom Ledger Mapping', description: 'Map Digitory categories to your existing Tally ledger structure. No need to change your chart of accounts.' },
        { title: 'Sync History & Logs', description: 'Complete audit trail of every sync operation. Review, retry, or modify entries before they hit Tally.' },
        { title: 'Error Handling', description: 'Clear error messages for failed entries with one-click retry. Never lose data between systems.' },
      ]}
      useCases={[
        'Restaurant chains closing books faster with automated daily postings',
        'Finance teams eliminating month-end reconciliation marathons',
        'CA firms managing accounting for multiple restaurant clients',
        'Multi-outlet operators consolidating financials from all locations',
        'Franchise operations maintaining standardized accounting across partners',
      ]}
      faqs={[
        { q: 'How does the Tally integration work?', a: 'Digitory generates structured accounting entries (sales, purchases, expenses, taxes) and pushes them to Tally ERP via a secure sync bridge. You configure ledger mappings once, and daily entries flow automatically.' },
        { q: 'Which versions of Tally are supported?', a: 'Digitory integrates with Tally ERP 9 and TallyPrime. Both desktop and cloud versions are supported. The sync happens via a lightweight connector installed on the Tally machine.' },
        { q: 'Can I review entries before they post to Tally?', a: 'Yes, Digitory provides a preview of all entries before syncing to Tally. You can review, modify, or skip specific entries. You also have the option to auto-sync without review for fully automated workflows.' },
        { q: 'Does this handle GST entries automatically?', a: 'Yes, Digitory automatically splits tax entries into CGST, SGST, and IGST based on your GST configuration and maps them to the corresponding Tally ledgers. This ensures your GST returns data is always accurate.' },
      ]}
      relatedProducts={[
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Inventory Management', href: '/products/inventory-management', icon: Package },
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
        { name: 'Tally Automation', href: '/products/tally-automation', icon: Calculator },
      ]}
    />
  )
}
