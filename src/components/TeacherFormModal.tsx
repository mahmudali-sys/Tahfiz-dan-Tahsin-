import React, { useState, useEffect } from 'react';
import { X, Save, GraduationCap, AlertCircle, Check } from 'lucide-react';
import { Teacher } from '../types';
import { SMPIA9_VALID_CLASSES } from '../utils/studentImporter';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
  onSave: (teacher: Teacher) => void;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  teacherToEdit,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [specialty, setSpecialty] = useState<'Tahsin' | 'Tahfiz' | 'Tahsin & Tahfiz'>('Tahsin & Tahfiz');
  const [assignedClassesText, setAssignedClassesText] = useState('7A, 7B');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (teacherToEdit) {
      setName(teacherToEdit.name);
      setNip(teacherToEdit.nip);
      setGender(teacherToEdit.gender || 'L');
      setSpecialty(teacherToEdit.specialty || 'Tahsin & Tahfiz');
      setAssignedClassesText(teacherToEdit.assignedClasses.join(', '));
      setPhone(teacherToEdit.phone || '');
    } else {
      setName('');
      setNip(`1988${Math.floor(10000000 + Math.random() * 90000000)}`);
      setGender('L');
      setSpecialty('Tahsin & Tahfiz');
      setAssignedClassesText('7A, 7B');
      setPhone('');
    }
  }, [teacherToEdit, isOpen]);

  // Current selected classes parsed from text
  const currentSelectedClasses = assignedClassesText
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const toggleClass = (cls: string) => {
    if (currentSelectedClasses.includes(cls)) {
      const remaining = currentSelectedClasses.filter((c) => c !== cls);
      setAssignedClassesText(remaining.join(', '));
    } else {
      const updated = [...currentSelectedClasses, cls].sort();
      setAssignedClassesText(updated.join(', '));
    }
  };

  const hasInvalid9C = currentSelectedClasses.some((c) => c === '9C' || c.startsWith('9C'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama guru / Ustadz(ah) wajib diisi.');
      return;
    }

    if (hasInvalid9C) {
      alert('Perhatian: SMP Islam Al Azhar 9 hanya memiliki 8 rombel resmi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B). Kelas 9C tidak diperkenankan.');
      return;
    }

    const classesArray = assignedClassesText
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    const teacherData: Teacher = {
      id: teacherToEdit ? teacherToEdit.id : `tch-${Date.now()}`,
      name: name.trim(),
      nip: nip.trim() || '-',
      gender,
      specialty,
      assignedClasses: classesArray.length > 0 ? classesArray : ['7A'],
      phone: phone.trim() || undefined,
    };

    onSave(teacherData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {teacherToEdit ? 'Ubah Data Guru Pembimbing' : 'Tambah Guru Pembimbing Baru'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Data pengampu tahsin & tahfiz Al-Qur'an
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd.I, Al-Hafizh"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP / NUPTK</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19880101..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-emerald-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Kelas Bimbingan <span className="text-slate-400 font-normal">(8 Rombel Resmi SMPIA 9)</span>
              </label>
              <span className="text-[10px] text-slate-500">Klik chip untuk memilih</span>
            </div>
            
            {/* Quick toggle chips for the 8 official classes */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SMPIA9_VALID_CLASSES.map((cls) => {
                const isSelected = currentSelectedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{cls}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              required
              value={assignedClassesText}
              onChange={(e) => setAssignedClassesText(e.target.value)}
              placeholder="7A, 7B, 8C"
              className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-emerald-800 focus:bg-white ${
                hasInvalid9C ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              }`}
            />
            
            {hasInvalid9C ? (
              <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Peringatan: Kelas 9C tidak valid untuk SMPIA 9 (Hanya 8 rombel: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B).</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Format: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Panggilan / Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-emerald-800 focus:bg-white"
              >
                <option value="L">Ustadz (Laki-laki)</option>
                <option value="P">Ustadzah (Perempuan)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Spesialisasi / Bidang</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as 'Tahsin' | 'Tahfiz' | 'Tahsin & Tahfiz')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-emerald-800 focus:bg-white"
              >
                <option value="Tahsin & Tahfiz">Tahsin & Tahfiz</option>
                <option value="Tahsin">Tahsin Saja</option>
                <option value="Tahfiz">Tahfiz Saja</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{teacherToEdit ? 'Simpan Perubahan' : 'Tambah Guru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
