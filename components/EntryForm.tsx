import React, { useState, useEffect } from 'react';
import { Save, Calendar, Clock, Dumbbell, BookOpen, Monitor, Smartphone, Scale, ArrowRightLeft } from 'lucide-react';
import { DailyData } from '../types';
import { calculateDuration } from '../utils/calculations';
import { toJalaali, toGregorian, formatJalali, gregorianToJalaliString } from '../utils/jalali';

interface EntryFormProps {
  onSave: (data: DailyData) => void;
  existingData?: DailyData;
}

const getTodayGregorian = () => new Date().toISOString().split('T')[0];

const INITIAL_STATE: DailyData = {
  id: '',
  date: getTodayGregorian(),
  jalaliDate: gregorianToJalaliString(getTodayGregorian()),
  sleepTime: '23:00',
  wakeTime: '07:00',
  sleepHours: 8,
  workHours: 0,
  exerciseMinutes: 0,
  studyMinutes: 0,
  phoneMinutes: 0,
  weight: 0,
  notes: ''
};

export const EntryForm: React.FC<EntryFormProps> = ({ onSave, existingData }) => {
  const [formData, setFormData] = useState<DailyData>(INITIAL_STATE);
  
  // State for separate Jalali inputs
  const [jalaliParts, setJalaliParts] = useState({ y: 1403, m: 1, d: 1 });

  // Load existing data
  useEffect(() => {
    if (existingData) {
      setFormData(existingData);
    }
  }, [existingData]);

  // Sync Gregorian Input -> Jalali State
  useEffect(() => {
    if (formData.date) {
      const [gY, gM, gD] = formData.date.split('-').map(Number);
      const { jy, jm, jd } = toJalaali(gY, gM, gD);
      // Only update if different to avoid loop
      if (jy !== jalaliParts.y || jm !== jalaliParts.m || jd !== jalaliParts.d) {
        setJalaliParts({ y: jy, m: jm, d: jd });
        // Update the string field in formData as well
        setFormData(prev => ({ ...prev, jalaliDate: formatJalali(jy, jm, jd) }));
      }
    }
  }, [formData.date]);

  // Auto-calculate sleep hours when times change
  useEffect(() => {
    const hours = calculateDuration(formData.sleepTime, formData.wakeTime);
    setFormData(prev => ({ ...prev, sleepHours: hours }));
  }, [formData.sleepTime, formData.wakeTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleJalaliChange = (field: 'y' | 'm' | 'd', value: string) => {
    const val = parseInt(value) || 0;
    const newParts = { ...jalaliParts, [field]: val };
    setJalaliParts(newParts);

    // Validate incomplete dates before converting
    if (newParts.y > 1300 && newParts.m >= 1 && newParts.m <= 12 && newParts.d >= 1 && newParts.d <= 31) {
      const { gy, gm, gd } = toGregorian(newParts.y, newParts.m, newParts.d);
      const newGregorian = `${gy}-${gm.toString().padStart(2, '0')}-${gd.toString().padStart(2, '0')}`;
      
      // Update form data if valid
      if (!isNaN(gy)) {
        setFormData(prev => ({
          ...prev,
          date: newGregorian,
          jalaliDate: formatJalali(newParts.y, newParts.m, newParts.d)
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.date }); 
    alert("Data saved! (Simulated)");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
        <div className="bg-brand-500/20 p-2 rounded-lg">
          <Calendar className="text-brand-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Log Daily Activity</h2>
          <p className="text-slate-400 text-sm">Record your metrics for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Date Section - Combined */}
        <div className="col-span-full bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-brand-400"/> Date Selection
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Gregorian Date</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xs text-slate-500 mb-1">Jalali Date (Y/M/D)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="YYYY"
                  value={jalaliParts.y}
                  onChange={(e) => handleJalaliChange('y', e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-center"
                />
                <span className="text-slate-600 self-center">/</span>
                <input 
                  type="number" 
                  placeholder="MM"
                  min="1" max="12"
                  value={jalaliParts.m}
                  onChange={(e) => handleJalaliChange('m', e.target.value)}
                  className="w-14 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-center"
                />
                <span className="text-slate-600 self-center">/</span>
                <input 
                  type="number" 
                  placeholder="DD"
                  min="1" max="31"
                  value={jalaliParts.d}
                  onChange={(e) => handleJalaliChange('d', e.target.value)}
                  className="w-14 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Section */}
        <div className="space-y-4 border border-slate-700/50 p-4 rounded-lg bg-slate-800/50">
           <h3 className="text-indigo-400 font-semibold flex items-center gap-2"><Clock size={16}/> Sleep Cycle</h3>
           <div>
            <label className="block text-xs text-slate-400 mb-1">Bedtime (Previous Night)</label>
            <input 
              type="time" 
              name="sleepTime"
              value={formData.sleepTime}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Wake Time</label>
            <input 
              type="time" 
              name="wakeTime"
              value={formData.wakeTime}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>
          <div className="text-right text-xs text-slate-500">
            Calculated: <span className="text-indigo-300 font-bold">{formData.sleepHours} hrs</span>
          </div>
        </div>

        {/* Activities Section */}
        <div className="space-y-4 border border-slate-700/50 p-4 rounded-lg bg-slate-800/50">
           <h3 className="text-amber-400 font-semibold flex items-center gap-2"><Monitor size={16}/> Productivity</h3>
           <div>
            <label className="block text-xs text-slate-400 mb-1">Work Hours</label>
            <input 
              type="number" 
              step="0.5"
              name="workHours"
              value={formData.workHours}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Study (Minutes)</label>
            <div className="relative">
              <BookOpen size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="number" 
                name="studyMinutes"
                value={formData.studyMinutes}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 pl-10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Health Section */}
        <div className="col-span-full md:col-span-1 border border-slate-700/50 p-4 rounded-lg bg-slate-800/50">
           <h3 className="text-emerald-400 font-semibold flex items-center gap-2"><Dumbbell size={16}/> Health</h3>
           <div>
            <label className="block text-xs text-slate-400 mb-1">Exercise (Minutes)</label>
             <div className="relative">
              <Dumbbell size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="number" 
                name="exerciseMinutes"
                value={formData.exerciseMinutes}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 pl-10 text-white"
              />
            </div>
          </div>
           <div className="mt-4">
            <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
             <div className="relative">
              <Scale size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="number" 
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 pl-10 text-white"
              />
            </div>
          </div>
        </div>

         {/* Phone Section */}
         <div className="col-span-full md:col-span-1 border border-slate-700/50 p-4 rounded-lg bg-slate-800/50">
           <h3 className="text-rose-400 font-semibold flex items-center gap-2"><Smartphone size={16}/> Distractions</h3>
           <div>
            <label className="block text-xs text-slate-400 mb-1">Phone Usage (Minutes)</label>
            <input 
              type="number" 
              name="phoneMinutes"
              value={formData.phoneMinutes}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>
           <p className="text-xs text-slate-500 mt-2 italic">High usage negatively impacts your productivity score.</p>
        </div>

      </div>

      <button 
        type="submit" 
        className="w-full mt-8 bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Save Daily Log
      </button>
    </form>
  );
};