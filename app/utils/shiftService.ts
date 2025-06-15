import { supabase } from "./supabaseClient";
import { Shift } from "../types";
import { Logger } from "./logger";

export async function createShift(shift: Omit<Shift, 'id'>) {
  const { data, error } = await supabase
    .from('shifts')
    .insert([shift]);
  if (error) {
    Logger.error(error, {
      operation: 'create_shift',
      shift_data: shift
    });
    throw error;
  }
  return data;
}

export const getShifts = async (): Promise<Shift[]> => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    Logger.error(error, {
      operation: 'fetch_shifts',
      query: 'select_all_shifts_ordered_by_date'
    });
    throw error;
  }

  return data || [];
};

export const updateShift = async (id: string, updatedShift: Partial<Shift>): Promise<void> => {
  const { error } = await supabase.from("shifts").update(updatedShift).eq("id", id);
  if (error) {
    Logger.error(error, {
      operation: 'update_shift',
      shift_id: id,
      updated_fields: Object.keys(updatedShift)
    });
    throw error;
  }
};

export const deleteShift = async (id: string): Promise<void> => {
  const { error } = await supabase.from("shifts").delete().eq("id", id);

  if (error) {
    Logger.error(error, {
      operation: 'delete_shift',
      shift_id: id
    });
    throw error;
  }
}; 