// rnc-form.model.ts

import { RncAudit } from './rnc-audit.model';
import { RncWrapper } from './rnc-wrapper.model';

export interface RncForm {
    id: number;
    code: string;
    rnc: RncWrapper;
    status: 'DRAFT_OPENED' | 'AWAITING_VALIDATION' | 'VALIDATION_EDITION' |
    'AWAITING_IMPLEMENTATION' | 'AWAITING_EFFICACY_ANALYSIS' |
    'IMPLEMENTATION_EDITION' | 'CLOSED';
    analysis?: RncFormAnalysis;
    actionPlan?: RncFormActionPlan;
    validation?: RncFormValidation;
    implementation?: RncFormImplementation;
    efficacy?: RncFormEfficacy;
    audit: RncAudit;
}

export interface RncFormAnalysis {
    problem: string;
    questions?: RncFormQuestion[];
    causes?: RncFormCause[];
}

export interface RncFormQuestion {
    id: number;
    level: number;
    answer: string;
}

export interface RncFormCause {
    id: number;
    category: 'MACHINE' | 'METHOD' | 'MOTHER_NATURE' | 'MANPOWER' | 'MEASUREMENTS';
    causeType: 'ROOT' | 'CONTRIBUTING';
    description: string;
}

export interface RncFormActionPlan {
    description: string;
    followUp: string;
    involved?: {
        id: number;
        name: string;
    };
}

export interface RncFormValidation {
    description: string;
    validatedAt: string;
    validatedBy: string;
}

export interface RncFormImplementation {
    description: string;
    implementedAt: string;
    implementedBy: string;
}

export interface RncFormEfficacy {
    description: string;
    analysedAt: string;
    analysedBy: string;
}