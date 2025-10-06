import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface StudentPDFUploadProps {
  studentId: string;
  onUpload?: () => void;
}

const BUCKET_NAME = 'student-pdfs';

export default function StudentPDFUpload({ studentId, onUpload }: StudentPDFUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSuccess(false);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return; // sin archivo no hacemos nada
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Asegurarnos de tener un usuario (el contexto puede tardar en hidratarse)
      let currentUser = user as any;
      if (!currentUser) {
        try {
          const { data } = await supabase.auth.getUser();
          currentUser = data?.user;
        } catch (_) {
          /* ignorar */
        }
      }
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      const filePath = `${studentId}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const fileUrl = data?.path ? data.path : filePath;
      const { data: docData, error: dbError } = await supabase
        .from('student_documents')
        .insert([
          {
            student_id: studentId,
            file_url: fileUrl,
            created_by: currentUser.id
          }
        ])
        .select();
      if (dbError) throw dbError;

      // Llamar a la Edge Function para extraer texto (no bloqueamos éxito si falla)
      const documentId = docData?.[0]?.id;
      if (documentId) {
        try {
          await fetch('https://<TU-PROYECTO>.functions.supabase.co/extract-pdf-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentId,
              fileUrl: supabase.storage.from(BUCKET_NAME).getPublicUrl(fileUrl).data.publicUrl
            })
          });
        } catch (_) {
          // Silenciamos errores de la función edge para no impedir feedback al usuario
        }
      }
      setSuccess(true);
      setFile(null);
      if (onUpload) onUpload();
    } catch (err: any) {
      setError(err?.message || 'Error al subir el PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">Subir PDF del estudiante</h3>
  <input aria-label="PDF" type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? 'Subiendo...' : 'Subir PDF'}
      </button>
      {success && <p className="text-green-600 mt-2">PDF subido correctamente.</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}