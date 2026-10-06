// src/app/api/model/analytics.ts

// ============================================================
// Payload building blocks
// ============================================================

export interface MetricEntry {
  key?: string;
  value?: number;
}

export interface DistributionBucket {
  key?: string;
  label?: string;
  value?: number;
}

export interface DistributionSeries {
  key?: string;
  label?: string;
  values?: number[];
}

export interface TimeSeriesPoint {
  date?: string;
  metrics?: MetricEntry[];
}

export interface RankingEntry {
  id?: number;
  name?: string;
  metrics?: MetricEntry[];
}

export interface TableColumn {
  key?: string;
  label?: string;
  dataType?: TableColumn.DataTypeEnum;
}

export namespace TableColumn {
  export type DataTypeEnum = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DATETIME';
  export const DataTypeEnum = {
    STRING: 'STRING' as DataTypeEnum,
    NUMBER: 'NUMBER' as DataTypeEnum,
    BOOLEAN: 'BOOLEAN' as DataTypeEnum,
    DATE: 'DATE' as DataTypeEnum,
    DATETIME: 'DATETIME' as DataTypeEnum,
  };
}

// ============================================================
// Analytics payloads
// ============================================================

export interface AnalyticsKpiPayload {
  metrics?: MetricEntry[];
}

export interface AnalyticsDistributionPayload {
  buckets?: DistributionBucket[];
  series?: DistributionSeries[];
}

export interface AnalyticsTimeSeriesPayload {
  points?: TimeSeriesPoint[];
  granularity?: AnalyticsTimeSeriesPayload.GranularityEnum;
}

export namespace AnalyticsTimeSeriesPayload {
  export type GranularityEnum = 'DAY' | 'MONTH';
  export const GranularityEnum = {
    DAY: 'DAY' as GranularityEnum,
    MONTH: 'MONTH' as GranularityEnum,
  };
}

export interface AnalyticsRankingPayload {
  entries?: RankingEntry[];
}

export interface AnalyticsTablePayload {
  columns?: TableColumn[];
  rows?: Array<{ [key: string]: any }>;
}

// ============================================================
// Company
// ============================================================

export interface CompanyWrapper {
  id?: number;
  name?: string;
  status?: CompanyWrapper.StatusEnum;
  logoUri?: string;
}

export namespace CompanyWrapper {
  export type StatusEnum = 'ACTIVE' | 'INACTIVE';
  export const StatusEnum = {
    ACTIVE: 'ACTIVE' as StatusEnum,
    INACTIVE: 'INACTIVE' as StatusEnum,
  };
}

// ============================================================
// Analytics block
// ============================================================

export interface Analytics {
  analyticsType?: Analytics.AnalyticsTypeEnum;
  displayName?: string;
  payload?:
    | AnalyticsKpiPayload
    | AnalyticsDistributionPayload
    | AnalyticsTimeSeriesPayload
    | AnalyticsRankingPayload
    | AnalyticsTablePayload;
}

export namespace Analytics {
  export type AnalyticsTypeEnum =
    | 'ADMIN_COMPANY_OVERVIEW'
    | 'ADMIN_COMPANY_GROWTH'
    | 'ADMIN_USERS_BY_ROLE'
    | 'ADMIN_CREDENTIALS_BY_COMPANY'
    | 'ADMIN_COMPANY_KPIS'
    | 'ADMIN_USERS_BY_DEPARTMENT'
    | 'ADMIN_USERS_BY_ROLE_COMPANY'
    | 'ADMIN_USERS_GROWTH'
    | 'ADMIN_OCCUR_TYPES_USAGE'
    | 'OCCUR_KPIS'
    | 'OCCUR_BY_STATUS'
    | 'OCCUR_BY_PRIORITY'
    | 'OCCUR_BY_TYPE'
    | 'OCCUR_BY_CHANNEL'
    | 'OCCUR_BY_COMPLAINT_TYPE'
    | 'OCCUR_DAILY_SERIES'
    | 'OCCUR_AVG_CLOSE_TIME'
    | 'OCCUR_RATING_STATS'
    | 'OCCUR_BY_INSPECTOR'
    | 'OCCUR_BY_OPENER'
    | 'OCCUR_ANONYMITY'
    | 'RNC_KPIS'
    | 'RNC_BY_PRIORITY'
    | 'RNC_BY_STATUS'
    | 'RNC_DAILY_SERIES'
    | 'RNC_AVG_CLOSE_TIME'
    | 'RNC_BY_INSPECTOR'
    | 'RNC_FORM_BY_STATUS'
    | 'RNC_CAUSES_BY_CATEGORY'
    | 'RNC_FORM_STAGE_DURATIONS'
    | 'RNC_FORM_OVERDUE_FOLLOWUP'
    | 'RNC_BY_REPORTER'
    | 'RNC_REPORTER_MONTHLY';

  export const AnalyticsTypeEnum = {
    ADMIN_COMPANY_OVERVIEW: 'ADMIN_COMPANY_OVERVIEW' as AnalyticsTypeEnum,
    ADMIN_COMPANY_GROWTH: 'ADMIN_COMPANY_GROWTH' as AnalyticsTypeEnum,
    ADMIN_USERS_BY_ROLE: 'ADMIN_USERS_BY_ROLE' as AnalyticsTypeEnum,
    ADMIN_CREDENTIALS_BY_COMPANY: 'ADMIN_CREDENTIALS_BY_COMPANY' as AnalyticsTypeEnum,
    ADMIN_COMPANY_KPIS: 'ADMIN_COMPANY_KPIS' as AnalyticsTypeEnum,
    ADMIN_USERS_BY_DEPARTMENT: 'ADMIN_USERS_BY_DEPARTMENT' as AnalyticsTypeEnum,
    ADMIN_USERS_BY_ROLE_COMPANY: 'ADMIN_USERS_BY_ROLE_COMPANY' as AnalyticsTypeEnum,
    ADMIN_USERS_GROWTH: 'ADMIN_USERS_GROWTH' as AnalyticsTypeEnum,
    ADMIN_OCCUR_TYPES_USAGE: 'ADMIN_OCCUR_TYPES_USAGE' as AnalyticsTypeEnum,
    OCCUR_KPIS: 'OCCUR_KPIS' as AnalyticsTypeEnum,
    OCCUR_BY_STATUS: 'OCCUR_BY_STATUS' as AnalyticsTypeEnum,
    OCCUR_BY_PRIORITY: 'OCCUR_BY_PRIORITY' as AnalyticsTypeEnum,
    OCCUR_BY_TYPE: 'OCCUR_BY_TYPE' as AnalyticsTypeEnum,
    OCCUR_BY_CHANNEL: 'OCCUR_BY_CHANNEL' as AnalyticsTypeEnum,
    OCCUR_BY_COMPLAINT_TYPE: 'OCCUR_BY_COMPLAINT_TYPE' as AnalyticsTypeEnum,
    OCCUR_DAILY_SERIES: 'OCCUR_DAILY_SERIES' as AnalyticsTypeEnum,
    OCCUR_AVG_CLOSE_TIME: 'OCCUR_AVG_CLOSE_TIME' as AnalyticsTypeEnum,
    OCCUR_RATING_STATS: 'OCCUR_RATING_STATS' as AnalyticsTypeEnum,
    OCCUR_BY_INSPECTOR: 'OCCUR_BY_INSPECTOR' as AnalyticsTypeEnum,
    OCCUR_BY_OPENER: 'OCCUR_BY_OPENER' as AnalyticsTypeEnum,
    OCCUR_ANONYMITY: 'OCCUR_ANONYMITY' as AnalyticsTypeEnum,
    RNC_KPIS: 'RNC_KPIS' as AnalyticsTypeEnum,
    RNC_BY_PRIORITY: 'RNC_BY_PRIORITY' as AnalyticsTypeEnum,
    RNC_BY_STATUS: 'RNC_BY_STATUS' as AnalyticsTypeEnum,
    RNC_DAILY_SERIES: 'RNC_DAILY_SERIES' as AnalyticsTypeEnum,
    RNC_AVG_CLOSE_TIME: 'RNC_AVG_CLOSE_TIME' as AnalyticsTypeEnum,
    RNC_BY_INSPECTOR: 'RNC_BY_INSPECTOR' as AnalyticsTypeEnum,
    RNC_FORM_BY_STATUS: 'RNC_FORM_BY_STATUS' as AnalyticsTypeEnum,
    RNC_CAUSES_BY_CATEGORY: 'RNC_CAUSES_BY_CATEGORY' as AnalyticsTypeEnum,
    RNC_FORM_STAGE_DURATIONS: 'RNC_FORM_STAGE_DURATIONS' as AnalyticsTypeEnum,
    RNC_FORM_OVERDUE_FOLLOWUP: 'RNC_FORM_OVERDUE_FOLLOWUP' as AnalyticsTypeEnum,
    RNC_BY_REPORTER: 'RNC_BY_REPORTER' as AnalyticsTypeEnum,
    RNC_REPORTER_MONTHLY: 'RNC_REPORTER_MONTHLY' as AnalyticsTypeEnum,
  };
}

// ============================================================
// Response root
// ============================================================

export interface AnalyticsResponse {
  company?: CompanyWrapper;
  generatedAt?: string;
  roles?: AnalyticsResponse.RolesEnum[];
  analytics?: Analytics[];
}

export namespace AnalyticsResponse {
  export type RolesEnum =
    | 'EQUALY_MASTER_ADMIN'
    | 'MASTER_ADMIN'
    | 'COMMON_ADMIN'
    | 'MASTER_EVENT_OPENER'
    | 'COMMON_EVENT_OPENER'
    | 'MASTER_QUALITY_INSPECTOR'
    | 'COMMON_QUALITY_INSPECTOR'
    | 'COMMON_RNC_REPORTER';

  export const RolesEnum = {
    EQUALY_MASTER_ADMIN: 'EQUALY_MASTER_ADMIN' as RolesEnum,
    MASTER_ADMIN: 'MASTER_ADMIN' as RolesEnum,
    COMMON_ADMIN: 'COMMON_ADMIN' as RolesEnum,
    MASTER_EVENT_OPENER: 'MASTER_EVENT_OPENER' as RolesEnum,
    COMMON_EVENT_OPENER: 'COMMON_EVENT_OPENER' as RolesEnum,
    MASTER_QUALITY_INSPECTOR: 'MASTER_QUALITY_INSPECTOR' as RolesEnum,
    COMMON_QUALITY_INSPECTOR: 'COMMON_QUALITY_INSPECTOR' as RolesEnum,
    COMMON_RNC_REPORTER: 'COMMON_RNC_REPORTER' as RolesEnum,
  };
}