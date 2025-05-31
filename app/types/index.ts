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
  total_hours: number;     // Total shift duration (for logging)
  paid_hours: number;      // Billable hours (total - break)
  evening_hours: number;   // Hours getting evening bonus
  sunday_hours: number;    // Hours getting Sunday bonus
  break_duration: number;  // Break time (0.5h if shift >= 8h)
  base_pay: number;        // paid_hours × base_rate (covers ALL hours)
  evening_extra: number;   // evening_hours × evening_extra_rate (just extra)
  sunday_extra: number;    // sunday_hours × sunday_extra_rate (just extra)  
  total_pay: number;       // base_pay + evening_extra + sunday_extra
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