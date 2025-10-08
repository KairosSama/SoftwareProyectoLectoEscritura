import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { assessPasswordStrength, PASSWORD_POLICY, PASSWORD_REQUIREMENT_TOOLTIPS } from '../config/auth';

export default function PasswordResetCallback() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [phase, setPhase] = useState<'validating' | 'form' | 'updating' | 'done' | 'error'>('validating');
  const [error, setError] = useState('');
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const strength = assessPasswordStrength(pwd1);

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
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input type="password" value={pwd1} onChange={e=>setPwd1(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
                <div className="h-full transition-all" style={{width: `${Math.round(strength.score*100)}%`, backgroundColor: strength.score>=1?'#065f46': strength.score>=0.75?'#059669': strength.score>=0.5?'#10b981': strength.score>=0.25?'#f59e0b':'#dc2626'}} />
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Fortaleza: <span className="font-medium">{strength.label}</span></p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              {pwd2 && pwd1 !== pwd2 && <p className="text-xs text-red-600">No coinciden</p>}
            </div>
            <ul className="text-xs text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
              <PasswordRequirement id="length" ok={strength.tests.length} label={`Mín ${PASSWORD_POLICY.minLength} caracteres`} />
              <PasswordRequirement id="upper" ok={strength.tests.upper} label="Mayúscula" />
              <PasswordRequirement id="lower" ok={strength.tests.lower} label="Minúscula" />
              <PasswordRequirement id="number" ok={strength.tests.number} label="Número" />
              <PasswordRequirement id="symbol" ok={strength.tests.symbol} label="Símbolo" />
            </ul>
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

function PasswordRequirement({ id, ok, label }: { id: keyof typeof PASSWORD_REQUIREMENT_TOOLTIPS; ok: boolean; label: string }) {
  const expl = PASSWORD_REQUIREMENT_TOOLTIPS[id];
  return (
    <li className={ok ? 'relative group text-green-600 flex items-center gap-1' : 'relative group text-gray-500 flex items-center gap-1'}>
      <svg className={ok ? 'h-3 w-3 text-green-600' : 'h-3 w-3 text-gray-400'} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        {ok ? (
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.95a.75.75 0 10-1.06-1.06L9 9.464 7.525 7.99a.75.75 0 10-1.06 1.06l2.005 2.006a.75.75 0 001.06 0l4.006-4.006z" clipRule="evenodd" />
        )}
      </svg>
      <span>{label}</span>
      <button
        type="button"
        tabIndex={0}
        aria-describedby={`pwreq-${id}`}
        className="ml-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
      >
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10A8 8 0 11.002 9.999 8 8 0 0118 10zM9 9a1 1 0 112 0v5a1 1 0 11-2 0V9zm1-4a1.25 1.25 0 100 2.5A1.25 1.25 0 0010 5z" clipRule="evenodd" />
        </svg>
      </button>
      <div
        role="tooltip"
        id={`pwreq-${id}`}
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute z-10 top-full left-0 mt-1 w-48 p-2 rounded bg-gray-900 text-[10px] leading-snug text-white shadow-lg"
      >
        {expl}
      </div>
    </li>
  );
}
