export interface BusinessTemplate {
  name: string;
  color: string;
  icon: string;
  services: Array<{
    name: string;
    duration: number; // minutes
    basePrice: number;
  }>;
  teamMemberTitle: string;
  teamMemberPluralTitle: string;
}

export const businessTemplates: Record<string, BusinessTemplate> = {
  CLEANING: {
    name: "Cleaning Service",
    color: "#00CED1",
    icon: "sparkles",
    services: [
      { name: "Regular Cleaning", duration: 60, basePrice: 80 },
      { name: "Deep Cleaning", duration: 120, basePrice: 150 },
      { name: "Move-in/out Cleaning", duration: 180, basePrice: 200 },
      { name: "Office Cleaning", duration: 90, basePrice: 120 },
    ],
    teamMemberTitle: "Cleaner",
    teamMemberPluralTitle: "Cleaners",
  },
  PLUMBING: {
    name: "Plumbing Service", 
    color: "#1E90FF",
    icon: "wrench",
    services: [
      { name: "Emergency Repair", duration: 60, basePrice: 150 },
      { name: "Routine Maintenance", duration: 90, basePrice: 100 },
      { name: "Installation", duration: 180, basePrice: 300 },
      { name: "Drain Cleaning", duration: 60, basePrice: 120 },
    ],
    teamMemberTitle: "Plumber",
    teamMemberPluralTitle: "Plumbers",
  },
  HVAC: {
    name: "HVAC Service",
    color: "#FF6347",
    icon: "wind",
    services: [
      { name: "AC/Heating Repair", duration: 90, basePrice: 180 },
      { name: "System Maintenance", duration: 60, basePrice: 120 },
      { name: "Installation", duration: 240, basePrice: 500 },
      { name: "Duct Cleaning", duration: 120, basePrice: 200 },
    ],
    teamMemberTitle: "Technician",
    teamMemberPluralTitle: "Technicians",
  },
  DENTAL: {
    name: "Dental Practice",
    color: "#00BCD4",
    icon: "smile",
    services: [
      { name: "Checkup & Cleaning", duration: 45, basePrice: 150 },
      { name: "Filling", duration: 60, basePrice: 200 },
      { name: "Root Canal", duration: 90, basePrice: 800 },
      { name: "Crown", duration: 120, basePrice: 1200 },
    ],
    teamMemberTitle: "Dentist",
    teamMemberPluralTitle: "Dentists",
  },
  BEAUTY: {
    name: "Beauty Salon",
    color: "#FF69B4",
    icon: "scissors",
    services: [
      { name: "Haircut & Style", duration: 60, basePrice: 60 },
      { name: "Hair Color", duration: 120, basePrice: 120 },
      { name: "Manicure", duration: 45, basePrice: 40 },
      { name: "Facial", duration: 60, basePrice: 80 },
    ],
    teamMemberTitle: "Stylist",
    teamMemberPluralTitle: "Stylists",
  },
  FITNESS: {
    name: "Fitness Studio",
    color: "#32CD32",
    icon: "activity",
    services: [
      { name: "Personal Training", duration: 60, basePrice: 80 },
      { name: "Group Class", duration: 60, basePrice: 30 },
      { name: "Nutritional Consultation", duration: 45, basePrice: 100 },
      { name: "Fitness Assessment", duration: 90, basePrice: 150 },
    ],
    teamMemberTitle: "Trainer",
    teamMemberPluralTitle: "Trainers",
  },
  TUTORING: {
    name: "Tutoring Service",
    color: "#9370DB",
    icon: "book-open",
    services: [
      { name: "Math Tutoring", duration: 60, basePrice: 60 },
      { name: "Science Tutoring", duration: 60, basePrice: 60 },
      { name: "Language Tutoring", duration: 60, basePrice: 55 },
      { name: "Test Prep", duration: 90, basePrice: 90 },
    ],
    teamMemberTitle: "Tutor",
    teamMemberPluralTitle: "Tutors",
  },
  AUTO_REPAIR: {
    name: "Auto Repair Shop",
    color: "#708090",
    icon: "car",
    services: [
      { name: "Oil Change", duration: 30, basePrice: 50 },
      { name: "Brake Service", duration: 120, basePrice: 300 },
      { name: "Engine Diagnostic", duration: 60, basePrice: 100 },
      { name: "Tire Rotation", duration: 45, basePrice: 60 },
    ],
    teamMemberTitle: "Mechanic",
    teamMemberPluralTitle: "Mechanics",
  },
  LANDSCAPING: {
    name: "Landscaping Service",
    color: "#228B22",
    icon: "tree",
    services: [
      { name: "Lawn Mowing", duration: 60, basePrice: 60 },
      { name: "Garden Design", duration: 180, basePrice: 300 },
      { name: "Tree Trimming", duration: 120, basePrice: 200 },
      { name: "Seasonal Cleanup", duration: 180, basePrice: 250 },
    ],
    teamMemberTitle: "Landscaper",
    teamMemberPluralTitle: "Landscapers",
  },
  CATERING: {
    name: "Catering Service",
    color: "#D2691E",
    icon: "utensils",
    services: [
      { name: "Small Event (10-20)", duration: 240, basePrice: 500 },
      { name: "Medium Event (20-50)", duration: 360, basePrice: 1200 },
      { name: "Large Event (50-100)", duration: 480, basePrice: 2500 },
      { name: "Corporate Lunch", duration: 120, basePrice: 400 },
    ],
    teamMemberTitle: "Chef",
    teamMemberPluralTitle: "Chefs",
  },
};

export function getBusinessTemplate(businessType: string): BusinessTemplate {
  return businessTemplates[businessType] || businessTemplates.CLEANING;
}

export function getServicesByBusinessType(businessType: string) {
  const template = getBusinessTemplate(businessType);
  return template.services;
}

export function getBusinessColor(businessType: string): string {
  const template = getBusinessTemplate(businessType);
  return template.color;
}

export function getTeamMemberTitle(businessType: string, plural = false): string {
  const template = getBusinessTemplate(businessType);
  return plural ? template.teamMemberPluralTitle : template.teamMemberTitle;
}