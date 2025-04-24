import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import type { ServicePackage } from '../types';

interface ServicePackageCardProps {
  package: ServicePackage;
  advisorId: string;
  onSelect: (advisorId: string, pkg: ServicePackage) => void;
}

export function ServicePackageCard({ package: pkg, advisorId, onSelect }: ServicePackageCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">{pkg.title}</h3>
        <p className="mt-2 text-gray-600">{pkg.description}</p>
      </div>

      <div className="mb-4 flex items-center space-x-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>{pkg.duration} minutes</span>
      </div>

      <ul className="mb-6 space-y-2">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2 text-sm">
            <span className="text-green-500">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">₹{pkg.price}</span>
        <button
          onClick={() => onSelect(advisorId, pkg)}
          className="flex items-center space-x-1 rounded-full bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <span>Book</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}