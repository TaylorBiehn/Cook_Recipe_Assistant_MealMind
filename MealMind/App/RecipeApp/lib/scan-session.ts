/** In-memory handoff from scan review → home search field when user returns to tabs. */
let pendingIngredientNames: string[] = [];

export function setPendingScanIngredients(names: string[]) {
  pendingIngredientNames = names.filter((n) => n.trim().length > 0);
}

export function takePendingScanIngredients(): string[] {
  const out = pendingIngredientNames;
  pendingIngredientNames = [];
  return out;
}
