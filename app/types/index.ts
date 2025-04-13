export interface SalaryProfile {
  id: string;
  name: string;
  base_hourly_rate: number;
  evening_extra: number;
  evening_start_time: string;  // Format: "18:00"
  weekend_extra: number;
  weekend_extra_start_time: string;  // Format: "13:00"
  start_date: string;  // Format: "YYYY-MM-DD"
  end_date: string | null;
  sunday_extra: number;
  created_at: string;
  updated_at: string;
}

export interface ShiftCalculation {
  id: string;
  shift_id: string;
  salary_profile_id: string;
  duration_hours: number;  // Total hours of the shift
  evening_hours: number;
  weekend_hours: number;
  sunday_hours: number;
  base_pay: number;
  evening_extra: number;
  weekend_extra: number;
  sunday_extra: number;
  total_pay: number;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  salary_profile_id: string;
}

export type RootStackParamList = {
  Home: undefined;
  Statistics: undefined;
  Settings: undefined;
}; 