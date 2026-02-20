import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Stethoscope, Laptop, Briefcase, FileText, 
  UserCheck, Globe, Building, Megaphone, Monitor,
  TrendingUp, Target, Palette, Users, Share2,
  Calculator, Award, Receipt, Shield, Scale,
  Building2, FileCheck, FileSignature, ShieldCheck,
  DollarSign, Search, Users2, Truck, Ship,
  Package, Warehouse, Factory, Cog, Settings,
  Bot, Box, Lightbulb, Map, BarChart3,
  MessageSquare, Workflow, Leaf, Wind, Sprout, TreePine
} from 'lucide-react';

const iconMap = {
  healthcare: Stethoscope,
  tech: Laptop,
  executive: Briefcase,
  contract: FileText,
  permanent: UserCheck,
  offshore: Globe,
  general: Building,
  Megaphone, Monitor, TrendingUp, Target, Palette, Users, Share2,
  Calculator, Award, Receipt, Shield, Scale,
  Building2, FileCheck, FileSignature, ShieldCheck,
  DollarSign, Search, Users2, Truck, Ship,
  Package, Warehouse, Factory, Cog, Settings,
  Bot, Box, Lightbulb, Map, BarChart3,
  MessageSquare, Workflow, Leaf, Wind, Sprout, TreePine
};

export default function CategoryGrid({ categories }) {
  // Only show parent categories or categories without parent
  const displayCategories = categories.filter(cat => (cat.is_parent ?? cat.isParent) || !(cat.parent_id ?? cat.parentId));
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayCategories.map((category) => {
        const Icon = iconMap[category.icon] || Building;
        return (
          <Link 
             key={category.id}
             href={createPageUrl('Directory') + `?category=${category.slug}`}
           >
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-blue-100">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}