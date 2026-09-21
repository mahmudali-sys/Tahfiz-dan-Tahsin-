import React, { useState, useEffect } from 'react';
import { X, Save, GraduationCap } from 'lucide-react';
import { Teacher } from '../types';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama guru / Ustadz(ah) wajib diisi.');
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
            <label className="block font-semibold text-slate-700 mb-1">
              Kelas Bimbingan <span className="text-slate-400 font-normal">(Pisahkan dengan koma)</span>
            </label>
            <input
              type="text"
              required
              value={assignedClassesText}
              onChange={(e) => setAssignedClassesText(e.target.value)}
              placeholder="7A, 7B, 8C"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-emerald-800 focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Contoh format: 7A, 7B, 8A, 9B
            </span>
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
