export interface CreateUpdateRncForm {
  rnc: {
    id: number;
  };
  status: 'DRAFT_OPENED' | 'AWAITING_VALIDATION';
  analysis?: {
    problem: string;
    questions?: {
      level: number;
      answer: string;
    }[];
    causes?: {
      category: 'MACHINE' | 'METHOD' | 'MOTHER_NATURE' | 'MANPOWER' | 'MEASUREMENTS';
      causeType: 'ROOT' | 'CONTRIBUTING';
      description: string;
    }[];
  };
  actionPlan?: {
    description: string;
    followUp: string;
    involved?: {
      id: number;
      name: string;
    };
  };
}