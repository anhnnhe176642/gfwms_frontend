'use client';
import React from 'react';
import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Truck className="h-8 w-8" />,
    title: 'Giao hàng nhanh',
    description: 'Giao hàng toàn quốc trong 1-3 ngày, miễn phí từ 500k',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Cam kết chất lượng',
    description: 'Sản phẩm 100% chính hãng, đảm bảo chất lượng',
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ khách hàng sẵn sàng giải đáp',
  },
  {
    icon: <RotateCcw className="h-8 w-8" />,
    title: 'Hoàn trả miễn phí',
    description: 'Hoàn trả 100% nếu không hài lòng trong 30 ngày',
  },
];

export default function WhyUs() {
  return (
    <div className="w-full py-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Tại sao chọn chúng tôi?</h2>
        <p className="text-muted-foreground mt-2">
          Những lý do khiến khách hàng tin tưởng và yêu thích
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
