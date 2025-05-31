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
  total_hours: number;             // Total shift duration (for logging)
  paid_hours: number;              // Billable hours (total - break)
  weekday_evening_hours: number;   // Weekday hours getting evening bonus (after 18:00)
  saturday_evening_hours: number;  // Saturday hours getting evening bonus (after 13:00)
  sunday_hours: number;            // Hours getting Sunday bonus
  break_duration: number;          // Break time (0.5h if shift >= 8h)
  base_pay: number;                // paid_hours × base_rate (covers ALL hours)
  weekday_evening_bonus: number;   // weekday_evening_hours × €4.18 (just extra)
  saturday_evening_bonus: number;  // saturday_evening_hours × €5.46 (just extra)
  sunday_bonus: number;            // sunday_hours × sunday_extra_rate (just extra)  
  total_pay: number;               // base_pay + weekday_evening_bonus + saturday_evening_bonus + sunday_bonus
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