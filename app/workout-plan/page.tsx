'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/fitness/AppShell';
import { useCenterModal } from '@/components/notifications/CenterModal';

const imageOf = (exerciseId: string) => `/exercise-images/${exerciseId}.svg`;

export default function Plan() {
  const [plan, setPlan] = useState<any>(null);
  const { showCenterModal } = useCenterModal();

  async function load() {
    const response = await fetch('/api/workout-plan');
    const data = await response.json();
    setPlan(data.plan);
  }

  async function create() {
    showCenterModal({ message: 'Đang tạo lịch tập.', tone: 'info' });
    const response = await fetch('/api/workout-plan', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) return showCenterModal({ message: data.message, tone: 'error' });
    setPlan(data.plan);
    showCenterModal({ message: 'Đã tạo lịch tập cá nhân hóa.' });
  }

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Lịch tập cá nhân hóa</h1>
            <p className="mt-2 text-slate-600">Tự chọn bài theo mục tiêu, cấp độ, BMI, dụng cụ và hạn chế.</p>
          </div>
          <button className="fit-btn-primary" onClick={create}>Tạo lịch mới</button>
        </div>
        {plan ? (
          <div className="grid gap-4">
            {plan.days.map((day: any) => (
              <section className="fit-card p-5" key={day.dayIndex}>
                <h2 className="text-xl font-black">{day.title}</h2>
                <div className="mt-2 text-sm font-bold text-fitBlue">{day.estimatedMinutes} phút • {day.focus}</div>
                <div className="mt-4 grid gap-2">
                  {day.exercises.map((exercise: any) => (
                    <div className="flex gap-3 rounded-2xl bg-slate-50 p-3" key={exercise.exerciseId + exercise.block}>
                      <img src={imageOf(exercise.exerciseId)} alt={`Minh họa ${exercise.exerciseName}`} className="h-16 w-16 rounded-2xl object-contain bg-white" />
                      <div>
                        <b>{exercise.exerciseName}</b>
                        <div className="text-sm text-slate-500">{exercise.sets} set • {exercise.reps ? `${exercise.reps} lần` : `${exercise.seconds} giây`} • nghỉ {exercise.restSeconds}s</div>
                        <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{exercise.block}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="fit-card p-6">Chưa có lịch tập. Bạn bấm “Tạo lịch mới”.</div>
        )}
      </div>
    </AppShell>
  );
}
