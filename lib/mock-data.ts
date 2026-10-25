import { MealLog, WorkoutProgram, Client, Notification, MealPlan, User, NutritionEstimate } from './api';

export const DEMO_USERS: Record<string, User> = {
  client: {
    id: 'user-client-1',
    email: 'client@fitogramme.tn',
    full_name: 'Youssef Trabelsi',
    role: 'client',
    avatar_url: '',
    language: 'derja',
    created_at: '2026-01-15T10:00:00Z',
  },
  coach: {
    id: 'user-coach-1',
    email: 'coach@fitogramme.tn',
    full_name: 'Coach Karim Mansour',
    role: 'coach',
    avatar_url: '',
    language: 'fr',
    created_at: '2025-11-01T08:30:00Z',
  },
  nutritionist: {
    id: 'user-nutri-1',
    email: 'nutri@fitogramme.tn',
    full_name: 'Dr. Sonia Ben Salem',
    role: 'nutritionist',
    avatar_url: '',
    language: 'fr',
    created_at: '2025-10-20T09:15:00Z',
  },
};

export const INITIAL_MEALS: MealLog[] = [
  {
    id: 'meal-1',
    user_id: 'user-client-1',
    meal_type: 'breakfast',
    text_original: 'Bsisa b zit zitouna w 3sal m3a 9ahwa',
    text_normalized: 'Bsisa tunisienne à l\'huile d\'olive et miel avec café',
    logged_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    ai_estimate: {
      calories: 420,
      protein_g: 12,
      carbs_g: 58,
      fat_g: 16,
      confidence: 'high',
      disclaimer: 'Estimation basée sur une portion moyenne de bsisa (80g) préparée à l\'huile d\'olive. À ajuster selon vos quantités réelles.',
    },
  },
  {
    id: 'meal-2',
    user_id: 'user-client-1',
    meal_type: 'lunch',
    text_original: 'Sahn kafteji fi dar m3a 2 3dham me9liyin w chwaya khobz ch3ir',
    text_normalized: 'Kafteji maison avec 2 œufs au plat et pain d\'orge',
    logged_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    ai_estimate: {
      calories: 580,
      protein_g: 22,
      carbs_g: 45,
      fat_g: 34,
      confidence: 'medium',
      disclaimer: 'Les légumes frits absorbent une quantité variable d\'huile. Ajustez les lipides selon votre mode de cuisson.',
    },
  },
  {
    id: 'meal-3',
    user_id: 'user-client-1',
    meal_type: 'snack',
    text_original: 'Ka3ba brik danouni sghira w chwaya deglet nour',
    text_normalized: 'Brik dannouni petit format et dattes Deglet Nour',
    logged_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    ai_estimate: {
      calories: 210,
      protein_g: 5,
      carbs_g: 38,
      fat_g: 6,
      confidence: 'high',
      disclaimer: 'Calcul approximatif pour 3 dattes et 1 brik danouni cuit au four.',
    },
  },
];

export const INITIAL_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'prog-1',
    title: 'Prise de Force & Recomposition (Tunis Fit)',
    description: 'Programme 4 semaines axé sur les mouvements polyarticulaires (squat, développé couché, soulevé de terre) avec surcharge progressive.',
    coach_id: 'user-coach-1',
    client_id: 'user-client-1',
    difficulty: 'intermediate',
    duration_weeks: 4,
    sessions_per_week: 4,
    status: 'active',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prog-2',
    title: 'Conditionnement & Cardio Poids du Corps',
    description: 'Circuit training haute intensité pour booster le métabolisme sans matériel lourd.',
    coach_id: 'user-coach-1',
    difficulty: 'beginner',
    duration_weeks: 6,
    sessions_per_week: 3,
    status: 'draft',
    created_at: '2026-02-10T14:30:00Z',
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'user-client-1',
    full_name: 'Youssef Trabelsi',
    email: 'client@fitogramme.tn',
    goal: 'Prise de masse musculaire propre (+3 kg) et maintien cardio',
    joined_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-client-2',
    full_name: 'Amira Chahed',
    email: 'amira.chahed@gmail.com',
    goal: 'Remise en forme post-partum et tonification',
    joined_at: '2026-01-20T11:00:00Z',
  },
  {
    id: 'user-client-3',
    full_name: 'Mohamed Ali Khemir',
    email: 'mali.khemir@outlook.com',
    goal: 'Préparation semi-marathon et optimisation glycérique',
    joined_at: '2026-02-02T16:45:00Z',
  },
];

export const INITIAL_MEAL_PLANS: MealPlan[] = [
  {
    id: 'plan-1',
    nutritionist_id: 'user-nutri-1',
    client_id: 'user-client-1',
    week_start: '2026-10-19',
    days: [
      {
        day: 1,
        meals: [
          { meal_type: 'Petit-déjeuner', description: 'Omelette 3 œufs, épinards, 1 tranche pain complet, huile d\'olive (1 c.à.s)', calories_target: 450 },
          { meal_type: 'Déjeuner', description: 'Couscous complet à l\'orge (dchicha) avec dorade grillée et légumes vapeur', calories_target: 650 },
          { meal_type: 'Collation', description: 'Yaourt nature, 4 dattes Deglet Nour, 10 amandes', calories_target: 250 },
          { meal_type: 'Dîner', description: 'Salade tunisienne aux concombres et tomates, blanc de poulet mariné au curcuma (150g)', calories_target: 480 },
        ],
      },
      {
        day: 2,
        meals: [
          { meal_type: 'Petit-déjeuner', description: 'Bsisa d\'orge (60g) diluée dans lait d\'amande ou eau, miel bio (1 c.à.c)', calories_target: 390 },
          { meal_type: 'Déjeuner', description: 'Ojja aux crevettes avec tomates fraîches, ail et piment doux, pain d\'orge', calories_target: 580 },
          { meal_type: 'Collation', description: 'Pomme verte et beurre de cacahuète (1 c.à.c)', calories_target: 190 },
          { meal_type: 'Dîner', description: 'Soupe de lentilles corail (chorba 3das) et salade méchouia sans mayonnaise', calories_target: 420 },
        ],
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'workout',
    title: 'Nouveau programme assigné',
    body: 'Coach Karim vous a assigné le programme "Prise de Force & Recomposition".',
    read: false,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'meal',
    title: 'Avis du nutritionniste',
    body: 'Dr. Sonia a validé votre plan nutritionnel pour la semaine.',
    read: false,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Rappel Hydratation',
    body: 'Pensez à boire 2,5L d\'eau aujourd\'hui pour soutenir votre entraînement.',
    read: true,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

export function estimateTunisianMeal(text: string): NutritionEstimate {
  const lower = text.toLowerCase();
  
  if (lower.includes('kafteji') || lower.includes('kafteji')) {
    return {
      calories: 550,
      protein_g: 18,
      carbs_g: 42,
      fat_g: 32,
      confidence: 'medium',
      disclaimer: 'Estimation pour un plat de kafteji avec œufs. L\'absorption d\'huile varie sensiblement.',
    };
  }
  if (lower.includes('couscous') || lower.includes('kousksi')) {
    return {
      calories: 680,
      protein_g: 35,
      carbs_g: 88,
      fat_g: 18,
      confidence: 'high',
      disclaimer: 'Estimation pour 1 portion moyenne de couscous tunisien avec viande ou poisson et légumes.',
    };
  }
  if (lower.includes('lablabi') || lower.includes('lablebi')) {
    return {
      calories: 620,
      protein_g: 26,
      carbs_g: 82,
      fat_g: 20,
      confidence: 'high',
      disclaimer: 'Calculé avec pois chiches, pain rassis, huile d\'olive, cumin et 1 œuf poché.',
    };
  }
  if (lower.includes('ojja') || lower.includes('3ojja')) {
    return {
      calories: 460,
      protein_g: 24,
      carbs_g: 18,
      fat_g: 28,
      confidence: 'medium',
      disclaimer: 'Estimation pour une ojja aux œufs et tomates fraîches. Ajustez si vous ajoutez des merguez.',
    };
  }
  if (lower.includes('bsisa') || lower.includes('bassissa')) {
    return {
      calories: 380,
      protein_g: 11,
      carbs_g: 54,
      fat_g: 14,
      confidence: 'high',
      disclaimer: 'Calculé pour une portion de 70g de farine de bsisa préparée à l\'huile d\'olive.',
    };
  }
  if (lower.includes('mechouia') || lower.includes('mechwya') || lower.includes('salade')) {
    return {
      calories: 220,
      protein_g: 8,
      carbs_g: 12,
      fat_g: 14,
      confidence: 'high',
      disclaimer: 'Estimation pour une salade méchouia avec filet de thon et filet d\'huile d\'olive.',
    };
  }
  if (lower.includes('tajine') || lower.includes('tajin')) {
    return {
      calories: 410,
      protein_g: 25,
      carbs_g: 14,
      fat_g: 28,
      confidence: 'medium',
      disclaimer: 'Estimation pour 1 part de tajine tunisien poulet et fromage.',
    };
  }

  // Generic fallback estimate
  return {
    calories: 450,
    protein_g: 20,
    carbs_g: 50,
    fat_g: 18,
    confidence: 'low',
    disclaimer: 'Plat non identifié avec certitude. Estimation moyenne basée sur la description textuelle. Veuillez corriger manuellement les macronutriments.',
  };
}
