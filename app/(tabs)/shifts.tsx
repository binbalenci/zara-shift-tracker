import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { supabase } from "../utils/supabaseClient";
import { Shift, ShiftCalculation } from "../types";
import { useSalaryProfiles } from "../contexts/SalaryProfileContext";
import { getShifts, deleteShift } from "../utils/shiftService";
import { Logger } from "../utils/logger";

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
  shiftBox: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  shiftDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  shiftSalary: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  modifyButton: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#666",
    padding: 10,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  breakdownLabel: {
    fontSize: 16,
    color: "#666",
  },
  breakdownValue: {
    fontSize: 16,
    color: "#333",
  },
  totalRow: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  breakdownSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 10,
  },
});

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftCalculations, setShiftCalculations] = useState<Record<string, ShiftCalculation>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { profiles } = useSalaryProfiles();

  // Modal states
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Edit form states
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [editStartTime, setEditStartTime] = useState<Date | undefined>();
  const [editEndTime, setEditEndTime] = useState<Date | undefined>();
  const [editSickLeave, setEditSickLeave] = useState<boolean>(false);
  const [editPublicHoliday, setEditPublicHoliday] = useState<boolean>(false);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        Logger.error(error, {
          operation: "fetch_shifts_with_calculations",
          query: "select_shifts_ordered_by_date",
        });
        throw error;
      }
      setShifts(data || []);

      // Fetch shift calculations for all shifts
      const { data: calculations, error: calcError } = await supabase
        .from("shift_calculations")
        .select("*")
        .in("shift_id", data?.map((shift) => shift.id) || []);

      if (calcError) {
        Logger.error(calcError, {
          operation: "fetch_shift_calculations",
          shift_ids: data?.map((shift) => shift.id) || [],
        });
        throw calcError;
      }

      const calculationsMap = (calculations || []).reduce((acc, calc) => {
        acc[calc.shift_id] = calc;
        return acc;
      }, {} as Record<string, ShiftCalculation>);

      setShiftCalculations(calculationsMap);
    } catch (error) {
      Logger.error(error as Error, {
        operation: "fetch_shifts_complete_flow",
        context: "shifts_screen_initialization",
      });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch shifts",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleModifyShift = async () => {
    if (!selectedShift || !editDate || !editStartTime || !editEndTime) return;

    try {
      // Get the applicable salary profile
      const profile = await getSalaryProfileForDate(editDate);
      if (!profile) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No applicable salary profile found for this date",
        });
        return;
      }

      // Update the shift with sick leave and public holiday status
      const { error: shiftError } = await supabase
        .from("shifts")
        .update({
          date: editDate.toLocaleDateString("en-CA"),
          start_time: editStartTime
            .toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              hourCycle: "h23",
            })
            .replace(".", ":"),
          end_time: editEndTime
            .toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              hourCycle: "h23",
            })
            .replace(".", ":"),
          sick_leave: editSickLeave,
          public_holiday: editPublicHoliday,
        })
        .eq("id", selectedShift.id);

      if (shiftError) {
        Logger.error(shiftError, {
          operation: "update_shift",
          shift_id: selectedShift.id,
          updated_data: {
            date: editDate.toLocaleDateString("en-CA"),
            sick_leave: editSickLeave,
            public_holiday: editPublicHoliday,
          },
        });
        throw shiftError;
      }

      // Calculate new earnings
      const shiftStart = new Date(
        `${editDate.toLocaleDateString("en-CA")} ${editStartTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`
      );
      const shiftEnd = new Date(
        `${editDate.toLocaleDateString("en-CA")} ${editEndTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`
      );
      const eveningStart = new Date(
        `${editDate.toLocaleDateString("en-CA")} ${profile.evening_start_time}`
      );
      const weekendStart = new Date(
        `${editDate.toLocaleDateString("en-CA")} ${profile.weekend_extra_start_time}`
      );

      // Calculate total duration in hours
      const totalHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

      // Calculate break duration and paid hours
      const breakDuration = totalHours >= 8 ? 0.5 : 0;
      const paidHours = totalHours - breakDuration;

      // Calculate evening hours - now split between weekday and Saturday
      let weekdayEveningHours = 0;
      let saturdayEveningHours = 0;

      // For sick leave or public holiday, no evening hours are counted for bonuses
      if (!editSickLeave && !editPublicHoliday && !isSunday(shiftStart)) {
        if (isSaturday(shiftStart)) {
          // Saturday: evening rate starts at 13:00
          if (shiftEnd > weekendStart && shiftStart < shiftEnd) {
            const effectiveStart = shiftStart > weekendStart ? shiftStart : weekendStart;
            saturdayEveningHours =
              (shiftEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
          }
        } else {
          // Weekday: evening rate starts at 18:00
          if (shiftEnd > eveningStart && shiftStart < shiftEnd) {
            const effectiveStart = shiftStart > eveningStart ? shiftStart : eveningStart;
            weekdayEveningHours =
              (shiftEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
          }
        }
      }

      // Calculate Sunday hours (all paid hours if Sunday and not sick leave or public holiday, 0 otherwise)
      const sundayHours =
        !editSickLeave && !editPublicHoliday && isSunday(shiftStart) ? paidHours : 0;

      // APPROACH 2: Base pay covers ALL paid hours, bonuses are just additional amounts
      // Sick leave takes precedence - if sick, no bonuses at all
      const basePay = paidHours * profile.base_hourly_rate; // ALL hours at base rate
      const weekdayEveningBonus = editSickLeave
        ? 0
        : editPublicHoliday
        ? 0
        : weekdayEveningHours * 4.18;
      const saturdayEveningBonus = editSickLeave
        ? 0
        : editPublicHoliday
        ? 0
        : saturdayEveningHours * 5.46;
      const sundayBonus = editSickLeave
        ? 0
        : editPublicHoliday
        ? 0
        : sundayHours * profile.sunday_extra;
      const holidayBonus = editSickLeave ? 0 : editPublicHoliday ? basePay : 0; // Sick leave overrides holiday bonus
      const totalPay =
        basePay + weekdayEveningBonus + saturdayEveningBonus + sundayBonus + holidayBonus;

      // Update shift calculation with new split evening fields
      const { error: calcError } = await supabase
        .from("shift_calculations")
        .update({
          total_hours: totalHours,
          paid_hours: paidHours,
          weekday_evening_hours: weekdayEveningHours,
          saturday_evening_hours: saturdayEveningHours,
          sunday_hours: sundayHours,
          break_duration: breakDuration,
          base_pay: basePay,
          weekday_evening_bonus: weekdayEveningBonus,
          saturday_evening_bonus: saturdayEveningBonus,
          sunday_bonus: sundayBonus,
          holiday_bonus: holidayBonus,
          total_pay: totalPay,
        })
        .eq("shift_id", selectedShift.id);

      if (calcError) {
        Logger.error(calcError, {
          operation: "update_shift_calculation",
          shift_id: selectedShift.id,
          calculation_data: {
            total_hours: totalHours,
            total_pay: totalPay,
          },
        });
        throw calcError;
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shift updated successfully",
      });

      setShowModifyModal(false);
      fetchShifts();
    } catch (error) {
      Logger.error(error as Error, {
        operation: "modify_shift_complete_flow",
        shift_id: selectedShift?.id,
        edit_data: {
          date: editDate?.toISOString(),
          sick_leave: editSickLeave,
          public_holiday: editPublicHoliday,
        },
      });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update shift",
      });
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;

    try {
      const { error } = await supabase.from("shifts").delete().eq("id", selectedShift.id);

      if (error) {
        Logger.error(error, {
          operation: "delete_shift",
          shift_id: selectedShift.id,
          shift_date: selectedShift.date,
        });
        throw error;
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shift deleted successfully",
      });

      setShowDeleteModal(false);
      fetchShifts();
    } catch (error) {
      Logger.error(error as Error, {
        operation: "delete_shift_complete_flow",
        shift_id: selectedShift?.id,
        shift_date: selectedShift?.date,
      });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete shift",
      });
    }
  };

  const openModifyModal = (shift: Shift) => {
    setSelectedShift(shift);
    setEditDate(new Date(shift.date));
    setEditStartTime(new Date(`2000-01-01T${shift.start_time}`));
    setEditEndTime(new Date(`2000-01-01T${shift.end_time}`));
    setEditSickLeave(shift.sick_leave || false);
    setEditPublicHoliday(shift.public_holiday || false);
    setShowModifyModal(true);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHours = (hours: number): string => {
    // Remove unnecessary decimals: 5.00 -> 5h, 5.50 -> 5.5h
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  const renderShift = ({ item }: { item: Shift }) => {
    const calculation = shiftCalculations[item.id];
    const isSickLeave = item.sick_leave || false;
    const isPublicHoliday = item.public_holiday || false;

    // Determine background color and badge - sick leave takes precedence
    let backgroundColor = "white"; // Normal
    let badgeColor = "";
    let badgeText = "";

    if (isSickLeave) {
      backgroundColor = "#FFEBEE"; // Light red for sick leave
      badgeColor = "#D32F2F";
      badgeText = "SICK";
    } else if (isPublicHoliday) {
      backgroundColor = "#FFF8E1"; // Light amber for holidays
      badgeColor = "#FF9800";
      badgeText = "HOLIDAY";
    }

    return (
      <TouchableOpacity
        style={[styles.shiftBox, { backgroundColor }]}
        onPress={() => {
          setSelectedShift(item);
          setShowBreakdownModal(true);
        }}
      >
        <View style={styles.shiftInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.shiftTime}>{formatDate(item.date)}</Text>
            {(isSickLeave || isPublicHoliday) && (
              <View
                style={{
                  backgroundColor: badgeColor,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  {badgeText}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.shiftDate}>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
          {calculation && (
            <Text style={styles.shiftSalary}>€{calculation.total_pay.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.modifyButton} onPress={() => openModifyModal(item)}>
            <Text style={styles.buttonText}>Modify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              setSelectedShift(item);
              setShowDeleteModal(true);
            }}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchShifts();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Add helper functions
  const isWeekend = (date: Date) => isSaturday(date) || isSunday(date);
  const isSaturday = (date: Date) => date.getDay() === 6;
  const isSunday = (date: Date) => date.getDay() === 0;

  const getSalaryProfileForDate = async (date: Date) => {
    const applicableProfiles = profiles.filter((profile) => {
      const profileStartDate = new Date(profile.start_date);
      return profileStartDate <= date && (!profile.end_date || new Date(profile.end_date) >= date);
    });

    if (applicableProfiles.length === 0) return null;

    // Return the profile with the most recent start date
    return applicableProfiles.reduce((latest, current) =>
      new Date(current.start_date) > new Date(latest.start_date) ? current : latest
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shifts</Text>
      {shifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No shifts recorded yet</Text>
        </View>
      ) : (
        <FlatList
          data={shifts}
          renderItem={renderShift}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      {/* Modify Modal */}
      <Modal
        visible={showModifyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModifyModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Modify Shift</Text>

            {/* Date Row */}
            <TouchableOpacity style={styles.row} onPress={() => setShowDatePicker(true)}>
              <View style={styles.rowLabel}>
                <Text style={styles.labelText}>Date</Text>
                <Text style={styles.valueText}>
                  {editDate.toLocaleDateString("en-GB", {
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
                  {editStartTime?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
              </View>
              <MaterialIcons name="access-time" size={24} color="#2196F3" />
            </TouchableOpacity>

            {/* End Time Row */}
            <TouchableOpacity style={styles.row} onPress={() => setShowEndTimePicker(true)}>
              <View style={styles.rowLabel}>
                <Text style={styles.labelText}>End Time</Text>
                <Text style={styles.valueText}>
                  {editEndTime?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
              </View>
              <MaterialIcons name="access-time" size={24} color="#2196F3" />
            </TouchableOpacity>

            {/* Sick Leave Row */}
            <TouchableOpacity style={styles.row} onPress={() => setEditSickLeave(!editSickLeave)}>
              <View style={styles.rowLabel}>
                <Text style={styles.labelText}>Sick Leave</Text>
                <Text style={styles.valueText}>
                  {editSickLeave ? "Base pay only (no bonuses)" : "Normal shift calculation"}
                </Text>
              </View>
              <MaterialIcons
                name={editSickLeave ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={editSickLeave ? "#FF9800" : "#666"}
              />
            </TouchableOpacity>

            {/* Public Holiday Row */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setEditPublicHoliday(!editPublicHoliday)}
            >
              <View style={styles.rowLabel}>
                <Text style={styles.labelText}>Public Holiday</Text>
                <Text style={styles.valueText}>
                  {editPublicHoliday ? "Double pay (100% bonus)" : "Normal calculation"}
                </Text>
              </View>
              <MaterialIcons
                name={editPublicHoliday ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={editPublicHoliday ? "#D32F2F" : "#666"}
              />
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModifyModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#2196F3" }]}
                onPress={handleModifyShift}
              >
                <Text style={styles.buttonText}>Yes, update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Delete Shift</Text>
            <Text>Are you sure you want to delete this shift?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#FF0000" }]}
                onPress={handleDeleteShift}
              >
                <Text style={styles.buttonText}>Yes, delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={editDate}
        locale="en"
        presentationStyle="pageSheet"
        onConfirm={(params) => {
          const { date } = params;
          if (date) {
            setEditDate(date);
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
          setEditStartTime(date);
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
          setEditEndTime(date);
          setShowEndTimePicker(false);
        }}
      />

      {/* Earnings Breakdown Modal */}
      <Modal
        visible={showBreakdownModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBreakdownModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View style={[styles.modal, { width: "95%" }]}>
            <Text style={styles.modalTitle}>Shift Details</Text>
            {selectedShift && shiftCalculations[selectedShift.id] && (
              <>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Date:</Text>
                  <Text style={styles.breakdownValue}>{formatDate(selectedShift.date)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Time:</Text>
                  <Text style={styles.breakdownValue}>
                    {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                  </Text>
                </View>
                {selectedShift.sick_leave && (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: "#D32F2F", fontWeight: "bold" }]}>
                      Sick Leave:
                    </Text>
                    <Text style={[styles.breakdownValue, { color: "#D32F2F", fontWeight: "bold" }]}>
                      Base pay only
                    </Text>
                  </View>
                )}
                {selectedShift.public_holiday && !selectedShift.sick_leave && (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: "#FF9800", fontWeight: "bold" }]}>
                      Public Holiday:
                    </Text>
                    <Text style={[styles.breakdownValue, { color: "#FF9800", fontWeight: "bold" }]}>
                      Double pay
                    </Text>
                  </View>
                )}
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Total Hours:</Text>
                  <Text style={styles.breakdownValue}>
                    {formatHours(shiftCalculations[selectedShift.id].total_hours)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Paid Hours:</Text>
                  <Text style={styles.breakdownValue}>
                    {formatHours(shiftCalculations[selectedShift.id].paid_hours)}
                  </Text>
                </View>
                {shiftCalculations[selectedShift.id].break_duration > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Break Duration:</Text>
                    <Text style={styles.breakdownValue}>
                      {formatHours(shiftCalculations[selectedShift.id].break_duration)}
                    </Text>
                  </View>
                )}
                {shiftCalculations[selectedShift.id].weekday_evening_hours > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Weekday Evening Hours:</Text>
                    <Text style={styles.breakdownValue}>
                      {formatHours(shiftCalculations[selectedShift.id].weekday_evening_hours)}
                    </Text>
                  </View>
                )}
                {shiftCalculations[selectedShift.id].saturday_evening_hours > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Saturday Evening Hours:</Text>
                    <Text style={styles.breakdownValue}>
                      {formatHours(shiftCalculations[selectedShift.id].saturday_evening_hours)}
                    </Text>
                  </View>
                )}
                {shiftCalculations[selectedShift.id].sunday_hours > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Sunday Hours:</Text>
                    <Text style={styles.breakdownValue}>
                      {formatHours(shiftCalculations[selectedShift.id].sunday_hours)}
                    </Text>
                  </View>
                )}
                <View style={styles.breakdownSeparator} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Pay (all hours):</Text>
                  <Text style={styles.breakdownValue}>
                    €{shiftCalculations[selectedShift.id].base_pay.toFixed(2)}
                  </Text>
                </View>
                {shiftCalculations[selectedShift.id].weekday_evening_bonus > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Weekday Evening Bonus:</Text>
                    <Text style={styles.breakdownValue}>
                      €{shiftCalculations[selectedShift.id].weekday_evening_bonus.toFixed(2)}
                    </Text>
                  </View>
                )}
                {shiftCalculations[selectedShift.id].saturday_evening_bonus > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Saturday Evening Bonus:</Text>
                    <Text style={styles.breakdownValue}>
                      €{shiftCalculations[selectedShift.id].saturday_evening_bonus.toFixed(2)}
                    </Text>
                  </View>
                )}
                {shiftCalculations[selectedShift.id].sunday_bonus > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Sunday Bonus:</Text>
                    <Text style={styles.breakdownValue}>
                      €{shiftCalculations[selectedShift.id].sunday_bonus.toFixed(2)}
                    </Text>
                  </View>
                )}
                {shiftCalculations[selectedShift.id].holiday_bonus > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Holiday Bonus:</Text>
                    <Text style={styles.breakdownValue}>
                      €{shiftCalculations[selectedShift.id].holiday_bonus.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={[styles.breakdownRow, styles.totalRow]}>
                  <Text style={[styles.breakdownLabel, { fontWeight: "bold" }]}>Total:</Text>
                  <Text style={[styles.breakdownValue, { color: "#4CAF50", fontWeight: "bold" }]}>
                    €{shiftCalculations[selectedShift.id].total_pay.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity
              style={[styles.confirmButton, { marginTop: 20 }]}
              onPress={() => setShowBreakdownModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
