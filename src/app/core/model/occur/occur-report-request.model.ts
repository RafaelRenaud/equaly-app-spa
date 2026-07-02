/**
 * Interface for Report Occur
 */
export interface ReportOccur {
  inspectorReport: string;
  rnc: {
    //Priority pode ser LOW, MEDIUM, HIGH
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    reporter: {
      id: number;
    }
  };
}