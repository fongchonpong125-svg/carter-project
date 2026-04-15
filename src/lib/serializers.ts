import type { User, IntakeRecord, FridgeItem, ShoppingItem, ChatMessage } from "@prisma/client";

export function serializeAppState(input: {
  user: User;
  intakeRecords: IntakeRecord[];
  fridgeItems: FridgeItem[];
  shoppingItems: ShoppingItem[];
  chatMessages: ChatMessage[];
}) {
  return {
    profile: {
      id: input.user.id,
      email: input.user.email,
      name: input.user.name,
      nickname: input.user.nickname || input.user.name,
      population_group: input.user.population,
      waste_reduced: input.user.wasteReduced,
      water_saved: input.user.waterSaved,
      co2_reduced: input.user.co2Reduced,
    },
    daily_intake_records: input.intakeRecords.map((item) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      vegetables: item.vegetables,
      fruits: item.fruits,
      meat: item.meat,
      eggs: item.eggs,
    })),
    fridge_inventory: input.fridgeItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      added_date: item.addedDate,
    })),
    shopping_items: input.shoppingItems.map((item) => ({
      id: item.id,
      name: item.name,
      note: item.note,
      checked: item.checked,
    })),
    chat_messages: input.chatMessages.map((item) => ({
      id: item.id,
      role: item.role,
      content: item.content,
    })),
  };
}
