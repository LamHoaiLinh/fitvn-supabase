import { exerciseSeed } from '@/data/exercises.seed';
import type { Exercise, FitnessLevel, ProfileInput, Pressure } from '@/types/fitness';

// Ép seed về kiểu Exercise[] để TypeScript không suy luận quá hẹp từ dữ liệu seed hiện tại.
// Nếu seed hiện chưa có bài nào pressure='cao', TS có thể suy luận chỉ còn 'thap'|'trung_binh'
// và báo lỗi khi ta kiểm tra === 'cao'. Runtime thì logic này vẫn cần cho seed mở rộng sau này.
export const exerciseLibrary: Exercise[] = exerciseSeed as Exercise[];

const rank: Record<FitnessLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function hasMatchingEquipment(required: string[], available: string[]) {
  if (!required.length) return true;
  const normalizedAvailable = available.map((item) => item.toLowerCase());
  return required.some((need) => {
    const normalizedNeed = need.toLowerCase();
    return normalizedAvailable.some(
      (have) => normalizedNeed.includes(have) || have.includes(normalizedNeed),
    );
  });
}

function isHighPressure(value: Pressure | string | undefined) {
  return value === 'cao';
}

export function filterExercisesForUser(
  profile: ProfileInput,
  level: FitnessLevel,
  skippedIds: string[] = [],
) {
  const equipment = profile.equipment || [];
  const limitations = new Set(profile.limitations || []);
  const bmi =
    profile.weightKg && profile.heightCm
      ? profile.weightKg / (profile.heightCm / 100) ** 2
      : 0;

  const avoidJump =
    bmi >= 28 ||
    limitations.has('gối') ||
    limitations.has('thừa_cân_nhiều') ||
    limitations.has('huyết_áp') ||
    limitations.has('tim_mạch');

  return exerciseLibrary.filter((exercise) => {
    if (rank[exercise.level] > rank[level] + 1) return false;
    if (avoidJump && exercise.hasJump) return false;
    if (limitations.has('gối') && isHighPressure(exercise.kneePressure)) return false;
    if (limitations.has('lưng') && isHighPressure(exercise.lowerBackPressure)) return false;
    if (limitations.has('vai') && isHighPressure(exercise.shoulderPressure)) return false;
    if (limitations.has('cổ_tay') && isHighPressure(exercise.wristPressure)) return false;
    if (!hasMatchingEquipment(exercise.equipment, equipment)) return false;
    if (skippedIds.includes(exercise.id) && exercise.level !== 'beginner') return false;
    return true;
  });
}

export function pickByCategory(pool: Exercise[], categories: string[], count: number) {
  const out: Exercise[] = [];

  for (const category of categories) {
    for (const exercise of pool) {
      if (out.length >= count) break;
      if (exercise.category.includes(category) && !out.find((item) => item.id === exercise.id)) {
        out.push(exercise);
      }
    }
  }

  for (const exercise of pool) {
    if (out.length >= count) break;
    if (!out.find((item) => item.id === exercise.id)) out.push(exercise);
  }

  return out.slice(0, count);
}
