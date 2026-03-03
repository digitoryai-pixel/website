import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { BarChart3, MonitorSmartphone, Package, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant Analytics Dashboard - Executive Insights & Reporting',
  description:
    'Real-time restaurant analytics dashboard with sales trends, outlet comparisons, product mix analysis, and actionable insights. Data-driven decisions for restaurant leaders.',
  keywords: ['restaurant analytics software', 'restaurant reporting dashboard', 'restaurant business intelligence', 'multi outlet restaurant analytics', 'restaurant data analytics India'],
}

export default function AnalyticsPage() {
  return (
    <ProductPageLayout
      icon={BarChart3}
      iconColor="text-cyan-600"
      title="Executive Analytics"
      headline="Data-driven decisions for every level of leadership"
      subheadline="Real-time dashboards that give CXOs the big picture, operations heads the outlet-level detail, and managers the daily metrics they need to run better restaurants."
      benefits={[
        { stat: 'Real-time', label: 'Cross-outlet visibility' },
        { stat: '50+', label: 'Pre-built report templates' },
        { stat: '5 sec', label: 'Average dashboard load time' },
        { stat: '100%', label: 'Data accuracy from source systems' },
      ]}
      features={[
        { title: 'Executive Dashboard', description: 'Bird\'s-eye view of revenue, profitability, customer metrics, and operational KPIs across your entire chain.' },
        { title: 'Outlet Comparison', description: 'Compare revenue, footfall, average bill, and efficiency metrics across outlets. Identify top performers and underperformers.' },
        { title: 'Product Mix Analysis', description: 'Understand which items sell most, which are most profitable, and which underperform. Drive menu engineering decisions with data.' },
        { title: 'Sales Trend Analysis', description: 'Daily, weekly, monthly, and year-over-year sales trends. Identify seasonality, growth patterns, and anomalies.' },
        { title: 'Food Cost Reports', description: 'Track food cost percentage by outlet, by category, and by item. Compare theoretical vs actual costs in real-time.' },
        { title: 'Labor Productivity', description: 'Revenue per labor hour, covers per server, and staff efficiency metrics to optimize scheduling and reduce labor costs.' },
        { title: 'Custom Reports', description: 'Build custom reports with drag-and-drop. Choose metrics, dimensions, filters, and visualizations that matter to your business.' },
        { title: 'Scheduled Reports', description: 'Auto-deliver daily, weekly, or monthly reports to your inbox. No need to log in — the data comes to you.' },
        { title: 'Mobile Access', description: 'Access all dashboards from your phone. Check business performance anytime, anywhere with the Digitory mobile app.' },
      ]}
      useCases={[
        'CXOs monitoring overall chain performance and growth trends',
        'Operations heads comparing outlet performance and identifying issues',
        'Finance teams tracking food costs, revenue, and profitability by location',
        'Marketing teams measuring campaign ROI and customer acquisition costs',
        'Outlet managers reviewing daily performance and shift-level metrics',
      ]}
      faqs={[
        { q: 'What kind of reports can I generate?', a: 'Digitory comes with 50+ pre-built reports covering sales, inventory, food costs, labor, customers, and operations. You can also create custom reports with a drag-and-drop builder, choosing the metrics, dimensions, and visualizations that matter most to your business.' },
        { q: 'Is the data real-time?', a: 'Yes, all dashboards reflect real-time data from your POS, inventory, and other modules. Sales figures, inventory levels, and operational metrics update continuously as transactions happen across all outlets.' },
        { q: 'Can I access analytics on my phone?', a: 'Yes, Digitory provides a fully functional mobile analytics experience. You can view dashboards, drill into reports, and receive automated alerts directly on your smartphone.' },
        { q: 'Can I compare performance across outlets?', a: 'Absolutely. Outlet comparison is a core feature. You can compare any metric — revenue, footfall, average bill, food cost percentage, customer satisfaction scores — across any set of outlets for any time period.' },
      ]}
      relatedProducts={[
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Inventory Management', href: '/products/inventory-management', icon: Package },
        { name: 'CRM & Loyalty', href: '/products/crm-loyalty', icon: Users },
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
      ]}
    />
  )
}
