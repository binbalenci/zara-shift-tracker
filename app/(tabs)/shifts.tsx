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

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setShifts(data || []);

      // Fetch shift calculations for all shifts
      const { data: calculations, error: calcError } = await supabase
        .from("shift_calculations")
        .select("*")
        .in("shift_id", data?.map((shift) => shift.id) || []);

      if (calcError) throw calcError;

      const calculationsMap = (calculations || []).reduce((acc, calc) => {
        acc[calc.shift_id] = calc;
        return acc;
      }, {} as Record<string, ShiftCalculation>);

      setShiftCalculations(calculationsMap);
    } catch (error) {
      console.error("Error fetching shifts:", error);
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

      // Update the shift
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
        })
        .eq("id", selectedShift.id);

      if (shiftError) throw shiftError;

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

      // Update shift calculations
      const { error: calcError } = await supabase
        .from("shift_calculations")
        .update({
          duration_hours: durationHours,
          evening_hours: eveningHours,
          weekend_hours: weekendHours,
          sunday_hours: sundayHours,
          base_pay: basePay,
          evening_extra: eveningExtra,
          weekend_extra: weekendExtra,
          sunday_extra: sundayExtra,
          total_pay: totalPay,
        })
        .eq("shift_id", selectedShift.id);

      if (calcError) throw calcError;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shift updated successfully",
      });

      setShowModifyModal(false);
      fetchShifts();
    } catch (error) {
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

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shift deleted successfully",
      });

      setShowDeleteModal(false);
      fetchShifts();
    } catch (error) {
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

  const renderShift = ({ item }: { item: Shift }) => {
    const calculation = shiftCalculations[item.id];
    return (
      <TouchableOpacity
        style={styles.shiftBox}
        onPress={() => {
          setSelectedShift(item);
          setShowBreakdownModal(true);
        }}
      >
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftTime}>{formatDate(item.date)}</Text>
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
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Pay:</Text>
                  <Text style={styles.breakdownValue}>
                    €{shiftCalculations[selectedShift.id].base_pay.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Evening Extra:</Text>
                  <Text style={styles.breakdownValue}>
                    €{shiftCalculations[selectedShift.id].evening_extra.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Weekend Extra:</Text>
                  <Text style={styles.breakdownValue}>
                    €{shiftCalculations[selectedShift.id].weekend_extra.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Sunday Extra:</Text>
                  <Text style={styles.breakdownValue}>
                    €{shiftCalculations[selectedShift.id].sunday_extra.toFixed(2)}
                  </Text>
                </View>
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
