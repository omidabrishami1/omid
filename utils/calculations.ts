import { DailyData, CalculatedScore, ScoringConfig } from '../types';
import { toJalaali, formatJalali } from './jalali';

/**
 * Calculates the duration between two times in HH:mm format.
 * Handles crossing midnight.
 */
export const calculateDuration = (start: string, end: string): number => {
  if (!start || !end) return 0;
  
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  let diffInMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  
  if (diffInMinutes < 0) {
    diffInMinutes += 24 * 60; // Add 24 hours if end time is next day
  }
  
  return parseFloat((diffInMinutes / 60).toFixed(2));
};

/**
 * Core scoring algorithm based on user requirements.
 */
export const calculateDailyScore = (data: DailyData, config: ScoringConfig): CalculatedScore => {
  let score = 0;

  // Work Score
  score += data.workHours * config.workWeight;

  // Exercise Score
  score += data.exerciseMinutes * config.exerciseWeight;

  // Study Score
  score += data.studyMinutes * config.studyWeight;

  // Phone Penalty
  score -= data.phoneMinutes * config.phonePenalty;

  // Sleep Score (Simple logic: if within healthy range 7-9 hours, give bonus)
  if (data.sleepHours >= 7 && data.sleepHours <= 9) {
    score += config.sleepWeight;
  } else if (data.sleepHours > 0) {
     // Partial credit for sleep outside ideal window
     score += config.sleepWeight * 0.5;
  }

  // Calculate Percentage
  let percentage = (score / config.dailyTargetScore) * 100;
  percentage = Math.max(0, Math.min(percentage, 100)); // Clamp between 0-100 for display (can go over 100 conceptually but usually capped for progress bars)

  // Determine Grade
  let grade: CalculatedScore['grade'] = 'F';
  if (percentage >= 100) grade = 'S';
  else if (percentage >= 90) grade = 'A';
  else if (percentage >= 75) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 40) grade = 'D';

  return {
    totalScore: Math.round(score),
    productivityPercentage: Math.round(percentage),
    grade
  };
};

/**
 * Generates mock data for demonstration purposes
 */
export const generateMockData = (days: number): DailyData[] => {
  const data: DailyData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Convert to Jalali
    const gYear = d.getFullYear();
    const gMonth = d.getMonth() + 1;
    const gDay = d.getDate();
    const { jy, jm, jd } = toJalaali(gYear, gMonth, gDay);
    const jalaliStr = formatJalali(jy, jm, jd);

    // Randomize data slightly
    const work = 6 + Math.random() * 4;
    const exercise = Math.random() > 0.5 ? 30 + Math.random() * 60 : 0;
    const study = Math.random() * 60;
    const phone = 30 + Math.random() * 90;
    const weight = 75 + Math.sin(i / 5) * 1.5; // Fluctuation

    data.push({
      id: dateStr,
      date: dateStr,
      jalaliDate: jalaliStr,
      sleepTime: "23:00",
      wakeTime: "07:00",
      sleepHours: 8,
      workHours: parseFloat(work.toFixed(1)),
      exerciseMinutes: Math.round(exercise),
      studyMinutes: Math.round(study),
      phoneMinutes: Math.round(phone),
      weight: parseFloat(weight.toFixed(1)),
      notes: ""
    });
  }
  return data;
};