import { nutritionStandards } from "@/lib/defaults";
import type {
  FoodKey,
  NutritionAssessmentItem,
  NutritionStandard,
  PopulationGroup,
} from "@/lib/types";

const intakeNames: Record<FoodKey, string> = {
  vegetables: "蔬菜",
  fruits: "水果",
  meat: "肉类",
  eggs: "蛋类",
};

export function getNutritionStandard(populationGroup: PopulationGroup): NutritionStandard | undefined {
  return nutritionStandards.find((item) => item.population_group === populationGroup);
}

export function getLatestIntake(records: Array<Record<FoodKey | "date" | "time", number | string>>) {
  const latest = records.at(-1);
  return {
    vegetables: Number(latest?.vegetables ?? 0),
    fruits: Number(latest?.fruits ?? 0),
    meat: Number(latest?.meat ?? 0),
    eggs: Number(latest?.eggs ?? 0),
  };
}

export function nutritionAssessment(
  userIntake: Record<FoodKey, number>,
  populationGroup: PopulationGroup,
): Record<FoodKey, NutritionAssessmentItem> {
  const standard = getNutritionStandard(populationGroup);

  if (!standard) {
    throw new Error(`未找到人群 ${populationGroup} 的营养标准`);
  }

  const foodTypes: FoodKey[] = ["vegetables", "fruits", "meat", "eggs"];
  const recordedFoods = foodTypes.filter((foodType) => Number(userIntake[foodType] ?? 0) > 0);
  const isPartialEntry = recordedFoods.length < foodTypes.length;

  return foodTypes.reduce(
    (acc, foodType) => {
      const intake = Number(userIntake[foodType] ?? 0);
      const recommendation = standard.daily_recommendations[foodType];

      if (isPartialEntry && intake === 0) {
        acc[foodType] = {
          intake,
          status: "未录入",
          gap: 0,
          chinese_name: intakeNames[foodType],
          suggestion: `暂未录入${intakeNames[foodType]}，如已摄入请补充录入。`,
        };
        return acc;
      }

      if (intake < recommendation.min) {
        const gap = recommendation.min - intake;
        acc[foodType] = {
          intake,
          status: "不足",
          gap,
          chinese_name: intakeNames[foodType],
          suggestion: isPartialEntry
            ? `${intakeNames[foodType]}摄入较少（${intake}g），建议适当增加。`
            : `建议增加${intakeNames[foodType]}摄入，当前 ${intake}g，距离推荐最小值还差 ${gap}g。`,
        };
        return acc;
      }

      if (intake > recommendation.max) {
        const gap = intake - recommendation.max;
        acc[foodType] = {
          intake,
          status: "超标",
          gap,
          chinese_name: intakeNames[foodType],
          suggestion: isPartialEntry
            ? `${intakeNames[foodType]}摄入略多（${intake}g），建议后续餐次适当控制。`
            : `建议减少${intakeNames[foodType]}摄入，当前 ${intake}g，已超过推荐最大值 ${gap}g。`,
        };
        return acc;
      }

      acc[foodType] = {
        intake,
        status: "达标",
        gap: 0,
        chinese_name: intakeNames[foodType],
        suggestion: `${intakeNames[foodType]}摄入充足（${intake}g），请继续保持。`,
      };
      return acc;
    },
    {} as Record<FoodKey, NutritionAssessmentItem>,
  );
}

export function buildAssessmentSummary(
  assessment: Record<FoodKey, NutritionAssessmentItem>,
) {
  const insufficient = Object.values(assessment).filter((item) => item.status === "不足");
  const excessive = Object.values(assessment).filter((item) => item.status === "超标");

  return {
    insufficient,
    excessive,
    summary:
      insufficient.length === 0 && excessive.length === 0
        ? "今日摄入整体平衡，可以围绕现有食材做轻调整。"
        : `当前重点关注 ${[
            insufficient.length ? `补足 ${insufficient.map((item) => item.chinese_name).join("、")}` : "",
            excessive.length ? `控制 ${excessive.map((item) => item.chinese_name).join("、")}` : "",
          ]
            .filter(Boolean)
            .join("，")}。`,
  };
}
