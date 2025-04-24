import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const scrollToAdvisors = () => {
    const advisorSection = document.querySelector('#advisor-sections');
    if (advisorSection) {
      advisorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-blue-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="mb-8 lg:mb-0">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Book 1-on-1 Calls with</span>
              <span className="block text-blue-600">SEBI-Registered Investment Experts</span>
            </h1>
            <p className="mt-6 max-w-lg text-xl text-gray-500">
              Connect with trusted, SEBI-registered advisors and MFDs for direct, personalized advice
              tailored to your investment goals.
            </p>
            <div className="mt-8 flex space-x-4">
              <Link 
                to="/signup"
                className="rounded-full bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
              >
                Get Started
              </Link>
              <button 
                onClick={scrollToAdvisors}
                className="group rounded-full border-2 border-blue-600 px-8 py-3 text-blue-600 hover:bg-blue-50"
              >
                View Advisors
                <ArrowRight className="ml-2 inline-block h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Investment advisor meeting"
              className="rounded-lg object-cover shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}