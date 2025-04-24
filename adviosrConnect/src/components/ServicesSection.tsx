import React from 'react';
import { LineChart, MessageCircle, Lightbulb } from 'lucide-react';

export function ServicesSection() {
  const services = [
    {
      icon: LineChart,
      title: 'Portfolio Review',
      description: 'Get expert analysis of your current investments and recommendations for optimization.',
    },
    {
      icon: MessageCircle,
      title: 'Direct Q&A',
      description: 'Ask specific questions about your investments and get clear, actionable answers.',
    },
    {
      icon: Lightbulb,
      title: 'Investment Advice',
      description: 'Receive personalized investment strategies aligned with your financial goals.',
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">What We Offer</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="rounded-lg bg-gray-50 p-6 text-center">
              <service.icon className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}