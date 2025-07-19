import { apiRequest } from "./queryClient";
import { UserData } from "@shared/schema";

export async function analyzeInvestmentData(userData: UserData) {
  const response = await apiRequest("POST", "/api/analyze", userData);
  return response.json();
}
