import type { Metadata } from 'next'
import ProductPageLayout from '@/components/ProductPageLayout'
import { ChefHat, Package, MonitorSmartphone, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restaurant Recipe Management Software - Standardize Recipes & Control Costs',
  description:
    'Standardize recipes across your restaurant chain. Track ingredient costs, manage portions, ensure consistency. Reduce food cost variance to under 2%.',
  keywords: ['recipe management software restaurant', 'food costing software India', 'recipe costing restaurant', 'restaurant recipe standardization', 'menu costing software'],
}

export default function RecipeManagementPage() {
  return (
    <ProductPageLayout
      icon={ChefHat}
      iconColor="text-orange-600"
      title="Recipe Management"
      headline="Standardize recipes. Control costs. Ensure consistency."
      subheadline="Define every recipe down to the gram. Track ingredient costs in real-time, manage sub-recipes, and maintain food quality consistency across every outlet."
      benefits={[
        { stat: '<2%', label: 'Food cost variance' },
        { stat: '100%', label: 'Recipe standardization' },
        { stat: '15%', label: 'Improvement in food cost control' },
        { stat: '5 min', label: 'Menu costing updates' },
      ]}
      features={[
        { title: 'Detailed Recipe Cards', description: 'Define ingredients, quantities, preparation steps, and plating instructions. Attach photos for visual reference.' },
        { title: 'Sub-Recipe Management', description: 'Build recipes from sub-recipes (sauces, marinades, bases). Cost flows up automatically through the hierarchy.' },
        { title: 'Real-Time Food Costing', description: 'Ingredient costs update automatically from purchase orders. Know your exact food cost percentage at all times.' },
        { title: 'Portion Control', description: 'Set standard portion sizes with tolerance levels. Flag deviations to maintain consistency and control costs.' },
        { title: 'Menu Engineering', description: 'Classify menu items by popularity and profitability. Identify stars, workhorses, puzzles, and dogs for optimization.' },
        { title: 'Allergen & Nutrition Tracking', description: 'Track allergens, nutritional information, and dietary tags for each recipe. Ensure FSSAI compliance.' },
        { title: 'Yield Management', description: 'Track cooking yields and preparation losses. Calculate true costs accounting for shrinkage and waste.' },
        { title: 'Central Recipe Updates', description: 'Update recipes from HQ and push changes to all outlets instantly. Version control ensures traceability.' },
        { title: 'Theoretical vs Actual Consumption', description: 'Compare what should have been consumed (based on sales) vs actual inventory changes. Spot variances immediately.' },
      ]}
      useCases={[
        'Chain restaurants maintaining consistent food quality across 20+ outlets',
        'New outlet launches with instant recipe replication from existing locations',
        'Menu revamps with instant food cost impact analysis before going live',
        'Central kitchens managing production recipes and batch costing',
        'Franchise operations ensuring brand consistency across partner outlets',
      ]}
      faqs={[
        { q: 'How does recipe management help control food costs?', a: 'By defining exact quantities for every ingredient in every recipe, you know exactly what each dish should cost. Digitory compares this theoretical cost against actual consumption to identify variances, waste, and potential theft.' },
        { q: 'Can I manage sub-recipes like sauces and marinades?', a: 'Yes, Digitory supports unlimited levels of sub-recipe hierarchy. Costs flow up automatically, so when a sauce ingredient price changes, all dishes using that sauce reflect the updated cost instantly.' },
        { q: 'Does it integrate with inventory management?', a: 'Completely. When an order is placed, Digitory automatically deducts the recipe ingredients from inventory. This creates theoretical consumption data that can be compared against actual stock levels.' },
        { q: 'Can I track allergens and nutritional information?', a: 'Yes, Digitory tracks 14 major allergens, nutritional macros, and dietary tags (vegan, gluten-free, etc.) for each recipe. This information can be displayed on your QR ordering menu for guest safety.' },
      ]}
      relatedProducts={[
        { name: 'Inventory Management', href: '/products/inventory-management', icon: Package },
        { name: 'Point of Sale', href: '/products/point-of-sale', icon: MonitorSmartphone },
        { name: 'Executive Analytics', href: '/products/analytics', icon: BarChart3 },
        { name: 'Kitchen Display System', href: '/products/kitchen-display-system', icon: ChefHat },
      ]}
    />
  )
}
