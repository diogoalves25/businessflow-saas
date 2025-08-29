'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Wrench, Wind, Smile, Scissors, 
  Activity, BookOpen, Car, Trees, Utensils,
  Check
} from 'lucide-react';
import { businessTemplates } from '@/src/lib/business-templates';

const businessIcons = {
  CLEANING: Sparkles,
  PLUMBING: Wrench,
  HVAC: Wind,
  DENTAL: Smile,
  BEAUTY: Scissors,
  FITNESS: Activity,
  TUTORING: BookOpen,
  AUTO_REPAIR: Car,
  LANDSCAPING: Trees,
  CATERING: Utensils,
};

export default function BusinessTypeSelection() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');

  const handleContinue = async () => {
    if (!selectedType || !businessName) return;
    
    // In a real app, you would save this to the database
    // For now, we'll store it in localStorage
    localStorage.setItem('businessType', selectedType);
    localStorage.setItem('businessName', businessName);
    
    // Redirect to the main admin dashboard
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BusinessFlow!
          </h1>
          <p className="text-xl text-gray-600">
            Let&apos;s set up your business. First, what type of services do you offer?
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Business Type Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {Object.entries(businessTemplates).map(([key, template]) => {
              const Icon = businessIcons[key as keyof typeof businessIcons];
              const isSelected = selectedType === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`relative p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: isSelected ? template.color : undefined 
                      }}
                    >
                      <Icon className={`w-6 h-6 ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center">
                      {template.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Business Name Input */}
          {selectedType && (
            <div className="mb-8 animate-fadeIn">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s your business name?
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
              />
            </div>
          )}

          {/* Selected Business Preview */}
          {selectedType && businessName && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg animate-fadeIn">
              <h3 className="font-semibold text-gray-900 mb-4">
                Your Business Preview
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Business Type:</span> {businessTemplates[selectedType].name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Business Name:</span> {businessName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Services Available:</span>
                </p>
                <ul className="ml-4 space-y-1">
                  {businessTemplates[selectedType].services.map((service) => (
                    <li key={service.name} className="text-sm text-gray-600">
                      • {service.name} ({service.duration} min) - ${service.basePrice}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedType || !businessName}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              selectedType && businessName
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}