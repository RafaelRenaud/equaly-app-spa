/**
 * Interface for Occur RNC Response
 */
export interface OccurRNCResponse {
  occur: {
    id: number;
    code: string;
    hasRNCOpened: boolean;
  };
  rnc: {
    id: number;
    code: string;
  };
}