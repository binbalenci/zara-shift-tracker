import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import { supabase } from "../utils/supabaseClient";
import { Shift, ShiftCalculation } from "../types";
import { useSalaryProfiles } from "../contexts/SalaryProfileContext";

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
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
  },
  arrowButton: {
    padding: 10,
  },
  chartContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  card: {
    marginBottom: 15,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});

interface DayCount {
  [key: string]: number;
}

interface MonthlyStats {
  totalShifts: number;
  dayBreakdown: DayCount;
  baseEarnings: number;
  eveningExtra: number;
  weekendExtra: number;
  sundayExtra: number;
  totalEarnings: number;
  totalHours: number;
}

interface ChartData {
  value: number;
  label: string;
  frontColor: string;
  topLabelComponent?: () => JSX.Element;
}

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalShifts: 0,
    dayBreakdown: {},
    baseEarnings: 0,
    eveningExtra: 0,
    weekendExtra: 0,
    sundayExtra: 0,
    totalEarnings: 0,
    totalHours: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMonthlyStats(selectedMonth);
      await fetchChartData();
    } finally {
      setRefreshing(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyStats = async (date: Date) => {
    try {
      // Ensure we have a valid date
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date provided to fetchMonthlyStats:", date);
        return;
      }

      // Get the first and last day of the selected month
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const { data: shifts, error } = await supabase
        .from("shifts")
        .select(
          `
          id,
          date,
          start_time,
          end_time,
          shift_calculations (
            id,
            shift_id,
            base_pay,
            evening_extra,
            weekend_extra,
            sunday_extra,
            total_pay,
            duration_hours
          )
        `
        )
        .gte("date", firstDay.toISOString().split("T")[0])
        .lte("date", lastDay.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;

      // Initialize day breakdown
      const dayBreakdown: DayCount = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      };

      let baseEarnings = 0;
      let eveningExtra = 0;
      let weekendExtra = 0;
      let sundayExtra = 0;
      let totalHours = 0;

      shifts?.forEach((shift) => {
        // Count shifts per day
        const dayName = new Date(shift.date).toLocaleDateString("en-US", { weekday: "long" });
        dayBreakdown[dayName]++;

        // Sum up earnings from shift_calculations
        if (shift.shift_calculations && shift.shift_calculations.length > 0) {
          const calc = shift.shift_calculations[0];
          baseEarnings += calc.base_pay || 0;
          eveningExtra += calc.evening_extra || 0;
          weekendExtra += calc.weekend_extra || 0;
          sundayExtra += calc.sunday_extra || 0;
          totalHours += calc.duration_hours || 0;
        }
      });

      // Calculate total earnings
      const totalEarnings = baseEarnings + eveningExtra + weekendExtra + sundayExtra;

      setMonthlyStats({
        totalShifts: shifts?.length || 0,
        dayBreakdown,
        baseEarnings,
        eveningExtra,
        weekendExtra,
        sundayExtra,
        totalEarnings,
        totalHours,
      });
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const handleBarPress = (item: ChartData) => {
    try {
      // Parse the month and create a new date
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthIndex = monthNames.indexOf(item.label);
      if (monthIndex === -1) {
        console.error("Invalid month label:", item.label);
        return;
      }

      const newDate = new Date(selectedYear, monthIndex, 1);
      if (!(newDate instanceof Date) || isNaN(newDate.getTime())) {
        console.error("Invalid date created:", newDate);
        return;
      }

      setSelectedMonth(newDate);
      setShowBreakdown(true);
      fetchMonthlyStats(newDate);
    } catch (error) {
      console.error("Error handling bar press:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const monthlyTotals: { [key: string]: number } = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Initialize all months with 0
      monthNames.forEach((month) => {
        monthlyTotals[month] = 0;
      });

      // Get first and last day of the year
      const firstDay = new Date(selectedYear, 0, 1);
      const lastDay = new Date(selectedYear, 11, 31);

      const { data: calculations, error } = await supabase
        .from("shifts")
        .select(
          `
          date,
          shift_calculations (
            total_pay
          )
        `
        )
        .gte("date", firstDay.toISOString().split("T")[0])
        .lte("date", lastDay.toISOString().split("T")[0]);

      if (error) throw error;

      // Process the data
      calculations?.forEach((shift) => {
        if (shift.shift_calculations && shift.shift_calculations.length > 0) {
          const date = new Date(shift.date);
          const monthName = monthNames[date.getMonth()];
          monthlyTotals[monthName] += shift.shift_calculations[0].total_pay || 0;
        }
      });

      // Convert to chart data format
      const data: ChartData[] = monthNames.map((month) => ({
        value: Math.round(monthlyTotals[month] * 100) / 100,
        label: month,
        frontColor: month === monthNames[selectedMonth.getMonth()] ? "#64B5F6" : "#2196F3",
      }));

      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchMonthlyStats(selectedMonth);
    fetchChartData();
  }, [selectedMonth, selectedYear]);

  const navigateYear = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Statistics</Text>

      {/* Year Navigator */}
      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={() => navigateYear("prev")} style={styles.arrowButton}>
          <MaterialIcons name="chevron-left" size={30} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{selectedYear}</Text>
        <TouchableOpacity onPress={() => navigateYear("next")} style={styles.arrowButton}>
          <MaterialIcons name="chevron-right" size={30} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={Dimensions.get("window").width - 80}
          height={220}
          spacing={15}
          initialSpacing={8}
          barWidth={22}
          isAnimated
          animationDuration={1000}
          showXAxisIndices
          xAxisThickness={1}
          xAxisColor="#BDBDBD"
          yAxisThickness={1}
          yAxisColor="#BDBDBD"
          yAxisTextStyle={{ color: "#757575" }}
          hideRules
          showVerticalLines
          verticalLinesColor="rgba(0,0,0,0.05)"
          verticalLinesSpacing={30}
          noOfVerticalLines={20}
          maxValue={1500}
          labelWidth={35}
          xAxisLabelTextStyle={{ color: "#757575", fontSize: 11 }}
          renderTooltip={(item: ChartData) => (
            <View
              style={{
                backgroundColor: "white",
                padding: 8,
                borderRadius: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Text style={{ color: "#333", fontWeight: "bold" }}>€{item.value.toFixed(2)}</Text>
            </View>
          )}
          onPress={(item: ChartData) => {
            handleBarPress(item);
          }}
        />
      </View>

      {showBreakdown && (
        <>
          {/* Overview Card */}
          <Card style={[styles.card, { backgroundColor: "white" }]} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: "#333" }]}>
                Overview -{" "}
                {selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
              <View style={styles.statRow}>
                <Text style={[styles.label, { color: "#666" }]}>Total Shifts</Text>
                <Text style={[styles.value, { color: "#333" }]}>{monthlyStats.totalShifts}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.label, { color: "#666" }]}>Total Hours</Text>
                <Text style={[styles.value, { color: "#333" }]}>
                  {monthlyStats.totalHours.toFixed(1)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Day Breakdown Card */}
          <Card style={[styles.card, { backgroundColor: "white" }]} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: "#333" }]}>Shifts by Day</Text>
              {Object.entries(monthlyStats.dayBreakdown).map(([day, count]) => (
                <View key={day} style={styles.statRow}>
                  <Text style={[styles.label, { color: "#666" }]}>{day}</Text>
                  <Text style={[styles.value, { color: "#333" }]}>{count}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Earnings Breakdown Card */}
          <Card style={[styles.card, { backgroundColor: "white" }]} mode="elevated">
            <Card.Content>
              <Text style={[styles.cardTitle, { color: "#333" }]}>Earnings Breakdown</Text>
              <View style={styles.statRow}>
                <Text style={[styles.label, { color: "#666" }]}>Base Earnings</Text>
                <Text style={[styles.value, { color: "#333" }]}>
                  €{monthlyStats.baseEarnings.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.label, { color: "#666" }]}>Evening Extra (after 6 PM)</Text>
                <Text style={[styles.value, { color: "#333" }]}>
                  €{monthlyStats.eveningExtra.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.label, { color: "#666" }]}>
                  Weekend Extra (Sat after 1 PM)
                </Text>
                <Text style={[styles.value, { color: "#333" }]}>
                  €{monthlyStats.weekendExtra.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.label, { color: "#666" }]}>Sunday Extra</Text>
                <Text style={[styles.value, { color: "#333" }]}>
                  €{monthlyStats.sundayExtra.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: "#333" }]}>Total Earnings</Text>
                <Text style={styles.totalValue}>€{monthlyStats.totalEarnings.toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}
