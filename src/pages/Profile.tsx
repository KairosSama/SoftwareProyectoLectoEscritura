import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Edit2, Save, X } from 'lucide-react';

function Profile() {
  const { user } = useAuth();
  const { updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  // Eliminar cuenta vía endpoint seguro (serverless) que usa la service key
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('No se pudo obtener la sesión actual');
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hard: true })
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || 'Fallo al eliminar la cuenta');
      }
      setShowDeleteModal(false);
      alert('Tu cuenta y todos tus datos han sido eliminados.');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e: any) {
      alert('Error al eliminar la cuenta: ' + (e.message || 'desconocido'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    // Here you would normally save to the database
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Perfil</h1>
        <p className="text-gray-600 mt-2">
          Administra la información y preferencias de tu cuenta
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-3xl">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="text-xl font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent pb-1"
                />
              ) : (
                <h3 className="text-xl font-semibold text-gray-900">{user?.fullName}</h3>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 capitalize">{user?.role === 'teacher' ? 'Profesor' : user?.role === 'authenticated' ? 'Profesor' : user?.role}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Correo Electrónico
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Rol
              </label>
              <p className="text-gray-900 capitalize">{user?.role === 'teacher' ? 'Profesor' : user?.role === 'authenticated' ? 'Profesor' : user?.role}</p>
              <p className="text-sm text-gray-500 mt-1">
                Contacta al administrador para cambiar tu rol
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Cuenta</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Cambiar Contraseña</h3>
              <p className="text-sm text-gray-600">Actualiza la contraseña de tu cuenta</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Cambiar Contraseña
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Notificaciones por Correo</h3>
              <p className="text-sm text-gray-600">Recibe actualizaciones sobre evaluaciones y reportes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Autenticación en Dos Pasos</h3>
              <p className="text-sm text-gray-600">Agrega una capa extra de seguridad a tu cuenta</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Activar 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Modal cambio de contraseña */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>!pwdSaving && setShowPwdModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h3>
            {pwdErr && <div className="text-sm text-red-600">{pwdErr}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
                <input type="password" value={pwd1} onChange={e=>setPwd1(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
                <input type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button disabled={pwdSaving} className="px-4 py-2 text-sm rounded border" onClick={()=> setShowPwdModal(false)}>Cancelar</button>
              <button
                disabled={pwdSaving}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={async ()=>{
                  if (pwd1.length < 8) { setPwdErr('Min 8 caracteres'); return; }
                  if (pwd1 !== pwd2) { setPwdErr('No coinciden'); return; }
                  setPwdErr('');
                  setPwdSaving(true);
                  try {
                    await updatePassword(pwd1);
                    alert('Contraseña actualizada');
                    setShowPwdModal(false);
                    setPwd1(''); setPwd2('');
                  } catch(e:any){ setPwdErr(e.message || 'Error'); }
                  finally{ setPwdSaving(false);} 
                }}
              >{pwdSaving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Zona de Riesgo</h2>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-medium text-red-900 mb-2">Eliminar cuenta</h3>
          <p className="text-sm text-red-700 mb-4">
            Elimina tu cuenta de usuario y <b>todos</b> tus datos asociados (estudiantes, informes, evaluaciones, etc). Esta acción no se puede deshacer. Podrás volver a registrarte con el mismo correo, pero no recuperarás tus datos anteriores.
          </p>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors duration-200"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            Eliminar cuenta
          </button>
        </div>
        {/* Modal de confirmación */}
        <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="fixed inset-0 flex items-center justify-center min-h-screen px-4 z-10">
            {/* Fondo oscuro */}
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 z-20 w-full max-w-md mx-auto">
              <Dialog.Title className="text-lg font-bold text-red-700 mb-2">¿Eliminar tu cuenta?</Dialog.Title>
              <Dialog.Description className="mb-4 text-gray-700">
                ¿Estás seguro que deseas eliminar tu cuenta y <b>todos</b> tus datos asociados? Esta acción no se puede deshacer.
              </Dialog.Description>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando...' : 'Sí'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

export default Profile;