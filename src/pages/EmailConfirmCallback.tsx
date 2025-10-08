import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

// Página que procesa el hash recibido tras hacer clic en el enlace de confirmación de correo.
// Supabase redirige a /auth/confirm#access_token=...&type=signup o email_change etc.

export default function EmailConfirmCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Validando enlace…');

  useEffect(() => {
    // El SDK detecta el fragmento (#) automáticamente con onAuthStateChange, pero podemos forzar el intercambio.
    async function handleFragment() {
      try {
        // Supabase v2: getSession ya debería reflejar si la verificación generó sesión.
        // Intentamos leer parámetros para feedback.
        const hash = location.hash; // #access_token=...&type=signup
        if (!hash.includes('access_token')) {
          setState('error');
          setMessage('Enlace inválido o incompleto.');
          return;
        }
        // Forzamos refresh de sesión
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          setState('error');
          setMessage('El enlace ha expirado o ya fue usado.');
          return;
        }
        setState('success');
        setMessage('Correo confirmado correctamente. Redirigiendo…');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (e: any) {
        setState('error');
        setMessage(e.message || 'No se pudo confirmar el correo.');
      }
    }
    handleFragment();
  }, [location.hash, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-6 space-y-4 border border-gray-200 text-center">
        {state === 'processing' && <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />}
        {state === 'success' && <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />}
        {state === 'error' && <XCircle className="h-10 w-10 text-red-600 mx-auto" />}
        <h1 className="text-lg font-semibold text-gray-900">Confirmación de correo</h1>
        <p className="text-sm text-gray-600">{message}</p>
        {state === 'error' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/auth/pending')}
              className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
            >Volver a página de confirmación</button>
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
            >Ir a iniciar sesión</button>
          </div>
        )}
      </div>
    </div>
  );
}
