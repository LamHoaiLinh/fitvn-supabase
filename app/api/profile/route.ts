import { requireUserSession } from '@/lib/auth';
import { calculateMetrics } from '@/lib/fitnessCalculations';
import { profileSchema } from '@/lib/validators';
import { getCurrentProfile, getUserById, saveProfileAndMeasurement } from '@/lib/dataRepository';
import { fail, ok } from '@/lib/apiResponse';
import type { ProfileInput } from '@/types/fitness';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireUserSession();
    const user = await getUserById(session.userId);
    if (!user || user.status !== 'active') throw new Error('Tài khoản không khả dụng.');

    const data = await getCurrentProfile(user.userId);
    return ok(data);
  } catch (error) {
    return fail(error, 401);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireUserSession();
    const user = await getUserById(session.userId);
    if (!user || user.status !== 'active') throw new Error('Tài khoản không khả dụng.');

    const parsed = profileSchema.parse(await req.json());

    // Ép kiểu sau khi Zod đã validate để Next/TypeScript hiểu đúng literal union:
    // sessionsPerWeek chỉ hợp lệ 3 | 4 | 5 | 6
    // minutesPerSession chỉ hợp lệ 15 | 20 | 30 | 45 | 60
    const profile = parsed as ProfileInput;
    const metrics = calculateMetrics(profile);

    await saveProfileAndMeasurement(user.userId, profile, metrics);

    return ok({
      message: 'Đã ghi nhận tiến độ.',
      profile,
      metrics,
    });
  } catch (error) {
    return fail(error);
  }
}
