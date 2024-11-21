/* eslint-disable prettier/prettier */
export interface HealthCheckResponse {
    status: string;
    info: {
      [key: string]: {
        status: string;
      };
    };
    error: {
      [key: string]: {
        status: string;
        message: string;
      };
    };
    details: {
      [key: string]: {
        status: string;
        message?: string;
      };
    };
  }