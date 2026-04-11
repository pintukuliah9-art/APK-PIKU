import React, { useState } from 'react';
import { updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { User, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UserProfile() {
  const { userData } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(userData?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not found");

      // Update name if changed
      if (name !== userData?.name) {
        await updateProfile(user, { displayName: name });
        await updateDoc(doc(db, 'users', user.uid), { name });
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Password tidak cocok.");
        }
        if (newPassword.length < 6) {
          throw new Error("Password minimal 6 karakter.");
        }
        await updatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      setSuccess('Profil berhasil diperbarui.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      if (err.message === "Password tidak cocok." || err.message === "Password minimal 6 karakter.") {
        setError(err.message);
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Demi keamanan, silakan logout dan login kembali sebelum mengubah password.');
      } else {
        setError('Gagal memperbarui profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-200">
          <CheckCircle2 size={20} />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <User size={20} className="text-blue-500" />
          Pengaturan Profil
        </h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email (Tidak dapat diubah)</label>
            <input
              type="email"
              disabled
              value={userData?.email || ''}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-900 dark:border-slate-700 cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
            <h4 className="text-md font-medium mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Key size={16} className="text-slate-500" />
              Ubah Password
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ketik ulang password baru"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
