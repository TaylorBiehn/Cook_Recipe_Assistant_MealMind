/** Static recipe content for results + detail shells (design HTML sources). */

export type MockIngredient = { name: string; amount: string };

export type MockStep = { n: string; title: string; body: string; active?: boolean };

export type MockRecipe = {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
  videoThumb: string;
  timeLabel: string;
  difficultyLabel: string;
  servingsLabel: string;
  kcalLabel: string;
  tags: { label: string; variant: 'secondary' | 'tertiary' }[];
  ingredients: MockIngredient[];
  familyTip: string;
  steps: MockStep[];
  nutrition: { label: string; value: string }[];
  /** AI-only: keywords used to pick a food photo; omitted after resolve or for static mocks. */
  imageQuery?: string;
  /** Optional direct tutorial link (https). If unset, detail screen opens YouTube search for the title. */
  tutorialVideoUrl?: string;
  /** AI: phrase optimized for finding a matching cooking video (title + main foods). */
  tutorialSearchQuery?: string;
};

export const RESULTS_FEATURED = {
  id: 'penne-sun-dried',
  title: 'Sun-Dried Tomato & Basil Penne',
  description:
    'A crowd-pleasing classic that uses pantry staples to create a rich, creamy sauce the whole family will love.',
  time: '25 mins',
  difficulty: 'Easy',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCyXQRXhqBaHXM-DtDwegH2-GQ0B45iQBfKjDBDQOnwkna8WcspC_ktsdTIyztRS55Jd4G_IJtZUdTuTAlAp0SlqgcIKAbGCasB_-MBqM21Vr96zCdf-NJ9rd3c4W_WpujJJRsq9H_1Njx-80w1hviienhp-v0S_AHIOpjWrK8RkprNWj6KQCZzVTlZWQ1BTNAfZVaKbF5cYrxHSNXc1_Armwl8u6kpBzPFrgyaUL6nrJJGRlyMmP-64gN4F4BP5QZzhcm2tsMPB1c',
} as const;

export const RESULTS_SECONDARY = [
  {
    id: 'lemon-salmon',
    title: 'Lemon Herb Salmon',
    blurb: 'A fresh, light choice for a nutritious dinner. Ready in under 20 minutes with minimal cleanup.',
    time: '20 mins',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQW72KSP0I-3EbGNI6kBmu3zzIT6HwNAuCc2ZVZzfzIiboHJEr9AUhqsetLGTKRQFNc9LsEdDmwMGRRZrKjVnlzTy_Q5cqDIN8w010KJqOujIX9qx5633CtwIERVeLlRVg4T2GzY83WeQlKHtAmhBRs3nnTywE50GYVvJY12FnZlXSSLeZod-_Pv9gfVkajyp1LePgxAbcYZ3f3ia9754BmuAAOYepE0lAAHCDCwz1AgHOTGgSxHGGsIHOplLUcoM8veEJ7TVrVHg',
  },
  {
    id: 'chickpea-bowl',
    title: 'Zesty Chickpea Power Bowl',
    blurb:
      'No-cook excellence. A protein-packed, vibrant bowl that brings sunshine to the dinner table.',
    time: '15 mins',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQXUU_Z-SxY8SiaSoPWJWGBdccbOKgtwYnJMZqblLmN9lb9gB8g-S-e_Y0qtF4ut2VdNIAI7jcTagHSFoHzxA16MHKdg9U0q5ThntycWo95qKyUyCvX3aUi3fuSVqWTjV2oybGeqebXbmqaUSnQ0NPKaxm9Rt7ouyd_hvE76hB5sInq92-tqtO9rfGw23nLI19FBfcjJi89EaT9PcLqjJDcNokcPcy5KTsurk0Zjhm1eSrwqe01U59wPobP3MidhGnuXtDLzbRaLM',
  },
] as const;

const TOMATO_SCRAMBLE: MockRecipe = {
  id: 'tomato-scramble',
  title: 'Healthy Tomato Egg Scramble',
  subtitle: 'Master the perfect creamy scramble (2:45)',
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA0atyc0LdJu3erXTpalmwkddFnEh8ZEhyJJiAFnum1-NgftGMtCE2RorgmahnmvMz75BBpXyCX_OdUfCA0Bn0XVaLBtlaY_SONunITNVQYRZ_kN2Ihtz5K0ad5eEQNBZheUoeKk5a5rLePXjUFeKhUrS3jLaNToVn9haiiNakHGwSAwEr3xmGMzWaTmPv8IJu3taMTIdnSr8KwCFDdIgfUjE6SjKaTQf9C2sz8DeiaRxOknRlmGug07fSQHa0-XyUOtm0qXK5_eTg',
  /** Reuses hero art when no separate tutorial thumbnail is available. */
  videoThumb:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA0atyc0LdJu3erXTpalmwkddFnEh8ZEhyJJiAFnum1-NgftGMtCE2RorgmahnmvMz75BBpXyCX_OdUfCA0Bn0XVaLBtlaY_SONunITNVQYRZ_kN2Ihtz5K0ad5eEQNBZheUoeKk5a5rLePXjUFeKhUrS3jLaNToVn9haiiNakHGwSAwEr3xmGMzWaTmPv8IJu3taMTIdnSr8KwCFDdIgfUjE6SjKaTQf9C2sz8DeiaRxOknRlmGug07fSQHa0-XyUOtm0qXK5_eTg',
  timeLabel: '15 mins',
  difficultyLabel: '2 servings',
  servingsLabel: '2 servings',
  kcalLabel: '320 kcal',
  tags: [
    { label: 'Quick Meal', variant: 'secondary' },
    { label: 'High Protein', variant: 'tertiary' },
  ],
  ingredients: [
    { name: 'Large eggs', amount: '4 units' },
    { name: 'Ripe tomatoes', amount: '2 medium' },
    { name: 'Green onions', amount: '2 stalks' },
    { name: 'Olive oil', amount: '1 tbsp' },
    { name: 'Salt & Pepper', amount: 'To taste' },
  ],
  familyTip:
    'Add a teaspoon of honey while sautéing tomatoes to balance the acidity for kids!',
  steps: [
    {
      n: '01',
      title: 'Prep the Base',
      body: 'Whisk the eggs in a small bowl with a pinch of salt. Dice the tomatoes into 1-inch chunks and thinly slice the green onions.',
      active: true,
    },
    {
      n: '02',
      title: 'Sauté Tomatoes',
      body: 'Heat olive oil in a non-stick skillet over medium-high heat. Add tomatoes and sauté for 3-4 minutes until they soften and release their juices.',
    },
    {
      n: '03',
      title: 'Scramble',
      body: 'Pour in the whisked eggs. Let them sit for 10 seconds, then gently fold them into the tomatoes until just set but still creamy.',
    },
    {
      n: '04',
      title: 'Final Garnish',
      body: 'Remove from heat. Top with sliced green onions and extra black pepper. Serve immediately with warm sourdough toast.',
    },
  ],
  nutrition: [
    { label: 'Protein', value: '12g' },
    { label: 'Carbs', value: '8g' },
    { label: 'Fats', value: '18g' },
    { label: 'Fiber', value: '2g' },
  ],
};

const PENNE_RECIPE: MockRecipe = {
  ...TOMATO_SCRAMBLE,
  id: RESULTS_FEATURED.id,
  title: RESULTS_FEATURED.title,
  heroImage: RESULTS_FEATURED.image,
  tags: [
    { label: 'Quick Meal', variant: 'secondary' },
    { label: 'Family dinner', variant: 'tertiary' },
  ],
  timeLabel: RESULTS_FEATURED.time,
  difficultyLabel: RESULTS_FEATURED.difficulty,
  servingsLabel: 'Serves 4',
  kcalLabel: '480 kcal',
};

const SALMON_RECIPE: MockRecipe = {
  ...TOMATO_SCRAMBLE,
  id: RESULTS_SECONDARY[0].id,
  title: RESULTS_SECONDARY[0].title,
  heroImage: RESULTS_SECONDARY[0].image,
  timeLabel: RESULTS_SECONDARY[0].time,
};

const CHICKPEA_RECIPE: MockRecipe = {
  ...TOMATO_SCRAMBLE,
  id: RESULTS_SECONDARY[1].id,
  title: RESULTS_SECONDARY[1].title,
  heroImage: RESULTS_SECONDARY[1].image,
  timeLabel: RESULTS_SECONDARY[1].time,
};

const RECIPES: Record<string, MockRecipe> = {
  [TOMATO_SCRAMBLE.id]: TOMATO_SCRAMBLE,
  [PENNE_RECIPE.id]: PENNE_RECIPE,
  [SALMON_RECIPE.id]: SALMON_RECIPE,
  [CHICKPEA_RECIPE.id]: CHICKPEA_RECIPE,
};

export function getMockRecipe(id: string | undefined): MockRecipe {
  if (id == null || id === '') return TOMATO_SCRAMBLE;
  const key = Array.isArray(id) ? id[0] : id;
  return RECIPES[key] ?? TOMATO_SCRAMBLE;
}

export type FavoriteCard = {
  id: string;
  title: string;
  blurb?: string;
  image: string;
  featured?: boolean;
  badges: { label: string; variant: 'secondary' | 'tertiary' | 'primary' }[];
  meta?: { icon: 'schedule' | 'local-fire-department' | 'group'; text: string }[];
};

export const FAVORITE_CARDS: FavoriteCard[] = [
  {
    id: 'harvest-quinoa',
    featured: true,
    title: 'Harvest Quinoa Bowl with Miso Dressing',
    blurb:
      'A nutritious, colorful bowl packed with seasonal vegetables and a creamy umami dressing that the kids will actually love.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARJ93sHwYt5yEXdlDISjupfDinSIbuRMHA32tDfboyASbE893eOY5hhMm-TQFYWzo96JHL2EC3UTtly9_WtxOAp16_qaSs5rO6pjEO-jFrRS37N3EpGJLZULmVwZv0edQ0CjqqnPSk78LNVKVbETo8wt-zuxqb85CqRx1g4ydLX1SgvJtsbzCcpRsQJJBnEsCGbtaAnbPT4UgXwpRWBgTsojFl3OPcgdSkxFxncEYNXcffi8oNGU7l_dbSz163ns15UzQE7vebvJ0',
    badges: [
      { label: 'Most Cooked', variant: 'secondary' },
      { label: '25 Mins', variant: 'tertiary' },
    ],
  },
  {
    id: 'garden-pizza',
    title: 'Crispy Thin Crust Garden Pizza',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAAfhppDhaC1KHn2avEen4rC9tVrQqhPEb4wguHZVthECEZ7w-fGjrA4fajB2vEpOdSDWfw6rkJHa2PbmTSL0CWVAF2JuUxDLUAOmZnVTwKEL2AILB8JG_jL8rZIWU13hx_D8BuNuiwF_qey2pt-0yBlHO78dW3SxOu4yE_xphbAoF-QoWHGdMifU4rzpy_7Q62BZq8dNKWzMzygDQy8lX17Rai7lJWYn8_t0WFYn7ef7sCOjb3dncJyOHPafyjhLXGINwAh8tNfC8',
    badges: [{ label: 'Vegetarian', variant: 'primary' }],
    meta: [
      { icon: 'schedule', text: '15m' },
      { icon: 'local-fire-department', text: '320 kcal' },
    ],
  },
  {
    id: 'pesto-penne',
    title: 'Creamy Pesto & Sundried Tomato Penne',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAN6-e2yHWHTqcbnhf7qh-lT6vpoUyydZK2KXsdpUZYpfEmUbVTi6C_AtnDO1JktbbQhnaEMG7wW1dvMLPM7UAGqQtZo-I0szScwo_BLJfbwu9oEOoW-QdkowA54Ex_Kb3iE2yMdHYAdjZgQDRpK0rAaXeaZdU4InrRlUe3eP7i9rfAeQH7PRvltgwb4DpER7SvlbmQQuJvMf6TxJNyEkI7e5WWTS3gZcceRPllu__0tf7pV01GDOtyGnVUfkr5LcswmndO6o3bPi8',
    badges: [{ label: 'Pasta Night', variant: 'primary' }],
    meta: [
      { icon: 'schedule', text: '20m' },
      { icon: 'group', text: 'Serves 4' },
    ],
  },
  {
    id: 'smoothie-bowl',
    title: 'Berry Smoothie Bowl',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUkk0KC2HamHz34hYr8RsqlF0ux_N6TJeqf_A46M8EFugQTEQW_bXmCv5xZOAbGjOEsX3V7mWntlxJDLh0aHQNaig_3Ivyhk-5N3bKdhpgeZCOfB05gIBARAJOg84wRggSdYmNHmmQzMXCdT6XgNPzPjGulYNCk4Nh2Im5IrSNdDt49y9k-j2GttY_nAMQFqpnADwW23Wa8nMSMcoUIl7YotwV_unD6jMH1YzuQb5KgwKSGagYoHVXg0ksJhaQB2aAmprzTZzKfEg',
    badges: [{ label: 'Breakfast', variant: 'secondary' }],
    meta: [{ icon: 'schedule', text: '10m' }],
  },
];

/** Hero URLs that already load in-app (design CDN). Use for AI image fallbacks and error recovery. */
export const TRUSTED_RECIPE_HERO_URLS: readonly string[] = Array.from(
  new Set<string>([
    RESULTS_FEATURED.image,
    RESULTS_SECONDARY[0].image,
    RESULTS_SECONDARY[1].image,
    ...FAVORITE_CARDS.map((c) => c.image),
  ]),
);
