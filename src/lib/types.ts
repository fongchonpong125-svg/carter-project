export type PopulationGroup = "adults" | "children" | "teens" | "elderly";

export type FoodKey = "vegetables" | "fruits" | "meat" | "eggs";

export interface FoodRecord {
  date: string;
  time: string;
  vegetables: number;
  fruits: number;
  meat: number;
  eggs: number;
}

export interface FridgeItem {
  name: string;
  quantity: number;
  unit: string;
  added_date: string;
}

export interface AppData {
  nickname: string;
  waste_reduced: number;
  water_saved: number;
  co2_reduced: number;
  population_group: PopulationGroup | "all";
  daily_intake_records: FoodRecord[];
  fridge_inventory: FridgeItem[];
}

export interface ShoppingListItem {
  id?: string;
  name: string;
  note?: string | null;
  checked: boolean;
}

export interface ProfileState {
  id?: string;
  email?: string;
  name?: string;
  nickname: string;
  population_group: PopulationGroup | "all";
  waste_reduced: number;
  water_saved: number;
  co2_reduced: number;
}

export interface DailyRecommendationRange {
  min: number;
  max: number;
  unit: string;
}

export interface NutritionStandard {
  population_group: PopulationGroup;
  age_range: string;
  standard_source: string;
  characteristics: string;
  daily_recommendations: Record<FoodKey | "calories" | "protein" | "calcium", DailyRecommendationRange>;
}

export interface NutritionAssessmentItem {
  intake: number;
  status: "未录入" | "不足" | "超标" | "达标";
  gap: number;
  chinese_name: string;
  suggestion: string;
}
