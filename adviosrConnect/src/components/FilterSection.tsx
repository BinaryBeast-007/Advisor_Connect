import React from 'react';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  selectedLanguages: string[];
  selectedExperience: string[];
  onLanguageChange: (languages: string[]) => void;
  onExperienceChange: (experience: string[]) => void;
}

const languageOptions: FilterOption[] = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Gujarati', label: 'Gujarati' },
];

const experienceOptions: FilterOption[] = [
  { value: '0-5', label: '0-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

export function FilterSection({
  selectedLanguages,
  selectedExperience,
  onLanguageChange,
  onExperienceChange,
}: FilterSectionProps) {
  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>

      <div>
        <h4 className="mb-3 font-medium">Languages</h4>
        <div className="space-y-2">
          {languageOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onLanguageChange([...selectedLanguages, option.value]);
                  } else {
                    onLanguageChange(selectedLanguages.filter((lang) => lang !== option.value));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-medium">Experience</h4>
        <div className="space-y-2">
          {experienceOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedExperience.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onExperienceChange([...selectedExperience, option.value]);
                  } else {
                    onExperienceChange(selectedExperience.filter((exp) => exp !== option.value));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}