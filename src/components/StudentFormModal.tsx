import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, User } from 'lucide-react';
import { Student, Teacher } from '../types';
import { SMPIA9_VALID_CLASSES, normalizeClassName, getDefaultTargetForClass, assignTeacherForClass } from '../utils/studentImporter';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  teachers: Teacher[];
  onSave: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  teachers,
  onSave,
}) => {
  if (!isOpen) return null;

  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [className, setClassName] = useState('7A');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [targetJuz, setTargetJuz] = useState('Juz 30 (Tuntas Mutqin)');
  const [targetSurahCount, setTargetSurahCount] = useState(37);
  const [parentPhone, setParentPhone] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setNis(studentToEdit.nis);
      setNisn(studentToEdit.nisn);
      setName(studentToEdit.name);
      setGender(studentToEdit.gender === 'P' ? 'P' : 'L');
      const normClass = normalizeClassName(studentToEdit.className);
      setClassName((SMPIA9_VALID_CLASSES as readonly string[]).includes(normClass) ? normClass : '7A');
      setTeacherId(studentToEdit.teacherId || teachers[0]?.id || '');
      setTargetJuz(studentToEdit.targetJuz || 'Juz 30 (Tuntas Mutqin)');
      setTargetSurahCount(studentToEdit.targetSurahCount || 37);
      setParentPhone(studentToEdit.parentPhone || '');
    } else {
      // Defaults for new student
      setNis(`242507${Math.floor(100 + Math.random() * 900)}`);
      setNisn(`011${Math.floor(1000000 + Math.random() * 9000000)}`);
      setName('');
      setGender('L');
      setClassName('7A');
      setTeacherId(teachers[0]?.id || '');
      const defaultTarget = getDefaultTargetForClass('7A');
      setTargetJuz(defaultTarget.targetJuz);
      setTargetSurahCount(defaultTarget.targetSurahCount);
      setParentPhone('');
    }
  }, [studentToEdit, isOpen, teachers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const studentData: Student = {
      id: studentToEdit ? studentToEdit.id : `std-${Date.now()}`,
      nis,
      nisn,
      name,
      gender,
      className,
      teacherId,
      targetJuz,
      targetSurahCount: Number(targetSurahCount),
      parentPhone,
    };

    onSave(studentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm sm:text-base">
              {studentToEdit ? 'Ubah Data Murid' : 'Tambah Murid Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Murid *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Azzam Fathoni"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIS Sekolah *</label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="242507001"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NISN Nasional *</label>
              <input
                type="text"
                required
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="0112894001"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
              >
                <option value="L">Laki-Laki (Ikhwan)</option>
                <option value="P">Perempuan (Akhwat)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelas (8 Rombel Resmi SMPIA 9)</label>
              <select
                value={className}
                onChange={(e) => {
                  const val = e.target.value;
                  setClassName(val);
                  const defaults = getDefaultTargetForClass(val);
                  setTargetJuz(defaults.targetJuz);
                  setTargetSurahCount(defaults.targetSurahCount);
                  // also suggest teacher if not set or editing
                  const suggestedTeacher = assignTeacherForClass(val, teachers);
                  if (suggestedTeacher) {
                    setTeacherId(suggestedTeacher);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              >
                {SMPIA9_VALID_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls} {cls.startsWith('7') ? '(Tingkat VII)' : cls.startsWith('8') ? '(Tingkat VIII)' : '(Tingkat IX)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Guru Pembimbing Tahfiz/Tahsin</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Kurikulum</label>
              <select
                value={targetJuz}
                onChange={(e) => {
                  setTargetJuz(e.target.value);
                  if (e.target.value.includes('Juz 30 & 29')) setTargetSurahCount(48);
                  else if (e.target.value.includes('Juz 28, 29, 30')) setTargetSurahCount(59);
                  else setTargetSurahCount(37);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
              >
                <option value="Juz 30 (Tuntas Mutqin)">Juz 30 (Tuntas Mutqin)</option>
                <option value="Juz 29 & 30">Juz 29 & 30</option>
                <option value="Juz 28, 29, 30">Juz 28, 29, 30</option>
                <option value="Juz 1 & Pilihan">Juz 1 & Pilihan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp Wali</label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Data Murid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
