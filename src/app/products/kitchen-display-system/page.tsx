import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { LayoutDashboard, MonitorSmartphone, QrCode, ChefHat } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kitchen Display System (KDS) for Restaurants - Streamline Kitchen Operations',
  description:
    'Paperless kitchen display system for restaurants. Real-time order routing, preparation tracking, multi-station coordination. Reduce order errors to near zero.',
  keywords: ['kitchen display system restaurant', 'KDS restaurant India', 'kitchen order management system', 'restaurant kitchen technology', 'paperless kitchen system'],
}

export default function KitchenDisplayPage() {
  return (
    <ProductPageLayout
      icon={LayoutDashboard}
      iconColor="text-red-600"
      title="Kitchen Display System"
      headline="Paperless kitchen. Zero missed orders."
      subheadline="Replace kitchen printers with intelligent display screens. Route orders to the right station, track preparation times, and coordinate multi-station kitchens effortlessly."
      benefits={[
        { stat: '~0', label: 'Missed or lost orders' },
        { stat: '20%', label: 'Faster order preparation' },
        { stat: '100%', label: 'Paperless kitchen ops' },
        { stat: 'Real-time', label: 'Station coordination' },
      ]}
      features={[
        { title: 'Multi-Station Routing', description: 'Automatically route order items to the correct kitchen station — grill, bar, dessert, prep. Each station sees only their items.' },
        { title: 'Color-Coded Priority', description: 'Orders change color based on elapsed time. Green for new, yellow for in-progress, red for overdue. Instant visual prioritization.' },
        { title: 'Preparation Tracking', description: 'Track preparation time for every order item. Identify bottlenecks, set time benchmarks, and hold kitchen teams accountable.' },
        { title: 'Bump Screen Interface', description: 'Simple bump-to-complete interface designed for kitchen environments. Touch-friendly, grease-resistant, high-contrast display.' },
        { title: 'Course-Fire Management', description: 'Fire courses at the right time. Hold starters until the table is seated, fire mains when starters are cleared.' },
        { title: 'Aggregator Integration', description: 'Delivery orders from Swiggy, Zomato, and others appear alongside dine-in orders with clear source labels.' },
        { title: 'Recall & Modify', description: 'View order history, recall completed orders, and handle modifications without losing track of the original order.' },
        { title: 'Audio Alerts', description: 'Configurable sound alerts for new orders, overdue items, and rush orders. Never miss an order even in a noisy kitchen.' },
        { title: 'Performance Reports', description: 'Daily, weekly, and monthly reports on average prep time, station throughput, and order accuracy rates.' },
      ]}
      useCases={[
        'Multi-station kitchens coordinating grill, sauté, fry, and dessert sections',
        'Pubs managing food and beverage orders on separate display screens',
        'Cloud kitchens handling high-volume delivery orders across multiple brands',
        'QSR chains tracking speed-of-service metrics and kitchen efficiency',
        'Fine dining restaurants managing course-fire timing for multi-course meals',
      ]}
      faqs={[
        { q: 'What is a kitchen display system?', a: 'A kitchen display system (KDS) replaces traditional paper ticket printers in the kitchen with digital screens that display orders in real-time. Orders route automatically to the correct station, change color based on urgency, and provide preparation tracking data.' },
        { q: 'Does the KDS work with delivery aggregator orders?', a: 'Yes, Digitory KDS displays orders from Swiggy, Zomato, and other aggregators alongside your dine-in orders. Each order is clearly labeled with its source so kitchen staff can prioritize appropriately.' },
        { q: 'What hardware do I need for the KDS?', a: 'You need a mounted Android tablet or display screen at each kitchen station. Digitory supports any Android device with a screen size of 10 inches or larger. We can also recommend industrial-grade, kitchen-rated displays.' },
        { q: 'Can I track kitchen performance with the KDS?', a: 'Yes, Digitory KDS provides detailed reports on average preparation time, station throughput, overdue order frequency, and order accuracy rates. This data helps you identify bottlenecks and optimize kitchen workflows.' },
      ]}
      relatedProducts={[
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'QR Code Ordering', href: '/products/qr-ordering', icon: QrCode },
        { name: 'Recipe Management', href: '/products/recipe-management', icon: ChefHat },
        { name: 'Kitchen Display', href: '/products/kitchen-display-system', icon: LayoutDashboard },
      ]}
    />
  )
}
