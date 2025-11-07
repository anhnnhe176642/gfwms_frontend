'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-linear-to-r from-blue-500 to-purple-600 border-0 overflow-hidden">
        <div className="px-6 md:px-12 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-white" />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Nhận thông tin khuyến mãi
              </h2>
              <p className="text-blue-100">
                Đăng ký nhận email để cập nhật các tin tức mới nhất, ưu đãi đặc biệt và giảm giá độc quyền
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-gray-900 border-0"
                />
                <Button
                  type="submit"
                  className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap"
                >
                  Đăng ký
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-white bg-white/10 rounded-lg px-4 py-2 max-w-md mx-auto">
                <Check className="h-5 w-5" />
                <span>Cảm ơn! Kiểm tra email của bạn.</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
