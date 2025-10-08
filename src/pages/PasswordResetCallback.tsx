import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle2, XCircle } from 'lucide-react';

export default function PasswordResetCallback() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [phase, setPhase] = useState<'validating' | 'form' | 'updating' | 'done' | 'error'>('validating');
  const [error, setError] = useState('');
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');

  // Supabase redirige aquí con access_token en el fragment (#). El SDK ya debería manejarlo, sólo validamos sesión.
  useEffect(() => {
    async function validate() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setPhase('error');
          setError('Token inválido o expirado. Solicita un nuevo enlace.');
          return;
        }
        setPhase('form');
      } catch (e: any) {
        setPhase('error');
        setError(e.message || 'Error verificando token');
      }
    }
    validate();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd1.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (pwd1 !== pwd2) { setError('Las contraseñas no coinciden.'); return; }
    setError('');
    setPhase('updating');
    try {
      await updatePassword(pwd1);
      setPhase('done');
      setTimeout(()=> navigate('/dashboard'), 1500);
    } catch (e: any) {
      setPhase('form');
      setError(e.message || 'No se pudo actualizar la contraseña');
    }
  };

  const isUpdating = phase === 'updating';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-lg border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">Restablecer contraseña</h1>
        </div>
        {phase === 'validating' && <p className="text-sm text-gray-600">Validando enlace…</p>}
        {phase === 'error' && (
          <div className="text-sm text-red-600 flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5" />{error}</div>
        )}
        {phase === 'form' && (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input type="password" value={pwd1} onChange={e=>setPwd1(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <button disabled={isUpdating} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {isUpdating ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </form>
        )}
        {phase === 'done' && (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-sm text-gray-700">Contraseña actualizada. Redirigiendo…</p>
          </div>
        )}
      </div>
    </div>
  );
}
