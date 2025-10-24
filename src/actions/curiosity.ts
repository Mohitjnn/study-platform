"use server";

// Assuming client.ts is in 'lib' folder, adjust path if needed
import { fetchFromAPI } from "@/lib/api/client";

// --- Type Definitions ---
// Based on the API response you provided

/**
 * Represents a single week's curiosity data from the API.
 */
interface WeekData {
  week_start: string;
  week_end: string;
  sessions: number;
  curiosity_pct: number;
}

/**
 * Represents the full API response structure.
 */
interface ApiCuriosityResponse {
  weeks: WeekData[];
}

// --- Chart Data Type ---
// This is the format required by your CuriosityChart.tsx component

/**
 * Represents the data structure required for the Recharts AreaChart.
 */
export interface CuriosityChartData {
  name: string; // e.g., "01 week"
  uv: number;   // Maps to 'curiosity_pct'
}

// --- Server Action ---

/**
 * Fetches the curiosity index data from the API and formats it for the chart.
 * @param weeks The number of weeks to fetch data for.
 * @returns A promise that resolves to an array of formatted chart data.
 */
export async function getCuriosityIndex(
  weeks: number
): Promise<CuriosityChartData[]> {
  // Construct the API endpoint URL
  const url = `topics/curiosity-index?weeks=${weeks}`;

  try {
    // Call the fetchFromAPI function from client.ts
    // We set requiresAuth: true as per your curl command's Bearer token
    const response = await fetchFromAPI<ApiCuriosityResponse>(url, {
      requiresAuth: true,
    });

    // Check if the response has the expected 'weeks' array
    if (!response || !Array.isArray(response.weeks)) {
      console.error("Invalid API response structure:", response);
      return [];
    }

    // Map the API response to the format required by CuriosityChart.tsx
    const formattedData: CuriosityChartData[] = response.weeks.map(
      (week, index) => {
        // Format the week name (e.g., "01 week", "02 week")
        const weekName = `${String(index + 1).padStart(2, "0")} week`;

        return {
          name: weekName,
          uv: week.curiosity_pct, // Mapping curiosity_pct to the 'uv' key
        };
      }
    );

    return formattedData;
  } catch (error) {
    console.error("Failed to fetch curiosity index:", error);
    // Return an empty array or re-throw the error, depending on how
    // you want to handle errors in your component
    return [];
  }
}
