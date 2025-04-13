import { supabase } from "./supabaseClient";
import { Shift } from "../types";

export async function createShift(shift: Omit<Shift, 'id'>) {
  const { data, error } = await supabase
    .from('shifts')
    .insert([shift]);
  if (error) throw error;
  return data;
}

export const getShifts = async (): Promise<Shift[]> => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching shifts:", error);
    throw error;
  }

  return data || [];
};

export async function updateShift(id: string, updatedShift: Partial<Shift>) {
  const { data, error } = await supabase
    .from('shifts')
    .update(updatedShift)
    .eq('id', id);
  if (error) throw error;
  return data;
}

export const deleteShift = async (id: string): Promise<void> => {
  const { error } = await supabase.from("shifts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting shift:", error);
    throw error;
  }
}; 