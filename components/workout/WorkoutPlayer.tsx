'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCenterModal } from '@/components/notifications/CenterModal';
import {
  clearActiveSession,
  createSession,
  installPageExitGuard,
  readActiveSession,
  recordEvent,
  recordWorkoutLog,
  saveActiveSession,
} from '@/lib/workoutSessionRecorder';
import { flushPendingSync } from '@/lib/syncQueue';
import type { WorkoutPlan } from '@/types/fitness';

const reasons = ['Quá mệt','Đau/khó chịu','Không làm đúng form','Bài quá khó','Không thích bài này','Thiếu dụng cụ','Lý do khác'];
const imageOf = (exerciseId: string) => `/exercise-images/${exerciseId}.svg`;

export function WorkoutPlayer({ plan }: { plan: WorkoutPlan }) {
  const day = plan.days[0];
  const [session, setSession] = useState(() => readActiveSession() || createSession(plan.planId, day.dayIndex));
  const [running, setRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [voice, setVoice] = useState(true);
  const [sound, setSound] = useState(true);
  const [askSkip, setAskSkip] = useState(false);
  const { showCenterModal } = useCenterModal();
  const ex = day.exercises[session.currentExerciseIndex] || day.exercises[0];
  const sec = ex.seconds || 0;
  const target = ex.seconds ? `${ex.seconds} giây` : `${ex.reps || 10} lần`;

  function speak(text: string) {
    if (!voice) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      showCenterModal({ message: text, tone: 'info' });
    }
  }

  function beep() {
    if (!sound) return;
    const AudioContextImpl = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextImpl) return;
    const ctx = new AudioContextImpl();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 120);
  }

  function persist(nextSession: typeof session) {
    saveActiveSession(nextSession);
    setSession(nextSession);
  }

  useEffect(() => {
    if (!running || !sec) return;
    const id = window.setInterval(() => {
      setTimer((old) => {
        const next = old + 1;
        if (sec - next <= 3 && sec - next > 0) {
          speak('tích');
          beep();
        }
        if (next >= sec) {
          beep();
          showCenterModal({ message: 'Đã hoàn thành hiệp.' });
          setRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, sec]);

  useEffect(() => installPageExitGuard(() => ({
    sessionId: session.sessionId,
    dayIndex: day.dayIndex,
    status: 'partial',
    exerciseId: ex.exerciseId,
    exerciseName: ex.exerciseName,
    plannedSet: ex.sets,
    completedSet: session.currentSet - 1,
    plannedRepOrTime: target,
    startedAt: session.startedAt,
  })), [session.sessionId, session.currentExerciseIndex, session.currentSet]);

  useEffect(() => {
    speak(`Chuẩn bị bài ${ex.exerciseName}`);
    recordEvent({
      sessionId: session.sessionId,
      dayIndex: day.dayIndex,
      eventType: 'exercise_started',
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      plannedSet: ex.sets,
      plannedRepOrTime: target,
    });
  }, [ex.exerciseId]);

  function completeSet() {
    recordEvent({
      sessionId: session.sessionId,
      dayIndex: day.dayIndex,
      eventType: 'set_completed',
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      plannedSet: ex.sets,
      completedSet: session.currentSet,
      plannedRepOrTime: target,
      actualRepOrTime: target,
    });
    showCenterModal({ message: 'Đã hoàn thành hiệp.' });
    session.currentSet < ex.sets ? persist({ ...session, currentSet: session.currentSet + 1 }) : nextExercise();
  }

  function nextExercise(reason?: string) {
    if (reason) {
      recordEvent({
        sessionId: session.sessionId,
        dayIndex: day.dayIndex,
        eventType: 'exercise_skipped',
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        plannedSet: ex.sets,
        completedSet: session.currentSet - 1,
        plannedRepOrTime: target,
        skipReason: reason,
      });
      recordWorkoutLog({
        sessionId: session.sessionId,
        dayIndex: day.dayIndex,
        status: 'skipped',
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        plannedSet: ex.sets,
        completedSet: session.currentSet - 1,
        plannedRepOrTime: target,
        skipReason: reason,
        startedAt: session.startedAt,
      });
      showCenterModal({ message: 'Đã lưu lý do bỏ qua.' });
    } else {
      recordEvent({
        sessionId: session.sessionId,
        dayIndex: day.dayIndex,
        eventType: 'exercise_next_clicked',
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
      });
    }
    const nextIndex = session.currentExerciseIndex + 1;
    setAskSkip(false);
    setRunning(false);
    setTimer(0);
    if (nextIndex >= day.exercises.length) return completeWorkout();
    persist({ ...session, currentExerciseIndex: nextIndex, currentSet: 1 });
    speak('Chuẩn bị bài tiếp theo');
  }

  async function completeWorkout() {
    recordEvent({ sessionId: session.sessionId, dayIndex: day.dayIndex, eventType: 'workout_completed' });
    recordWorkoutLog({
      sessionId: session.sessionId,
      dayIndex: day.dayIndex,
      status: 'completed',
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
      durationSec: Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
    });
    clearActiveSession();
    showCenterModal({ message: 'Đã hoàn thành buổi tập.' });
    await flushPendingSync();
  }

  async function saveExit() {
    recordEvent({ sessionId: session.sessionId, dayIndex: day.dayIndex, eventType: 'workout_abandoned' });
    recordWorkoutLog({
      sessionId: session.sessionId,
      dayIndex: day.dayIndex,
      status: 'partial',
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      plannedSet: ex.sets,
      completedSet: session.currentSet - 1,
      plannedRepOrTime: target,
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
    });
    clearActiveSession();
    showCenterModal({ message: 'Đã lưu buổi tập chưa hoàn thành.' });
    await flushPendingSync();
  }

  const progress = useMemo(() => Math.round(((session.currentExerciseIndex + 1) / day.exercises.length) * 100), [session.currentExerciseIndex]);

  return (
    <div className="space-y-5">
      <div className="fit-card p-5">
        <div className="text-sm font-bold text-fitBlue">{day.title}</div>
        <h1 className="text-3xl font-black">{ex.exerciseName}</h1>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-gradient-to-r from-fitBlue to-fitGreen" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="fit-card p-5 text-center">
        <img
          src={imageOf(ex.exerciseId)}
          alt={`Minh họa ${ex.exerciseName}`}
          className="mx-auto h-64 w-full max-w-sm rounded-3xl object-contain bg-gradient-to-br from-sky-50 to-green-50 p-2 shadow-inner"
        />
        <div className="mt-5 text-sm font-bold">Set {session.currentSet}/{ex.sets} • Mục tiêu {target}</div>
        <div className="mt-2 text-6xl font-black">{sec ? Math.max(0, sec - timer) : target}</div>
        <p className="mt-3 text-slate-600">{ex.note}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="fit-btn-primary" onClick={() => { setRunning(true); speak('Bắt đầu'); }}>Bắt đầu</button>
        <button className="fit-btn-secondary" onClick={() => { setRunning(false); showCenterModal({ message: 'Đã tạm dừng buổi tập.', tone: 'info' }); recordEvent({ sessionId: session.sessionId, dayIndex: day.dayIndex, eventType: 'workout_paused' }); }}>Tạm dừng</button>
        <button className="fit-btn-primary" onClick={completeSet}>Hoàn thành set</button>
        <button className="fit-btn-secondary" onClick={() => setAskSkip(true)}>Bỏ qua bài này</button>
        <button className="fit-btn-secondary" onClick={() => nextExercise()}>Bài tiếp theo</button>
        <button className="fit-btn-secondary" onClick={saveExit}>Lưu và thoát</button>
      </div>
      <div className="fit-card flex justify-between p-4">
        <label><input type="checkbox" checked={voice} onChange={e => setVoice(e.target.checked)} /> Voice tiếng Việt</label>
        <label><input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Tick/còi</label>
      </div>
      <AnimatePresence>
        {askSkip && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fit-card w-full max-w-md p-5">
              <h2 className="text-2xl font-black">Vì sao bạn muốn bỏ qua?</h2>
              <div className="mt-4 grid gap-2">
                {reasons.map(r => <button className="fit-btn-secondary text-left" key={r} onClick={() => nextExercise(r)}>{r}</button>)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
