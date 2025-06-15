import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { SalaryProfile } from "../types";
import { Logger } from "../utils/logger";

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
        Logger.error(testError, {
          operation: "supabase_connection_test",
          table: "salary_profiles",
        });
        throw testError;
      }
      console.log("Supabase connection successful, count:", testData);

      const { data, error } = await supabase
        .from("salary_profiles")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        Logger.error(error, {
          operation: "fetch_salary_profiles",
          query: "select_all_profiles_ordered_by_start_date",
        });
        throw error;
      }

      console.log("Successfully fetched profiles:", data);
      setProfiles(data || []);
      setError(null);
    } catch (err) {
      Logger.error(err as Error, {
        operation: "salary_profile_context_fetch",
        context: "profile_provider_initialization",
      });
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
