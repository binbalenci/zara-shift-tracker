// Move this file to components/Home.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import { useSalaryProfiles } from "../contexts/SalaryProfileContext";
import { SalaryProfile } from "../types";
import Confetti from "react-native-simple-confetti";

const confettiImages = [
  require("../../assets/confetti/Subject 1.png"),
  require("../../assets/confetti/Subject 3.png"),
  require("../../assets/confetti/Subject 4.png"),
  require("../../assets/confetti/Subject 5.png"),
  require("../../assets/confetti/Subject 6.png"),
  require("../../assets/confetti/Subject 7.png"),
  require("../../assets/confetti/Subject 8.png"),
  require("../../assets/confetti/Subject 9.png"),
  require("../../assets/confetti/Subject 10.png"),
];

const getRandomConfettiImage = () => {
  const randomIndex = Math.floor(Math.random() * confettiImages.length);
  return confettiImages[randomIndex];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  rowLabel: {
    flex: 1,
  },
  labelText: {
    fontSize: 16,
    color: "#333",
  },
  valueText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  iconButton: {
    padding: 10,
  },
  totalHours: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 8,
    marginTop: 40,
  },
  totalHoursText: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 150,
  },
  logo: {
    width: 120,
    height: 40,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function Home() {
  const { profiles, loading, error, refreshProfiles } = useSalaryProfiles();
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);
  const [confettiImage, setConfettiImage] = useState(getRandomConfettiImage());

  useEffect(() => {
    console.log("Salary profiles:", profiles);
    console.log("Loading:", loading);
    console.log("Error:", error);
  }, [profiles, loading, error]);

  // Update salary calculations when date or times change
  useEffect(() => {
    const updateSalaryCalculations = async () => {
      const profile = await getSalaryProfileForDate(date);
      if (!profile) {
        setIsValid(false);
        setValidationErrors(["No applicable salary profile."]);
        setExpectedAmount(0);
        return;
      }

      if (!startTime || !endTime) {
        setIsValid(false);
        setValidationErrors(["Start time and end time must be set."]);
        setExpectedAmount(0);
        return;
      }

      const duration = calculateDuration(startTime, endTime);
      if (duration <= 0) {
        setIsValid(false);
        setValidationErrors(["End time must be after start time."]);
        setExpectedAmount(0);
        return;
      }

      const amount = await calculateExpectedAmount(startTime, endTime, date);
      setExpectedAmount(amount);
      setIsValid(true);
      setValidationErrors([]);
    };

    updateSalaryCalculations();
  }, [date, startTime, endTime]);

  const calculateDuration = (start?: Date, end?: Date): number => {
    if (!start || !end) return 0;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.round(duration * 100) / 100; // Round to 2 decimal points
  };

  const calculateExpectedAmount = async (
    start?: Date,
    end?: Date,
    date?: Date
  ): Promise<number> => {
    if (!start || !end || !date) return 0;
    const duration = calculateDuration(start, end);
    const profile = await getSalaryProfileForDate(date);
    if (!profile) return 0;

    const baseHourlyRate = profile.base_hourly_rate;
    let totalEarnings = 0;

    const startHour = start.getHours();
    const endHour = end.getHours();
    const isSaturday = date.getDay() === 6;
    const isSunday = date.getDay() === 0;

    for (let hour = startHour; hour < endHour; hour++) {
      let hourlyRate = baseHourlyRate;

      if (isSunday) {
        hourlyRate *= 2;
      } else if (isSaturday && hour >= 13) {
        hourlyRate += 5.46;
      } else if (hour >= 18) {
        hourlyRate += 4.18;
      }

      totalEarnings += hourlyRate;
    }

    return totalEarnings;
  };

  const isShiftValid = async () => {
    const profile = await getSalaryProfileForDate(date);
    if (!profile) return false;
    if (!startTime || !endTime) return false;
    if (calculateDuration(startTime, endTime) <= 0) return false;
    return true;
  };

  const getValidationErrors = async () => {
    const errors = [];
    const profile = await getSalaryProfileForDate(date);
    if (!profile) errors.push("No applicable salary profile.");
    if (!startTime) errors.push("Start time not set.");
    if (!endTime) errors.push("End time not set.");
    if (startTime && endTime && calculateDuration(startTime, endTime) <= 0)
      errors.push("End time must be after start time.");
    return errors;
  };

  const getSalaryProfileForDate = async (date: Date): Promise<SalaryProfile | null> => {
    const applicableProfiles = profiles.filter((profile: SalaryProfile) => {
      const profileStartDate = new Date(profile.start_date);
      return profileStartDate <= date && (!profile.end_date || new Date(profile.end_date) >= date);
    });

    if (applicableProfiles.length === 0) return null;

    // Return the profile with the most recent start date
    return applicableProfiles.reduce((latest: SalaryProfile, current: SalaryProfile) =>
      new Date(current.start_date) > new Date(latest.start_date) ? current : latest
    );
  };

  const handleAddOrUpdateShift = async () => {
    if (!isValid) return;

    try {
      const profile = await getSalaryProfileForDate(date);
      if (!profile) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No applicable salary profile found for this date",
        });
        return;
      }

      // Create the shift first
      const newShift = {
        date: date.toLocaleDateString("en-CA"), // Format: YYYY-MM-DD
        start_time:
          startTime
            ?.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              hourCycle: "h23",
            })
            .replace(".", ":") || "",
        end_time:
          endTime
            ?.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              hourCycle: "h23",
            })
            .replace(".", ":") || "",
        salary_profile_id: profile.id,
      };

      const { data: createdShift, error: shiftError } = await supabase
        .from("shifts")
        .insert([newShift])
        .select()
        .single();

      if (shiftError) throw shiftError;

      // Calculate the shift earnings
      const shiftStart = new Date(`${newShift.date} ${newShift.start_time}`);
      const shiftEnd = new Date(`${newShift.date} ${newShift.end_time}`);
      const eveningStart = new Date(`${newShift.date} ${profile.evening_start_time}`);
      const weekendStart = new Date(`${newShift.date} ${profile.weekend_extra_start_time}`);

      // Calculate total duration in hours (including partial hours)
      const durationHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

      // Calculate evening hours (after 18:00 on weekdays)
      let eveningHours = 0;
      if (!isWeekend(shiftStart) && shiftEnd > eveningStart && shiftStart < shiftEnd) {
        const effectiveStart = shiftStart > eveningStart ? shiftStart : eveningStart;
        eveningHours = (shiftEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
      }

      // Calculate weekend hours (after 13:00 on Saturday)
      let weekendHours = 0;
      if (isSaturday(shiftStart) && shiftEnd > weekendStart && shiftStart < shiftEnd) {
        const effectiveStart = shiftStart > weekendStart ? shiftStart : weekendStart;
        weekendHours = (shiftEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
      }

      // Calculate Sunday hours
      const sundayHours = isSunday(shiftStart) ? durationHours : 0;

      // Calculate pay with 0.5h deduction for shifts 8 hours or longer
      const baseHours = durationHours >= 8 ? durationHours - 0.5 : durationHours;
      const basePay = baseHours * profile.base_hourly_rate;
      const eveningExtra = eveningHours * profile.evening_extra;
      const weekendExtra = weekendHours * profile.weekend_extra;
      const sundayExtra = sundayHours * profile.base_hourly_rate;
      const totalPay = basePay + eveningExtra + weekendExtra + sundayExtra;

      // Create the shift calculation
      const shiftCalculation = {
        shift_id: createdShift.id,
        duration_hours: durationHours,
        evening_hours: eveningHours,
        weekend_hours: weekendHours,
        sunday_hours: sundayHours,
        base_pay: basePay,
        evening_extra: eveningExtra,
        weekend_extra: weekendExtra,
        sunday_extra: sundayExtra,
        total_pay: totalPay,
      };

      const { error: calcError } = await supabase
        .from("shift_calculations")
        .insert([shiftCalculation]);

      if (calcError) throw calcError;

      // Show success message and confetti
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shift added successfully",
      });
      setConfettiImage(getRandomConfettiImage());
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Reset form
      setDate(new Date());
      setStartTime(undefined);
      setEndTime(undefined);
    } catch (error) {
      console.error("Error adding shift:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add shift",
      });
    }
  };

  // Helper functions for day checks
  const isSaturday = (date: Date) => date.getDay() === 6;
  const isSunday = (date: Date) => date.getDay() === 0;
  const isWeekend = (date: Date) => isSaturday(date) || isSunday(date);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfiles();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfiles]);

  // Update the Total Hours Box to handle async data correctly
  const TotalHoursBox = () => {
    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [expectedAmount, setExpectedAmount] = useState<number>(0);
    const [profile, setProfile] = useState<SalaryProfile | null>(null);
    const [totalHours, setTotalHours] = useState<number>(0);

    useEffect(() => {
      const checkValidity = async () => {
        const valid = await isShiftValid();
        const errorList = await getValidationErrors();
        const amount = await calculateExpectedAmount(startTime, endTime, date);
        const salaryProfile = await getSalaryProfileForDate(date);
        const hours = calculateDuration(startTime, endTime);

        setIsValid(valid);
        setErrors(errorList);
        setExpectedAmount(amount);
        setProfile(salaryProfile);
        setTotalHours(hours);
      };

      checkValidity();
    }, [startTime, endTime, date, profiles]);

    return (
      <View style={[styles.totalHours, { backgroundColor: isValid ? "#E8F5E9" : "#FFCDD2" }]}>
        {!isValid && (
          <Text style={{ color: "#D32F2F", fontWeight: "bold", marginBottom: 5 }}>
            {errors.join(" ")}
          </Text>
        )}
        <Text style={styles.totalHoursText}>Total Hours: {totalHours.toFixed(2)} hours</Text>
        <Text style={styles.totalHoursText}>
          Expected Amount: €{Number(expectedAmount).toFixed(2)}
        </Text>
        <Text style={styles.totalHoursText}>
          Hourly Rate: €{profile?.base_hourly_rate || "N/A"} (Starting Date:{" "}
          {profile?.start_date || "N/A"})
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <Confetti count={100} type="fall" speed={3000} itemSize={60} images={[confettiImage]} />
        </View>
      )}
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Log a Shift</Text>

        {/* Date Picker Row */}
        <TouchableOpacity style={styles.row} onPress={() => setShowDatePicker(true)}>
          <View style={styles.rowLabel}>
            <Text style={styles.labelText}>Date</Text>
            <Text style={styles.valueText}>
              {date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
          </View>
          <MaterialIcons name="calendar-today" size={24} color="#2196F3" />
        </TouchableOpacity>

        {/* Start Time Row */}
        <TouchableOpacity style={styles.row} onPress={() => setShowStartTimePicker(true)}>
          <View style={styles.rowLabel}>
            <Text style={styles.labelText}>Start Time</Text>
            <Text style={styles.valueText}>
              {startTime
                ? startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Select start time"}
            </Text>
          </View>
          <MaterialIcons name="access-time" size={24} color="#2196F3" />
        </TouchableOpacity>

        {/* End Time Row */}
        <TouchableOpacity style={styles.row} onPress={() => setShowEndTimePicker(true)}>
          <View style={styles.rowLabel}>
            <Text style={styles.labelText}>End Time</Text>
            <Text style={styles.valueText}>
              {endTime
                ? endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Select end time"}
            </Text>
          </View>
          <MaterialIcons name="access-time" size={24} color="#2196F3" />
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          onPress={handleAddOrUpdateShift}
          style={{
            backgroundColor: isValid ? "#4CAF50" : "#9E9E9E",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
            marginVertical: 10,
          }}
          disabled={!isValid}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Add Shift</Text>
        </TouchableOpacity>

        {/* Date Picker Modal */}
        <DatePickerModal
          mode="single"
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          date={date}
          locale="en"
          presentationStyle="pageSheet"
          onConfirm={(params) => {
            const { date } = params;
            if (date) {
              setDate(date);
            }
            setShowDatePicker(false);
          }}
        />

        {/* Time Picker Modals */}
        <TimePickerModal
          visible={showStartTimePicker}
          onDismiss={() => setShowStartTimePicker(false)}
          onConfirm={({ hours, minutes }) => {
            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            setStartTime(date);
            setShowStartTimePicker(false);
          }}
        />
        <TimePickerModal
          visible={showEndTimePicker}
          onDismiss={() => setShowEndTimePicker(false)}
          onConfirm={({ hours, minutes }) => {
            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            setEndTime(date);
            setShowEndTimePicker(false);
          }}
        />

        {/* Total Hours Box */}
        <TotalHoursBox />

        {/* Zara Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/zara_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
}
