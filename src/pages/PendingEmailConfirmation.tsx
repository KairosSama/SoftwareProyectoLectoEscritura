import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MailCheck, RefreshCcw } from 'lucide-react';

export default function PendingEmailConfirmation() {
  const navigate = useNavigate();
  const { resendConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pending_signup_email');
      if (stored) setEmail(stored);
    } catch {}
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setStatusMsg('');
    try {
      await resendConfirmation(email);
      setStatusMsg('Correo reenviado. Revisa tu bandeja de entrada.');
    } catch (e: any) {
      setStatusMsg(e.message || 'No se pudo reenviar el correo.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-6 space-y-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <MailCheck className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">Confirma tu correo</h1>
        </div>
        <p className="text-sm text-gray-600">
          Hemos enviado un enlace de verificación a: <span className="font-medium">{email || '—'}</span>.
          Abre tu correo y haz clic en el enlace para activar tu cuenta. Este enlace expira en pocos minutos.
        </p>
        <div className="space-y-2 text-xs text-gray-500">
          <p>Si no encuentras el correo revisa la carpeta de spam.</p>
          <p>Una vez confirmado, serás redirigido automáticamente cuando ingreses de nuevo.</p>
        </div>
        {statusMsg && <div className="text-sm text-blue-600">{statusMsg}</div>}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleResend}
            disabled={!email || resending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
            {resending ? 'Reenviando…' : 'Reenviar correo'}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
