import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  RefreshControl,
  ScrollView,
  Image,
} from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { supabase } from "../utils/supabaseClient";
import { SalaryProfile } from "../types";
import { useSalaryProfiles } from "../contexts/SalaryProfileContext";
import { useFonts, DancingScript_400Regular } from "@expo-google-fonts/dancing-script";

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
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileBox: {
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
  profileInfo: {
    flex: 1,
  },
  profileRate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  profileDate: {
    fontSize: 14,
    color: "#666",
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
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
  currency: {
    position: "absolute",
    right: 10,
    top: 10,
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    position: "relative",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  footerImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  loveText: {
    fontSize: 24,
    color: "#FF69B4",
    fontFamily: "DancingScript_400Regular",
    marginLeft: 10,
    flex: 1,
  },
});

export default function Settings() {
  const { profiles, loading, error, refreshProfiles } = useSalaryProfiles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SalaryProfile | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [baseRate, setBaseRate] = useState("");
  const [eveningExtra, setEveningExtra] = useState("");
  const [weekendExtra, setWeekendExtra] = useState("");
  const [sundayExtra, setSundayExtra] = useState("");

  const [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfiles();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfiles]);

  const handleAddProfile = async () => {
    if (!baseRate || !eveningExtra || !weekendExtra || !sundayExtra) {
      Toast.show({
        type: "warning",
        text1: "Warning",
        text2: "Please fill in all fields",
      });
      return;
    }

    try {
      const { error } = await supabase.from("salary_profiles").insert([
        {
          name: `Rate from ${startDate.toLocaleDateString()}`,
          base_hourly_rate: parseFloat(baseRate),
          evening_extra: parseFloat(eveningExtra),
          evening_start_time: "18:00",
          weekend_extra_start_time: "13:00",
          start_date: startDate.toLocaleDateString("en-CA"),
          sunday_extra: parseFloat(sundayExtra),
        },
      ]);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Salary profile added successfully",
      });

      setShowAddModal(false);
      resetForm();
      refreshProfiles();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add salary profile",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedProfile || !baseRate || !eveningExtra || !weekendExtra || !sundayExtra) {
      return;
    }

    try {
      const { error } = await supabase
        .from("salary_profiles")
        .update({
          base_hourly_rate: parseFloat(baseRate),
          evening_extra: parseFloat(eveningExtra),
          weekend_extra: parseFloat(weekendExtra),
          sunday_extra: parseFloat(sundayExtra),
          start_date: startDate.toISOString().split("T")[0],
        })
        .eq("id", selectedProfile.id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Salary profile updated successfully",
      });

      setShowEditModal(false);
      resetForm();
      refreshProfiles();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update salary profile",
      });
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;

    try {
      const { error } = await supabase
        .from("salary_profiles")
        .delete()
        .eq("id", selectedProfile.id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Salary profile deleted successfully",
      });

      setShowDeleteModal(false);
      setSelectedProfile(null);
      refreshProfiles();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete salary profile",
      });
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setBaseRate("");
    setEveningExtra("");
    setWeekendExtra("");
    setSundayExtra("");
    setSelectedProfile(null);
  };

  const handleEditProfile = (profile: SalaryProfile) => {
    if (!profile) return;

    setSelectedProfile(profile);
    setStartDate(profile.start_date ? new Date(profile.start_date) : new Date());
    setBaseRate(profile.base_hourly_rate?.toString() || "");
    setEveningExtra(profile.evening_extra?.toString() || "");
    setWeekendExtra(profile.weekend_extra?.toString() || "");
    setSundayExtra(profile.sunday_extra?.toString() || "");
    setShowEditModal(true);
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Salary Profiles</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setShowAddModal(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Salary Profile</Text>
      </TouchableOpacity>

      {profiles.map((item) => (
        <View key={item.id} style={styles.profileBox}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileRate}>
              Base Rate: €{item.base_hourly_rate.toFixed(2)}/hour
            </Text>
            <Text style={styles.profileDate}>
              Start Date: {new Date(item.start_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.modifyButton} onPress={() => handleEditProfile(item)}>
              <Text style={styles.buttonText}>Modify</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setSelectedProfile(item);
                setShowDeleteModal(true);
              }}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Image
          source={require("../../assets/images/suvi-daddy-button.png")}
          style={styles.footerImage}
        />
        <Text style={styles.loveText}>Love you mama ❤️</Text>
      </View>

      {/* Add Profile Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
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
            <Text style={styles.modalTitle}>Add Salary Profile</Text>

            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Base Hourly Rate</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={baseRate}
                onChangeText={setBaseRate}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <Text style={styles.inputLabel}>Evening Extra (after 18:00)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={eveningExtra}
                onChangeText={setEveningExtra}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <Text style={styles.inputLabel}>Weekend Extra (after 13:00)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weekendExtra}
                onChangeText={setWeekendExtra}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <Text style={styles.inputLabel}>Sunday Extra</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sundayExtra}
                onChangeText={setSundayExtra}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddProfile}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
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
            <Text style={styles.modalTitle}>Edit Salary Profile</Text>

            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Base Hourly Rate</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={baseRate}
                onChangeText={setBaseRate}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <Text style={styles.inputLabel}>Evening Extra (after 18:00)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={eveningExtra}
                onChangeText={setEveningExtra}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <Text style={styles.inputLabel}>Weekend Extra (after 13:00)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weekendExtra}
                onChangeText={setWeekendExtra}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <Text style={styles.inputLabel}>Sunday Extra</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sundayExtra}
                onChangeText={setSundayExtra}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Update</Text>
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
            <Text style={styles.modalTitle}>Delete Salary Profile</Text>
            <Text style={{ marginBottom: 20 }}>
              Are you sure you want to delete this salary profile?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedProfile(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal with Home styling */}
      <DatePickerModal
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={startDate}
        locale="en"
        presentationStyle="pageSheet"
        onConfirm={(params) => {
          const { date } = params;
          if (date) {
            setStartDate(date);
          }
          setShowDatePicker(false);
        }}
      />
    </ScrollView>
  );
}
