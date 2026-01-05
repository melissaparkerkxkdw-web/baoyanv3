export interface UserProfile {
  name: string;
  contact: string; // Phone/WeChat
  university: string;
  major: string;
  grade: '大一' | '大二' | '大三' | '大四';
  rank: string; // e.g., "1/100" or "Top 5%"
  englishLevel: string; // e.g., "CET6 580"
  awards: string;
  research: string;
  targetDirection: string; // Intended specialization
  confusion: string; // Specific question from user
  isNewEngineering: boolean; // True for CS/AI/EE etc.
}

export interface PlanSection {
  title: string;
  content: string[];
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface EmploymentOutlook {
  title: string;
  averageSalary: string; // e.g. "30w-50w"
  topCompanies: string[];
  roles: string[];
}

// New Interface for School Statistics
export interface SchoolStats {
  rateTrend: { year: string; rate: string }[]; // e.g. [{year: '2021', rate: '15.5%'}, ...]
  bonusPolicies: { category: string; content: string }[]; // e.g. [{category: '竞赛', content: '国一+3'}]
  destinations: { school: string; count: string }[]; // e.g. [{school: '清华', count: '10%'}]
}

export interface GeneratedPlan {
  confusionAnalysis: PlanSection; // Expert answer
  summary: string;
  schoolStats: SchoolStats; // NEW: School Data Visualization
  swot: SwotAnalysis;
  analysis: PlanSection; // Background analysis
  targetSchools: PlanSection; // School recommendations & Policy
  competitionStrategy: PlanSection; // Contest recommendations
  researchStrategy: PlanSection; // Research & Paper strategy
  employment: EmploymentOutlook;
  timeline: PlanSection; // Monthly/Semester plan
  crossMajor?: PlanSection; // Optional cross-major advice
  productRecommendation: 'Sunrise' | 'Harvest'; // 破晓 vs 桃李
}

export interface ProductInfo {
  name: string;
  description: string;
  features: string[];
  imageUrl: string;
}