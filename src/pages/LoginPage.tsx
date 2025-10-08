import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { assessPasswordStrength, PASSWORD_POLICY } from '../config/auth';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'teacher'
  });
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<{fullName?: boolean; email?: boolean; password?: boolean}>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const strength = assessPasswordStrength(formData.password);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        // Validaciones previas
        if (formData.fullName.trim().length < 3) throw new Error('El nombre debe tener al menos 3 caracteres');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error('Correo inválido');
        if (!acceptTerms) throw new Error('Debes aceptar los Términos');
        // Checklist de password
        const tests = strength.tests;
        if (!tests.length || !tests.upper || !tests.lower || !tests.number || !tests.symbol) {
          throw new Error('La contraseña no cumple los requisitos mínimos');
        }
      }
      if (isLogin) {
        await signIn(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        const { needsConfirmation } = await signUp(formData.email, formData.password, formData.fullName, formData.role);
        if (needsConfirmation) {
          navigate('/auth/pending');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Ha ocurrido un error';
      // Supabase error cuando email no confirmado puede contener 'Email not confirmed'
      if (/not.*confirm/i.test(msg) || /email.*confirm/i.test(msg)) {
        try { 
          sessionStorage.setItem('pending_signup_email', formData.email); 
          sessionStorage.setItem('pending_from_login', '1');
        } catch {}
        navigate('/auth/pending');
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    try {
  await requestPasswordReset(formData.email);
      alert('¡Correo de restablecimiento de contraseña enviado! Revisa tu bandeja de entrada.');
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el correo de restablecimiento');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Iniciar sesión en EduEvalúa' : 'Crear tu cuenta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Plataforma de Evaluación de Necesidades Especiales
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={!isLogin}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  onBlur={()=> setTouched(t=>({...t, fullName:true}))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {!isLogin && touched.fullName && formData.fullName.trim().length < 3 && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Mínimo 3 caracteres.</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={()=> setTouched(t=>({...t,email:true}))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Formato de correo inválido.</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={()=> setTouched(t=>({...t,password:true}))}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {!isLogin && (
                <div className="mt-2 space-y-2">
                  <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
                    <div className="h-full transition-all" style={{width:`${Math.round(strength.score*100)}%`, backgroundColor: strength.score>=1?'#065f46': strength.score>=0.75?'#059669': strength.score>=0.5?'#10b981': strength.score>=0.25?'#f59e0b':'#dc2626'}} />
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Fortaleza: <span className="font-medium">{strength.label}</span></p>
                  <ul className="text-[11px] grid grid-cols-2 gap-x-4 gap-y-1">
                    <Req ok={strength.tests.length}>Mín {PASSWORD_POLICY.minLength}</Req>
                    <Req ok={strength.tests.upper}>Mayúscula</Req>
                    <Req ok={strength.tests.lower}>Minúscula</Req>
                    <Req ok={strength.tests.number}>Número</Req>
                    <Req ok={strength.tests.symbol}>Símbolo</Req>
                  </ul>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="teacher">Profesor</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-2 pt-2">
                <input id="terms" type="checkbox" checked={acceptTerms} onChange={(e)=>setAcceptTerms(e.target.checked)} className="mt-1" />
                <label htmlFor="terms" className="text-xs text-gray-600">Acepto los <a href="#" className="text-blue-600 underline">Términos y Condiciones</a> y la <a href="#" className="text-blue-600 underline">Política de Privacidad</a>.</label>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (!isLogin && (!acceptTerms || strength.score < 0.75))}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? '¿Necesitas una cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            
            {isLogin && (
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

// Requisito visual
function Req({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={ok ? 'text-green-600 flex items-center gap-1' : 'text-gray-500 flex items-center gap-1'}>
      <svg className={ok ? 'h-3 w-3 text-green-600' : 'h-3 w-3 text-gray-400'} viewBox="0 0 20 20" fill="currentColor">
        {ok ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.95a.75.75 0 10-1.06-1.06L9 9.464 7.525 7.99a.75.75 0 10-1.06 1.06l2.005 2.006a.75.75 0 001.06 0l4.006-4.006z" clipRule="evenodd" />}
      </svg>
      {children}
    </li>
  );
}