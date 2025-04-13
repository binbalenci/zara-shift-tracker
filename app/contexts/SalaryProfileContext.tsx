import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { SalaryProfile } from "../types";

interface SalaryProfileContextType {
  profiles: SalaryProfile[];
  loading: boolean;
  error: string | null;
  refreshProfiles: () => Promise<void>;
}

const SalaryProfileContext = createContext<SalaryProfileContextType>({
  profiles: [],
  loading: true,
  error: null,
  refreshProfiles: async () => {},
});

export const useSalaryProfiles = () => useContext(SalaryProfileContext);

export const SalaryProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<SalaryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      console.log("Starting to fetch salary profiles...");
      setLoading(true);

      // Test Supabase connection
      const { data: testData, error: testError } = await supabase
        .from("salary_profiles")
        .select("count")
        .single();

      if (testError) {
        console.error("Supabase connection test failed:", testError);
        throw testError;
      }
      console.log("Supabase connection successful, count:", testData);

      const { data, error } = await supabase
        .from("salary_profiles")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Successfully fetched profiles:", data);
      setProfiles(data || []);
      setError(null);
    } catch (err) {
      console.error("Error in fetchProfiles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch salary profiles");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  useEffect(() => {
    console.log("SalaryProfileProvider mounted, fetching profiles...");
    fetchProfiles();
  }, []);

  return (
    <SalaryProfileContext.Provider
      value={{
        profiles,
        loading,
        error,
        refreshProfiles,
      }}
    >
      {children}
    </SalaryProfileContext.Provider>
  );
};
