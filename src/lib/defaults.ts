import type { AppData, NutritionStandard, ProfileState, ShoppingListItem } from "@/lib/types";

export const defaultAppData: AppData = {
  nickname: "FoodGuardian 用户",
  waste_reduced: 510,
  water_saved: 255,
  co2_reduced: 1.53,
  population_group: "adults",
  daily_intake_records: [
    {
      date: "2026-04-03",
      time: "17:02",
      vegetables: 0,
      fruits: 150,
      meat: 150,
      eggs: 50,
    },
    {
      date: "2026-04-03",
      time: "17:03",
      vegetables: 400,
      fruits: 0,
      meat: 300,
      eggs: 0,
    },
    {
      date: "2026-04-03",
      time: "17:04",
      vegetables: 400,
      fruits: 0,
      meat: 150,
      eggs: 0,
    },
  ],
  fridge_inventory: [
    { name: "黄瓜", quantity: 200, unit: "g", added_date: "2026-04-03" },
    { name: "蘑菇", quantity: 278, unit: "g", added_date: "2026-04-03" },
  ],
};

export const defaultProfile: ProfileState = {
  nickname: "FoodGuardian 用户",
  population_group: "adults",
  waste_reduced: 510,
  water_saved: 255,
  co2_reduced: 1.53,
};

export const defaultShoppingItems: ShoppingListItem[] = [
  { name: "酸奶", checked: false },
  { name: "蓝莓", checked: false },
  { name: "西兰花", checked: false },
];

export const nutritionStandards: NutritionStandard[] = [
  {
    population_group: "adults",
    age_range: "18-60 岁",
    standard_source: "WHO_2025",
    characteristics: "成年人需要均衡营养，以维持体能、代谢和日常恢复。",
    daily_recommendations: {
      vegetables: { min: 400, max: 800, unit: "g" },
      fruits: { min: 200, max: 400, unit: "g" },
      meat: { min: 50, max: 150, unit: "g" },
      eggs: { min: 30, max: 70, unit: "g" },
      calories: { min: 2000, max: 2500, unit: "kcal" },
      protein: { min: 50, max: 70, unit: "g" },
      calcium: { min: 1000, max: 1200, unit: "mg" },
    },
  },
  {
    population_group: "children",
    age_range: "6-12 岁",
    standard_source: "WHO_2025",
    characteristics: "儿童处于成长关键期，需要充足蛋白质、钙和维生素支持发育。",
    daily_recommendations: {
      vegetables: { min: 300, max: 500, unit: "g" },
      fruits: { min: 150, max: 300, unit: "g" },
      meat: { min: 30, max: 100, unit: "g" },
      eggs: { min: 25, max: 75, unit: "g" },
      calories: { min: 1600, max: 2400, unit: "kcal" },
      protein: { min: 30, max: 50, unit: "g" },
      calcium: { min: 800, max: 1000, unit: "mg" },
    },
  },
  {
    population_group: "teens",
    age_range: "13-17 岁",
    standard_source: "WHO_2025",
    characteristics: "青少年生长快速，饮食需要兼顾能量、蛋白和钙的持续供给。",
    daily_recommendations: {
      vegetables: { min: 400, max: 600, unit: "g" },
      fruits: { min: 200, max: 350, unit: "g" },
      meat: { min: 80, max: 150, unit: "g" },
      eggs: { min: 50, max: 100, unit: "g" },
      calories: { min: 2200, max: 2800, unit: "kcal" },
      protein: { min: 60, max: 80, unit: "g" },
      calcium: { min: 1200, max: 1500, unit: "mg" },
    },
  },
  {
    population_group: "elderly",
    age_range: "60 岁以上",
    standard_source: "WHO_2025",
    characteristics: "老年人更需要易消化、高钙、高蛋白且不过量的日常饮食结构。",
    daily_recommendations: {
      vegetables: { min: 300, max: 500, unit: "g" },
      fruits: { min: 150, max: 300, unit: "g" },
      meat: { min: 30, max: 100, unit: "g" },
      eggs: { min: 25, max: 75, unit: "g" },
      calories: { min: 1800, max: 2200, unit: "kcal" },
      protein: { min: 45, max: 65, unit: "g" },
      calcium: { min: 1000, max: 1200, unit: "mg" },
    },
  },
];
