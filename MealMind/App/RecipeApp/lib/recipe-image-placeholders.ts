/**
 * Overhead / flat-lay food only — no chefs, hands, kitchens with people, or grocery aisles.
 * When Unsplash is off, these avoid implying a specific wrong plate but stay “food only”.
 */
export const GENERIC_MEAL_IMAGE_PLACEHOLDERS: readonly string[] = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-89a18c6ae8d6?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1466637574441-349b2a45cc80?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85&auto=format&fit=crop',
];

/**
 * Last-resort URLs if remote heroes fail — still food-only (no people / market aisles).
 */
export const RELIABLE_GENERIC_FOOD_BACKDROPS: readonly string[] = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-89a18c6ae8d6?w=1200&q=85&auto=format&fit=crop',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/1200px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
];
