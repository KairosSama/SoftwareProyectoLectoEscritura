import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  FileText,
  UploadCloud,
  Search,
  Trash2,
  Download,
  Eye,
  X,
  Edit3,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// Eliminamos persistencia en localStorage para documentos personales y los movemos a Supabase Storage + tabla
// (student_documents). Si más adelante se añade una tabla específica user_documents se puede ajustar aquí.
// import { getFromStorage, saveToStorage } from '../lib/mockData';


type DocType = 'pdf' | 'txt' | 'image' | 'note' | 'other';

type StoredDoc = {
  id: string;
  name: string;
  type: DocType;
  size: number;
  created_at: string;
  updated_at: string;
  dataUrl?: string;  // puede ser data:URL o ruta estática (ej. /global-docs/...pdf)
  text?: string;
  mime?: string;
  readonly?: boolean;
  category?: 'lectoescritura' | 'matematicas'; // Secciones
};



function userKeyFor(email?: string | null) {
  return email ? `documents_user_${email}` : 'documents_user_local';
}

// Muestra "—" cuando el tamaño es 0/desconocido (archivos estáticos del /public)
function bytesToNice(n: number) {
  if (!n || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function detectType(mime = '', fallbackName = ''): DocType {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || /\.pdf$/i.test(fallbackName)) return 'pdf';
  if (mime.startsWith('text/') || /\.txt$/i.test(fallbackName)) return 'txt';
  return 'other';
}




// Obtiene archivos de Supabase Storage agrupados por categoría
interface SupabaseListedFile { name: string; id?: string; updated_at?: string; created_at?: string; metadata?: { size?: number; mimetype?: string }; }
async function fetchSupabaseDocs(category: 'lectoescritura' | 'matematicas') {
  const { data } = await supabase.storage.from('global-docs').list(category + '/', { limit: 100, offset: 0 });
  return (data || [])
    .filter((f: SupabaseListedFile) => f.name && !f.name.endsWith('/'))
    .map((f: SupabaseListedFile) => ({
      name: f.name,
      path: `${category}/${f.name}`,
      type: detectType(f.metadata?.mimetype, f.name),
      size: f.metadata?.size || 0,
      updated_at: f.updated_at || new Date().toISOString(),
      category,
      mime: f.metadata?.mimetype,
    }));
}



export default function Documents() {
  const { user } = useAuth();
  // const USER_KEY = userKeyFor(user?.email);

  const [globalDocs, setGlobalDocs] = useState<StoredDoc[]>([]);
  const [userDocs, setUserDocs] = useState<StoredDoc[]>([]); // ahora viene de Supabase
  const [loadingUserDocs, setLoadingUserDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const [previewDoc, setPreviewDoc] = useState<StoredDoc | null>(null);
  const [isEditingNameId, setIsEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Guard para evitar dobles aperturas del file picker
  const isOpeningRef = useRef(false);

  // ------- Inicializar y cargar -------

  // Cargar documentos institucionales desde Supabase Storage
  useEffect(() => {
    async function loadGlobalDocs() {
      const lecto = await fetchSupabaseDocs('lectoescritura');
      const mate = await fetchSupabaseDocs('matematicas');
      // Asignar id y readonly
      const now = new Date().toISOString();
      const docs = [
        ...lecto.map((d: any) => ({
          ...d,
          id: `${d.category}-${d.name}`,
          created_at: d.updated_at || now,
          readonly: true,
        })),
  ...mate.map((d: any) => ({
          ...d,
          id: `${d.category}-${d.name}`,
          created_at: d.updated_at || now,
          readonly: true,
        })),
      ];
      setGlobalDocs(docs);
      // Debug para pruebas: confirmar carga
      // eslint-disable-next-line no-console
      console.log('[Documents] Global docs cargados:', docs.map(d => d.name));
    }
    loadGlobalDocs();
  }, []);

  // Cargar documentos personales desde Supabase Storage + tabla student_documents.
  useEffect(() => {
    if (!user) return;
    async function loadUserDocs() {
      setLoadingUserDocs(true);
      setError(null);
      try {
        // 1. Obtener filas de la tabla (para garantizar que sólo mostramos lo registrado).
        const { data: rows, error: dbErr } = await supabase
          .from('student_documents')
          .select('id, file_url, uploaded_at')
          .eq('created_by', user.id)
          .order('uploaded_at', { ascending: false });
        if (dbErr) throw dbErr;
  const fileSet = new Set((rows || []).map((r: any) => r.file_url as string));
        // 2. Listar objetos en el bucket user_docs bajo el prefijo user.id/
        const { data: storageList, error: listErr } = await supabase.storage
          .from('user_docs')
          .list(user.id + '/', { limit: 200 });
        if (listErr) throw listErr;
        const now = new Date().toISOString();
        const docs: StoredDoc[] = [];
  (storageList || []).forEach((f: any) => {
          if (!f.name || f.name.endsWith('/')) return;
            const fullPath = `${user.id}/${f.name}`;
            if (!fileSet.has(fullPath)) {
              // Objeto huérfano (aún no registrado en tabla) – opcionalmente podríamos insertar una fila aquí.
              return;
            }
            // Extraer nombre original tras '_' (formato timestamp_originalName.ext); ya puede venir sanitizado
            let original = f.name.includes('_') ? f.name.substring(f.name.indexOf('_') + 1) : f.name;
            // Nada que decodificar (no usamos encodeURIComponent) pero mantenemos hook para futuro.
            docs.push({
              id: fullPath, // usamos path como id local (id real está en la tabla si se necesitara otra consulta)
              name: original,
              type: detectType(f.metadata?.mimetype, original),
              size: f.metadata?.size || 0,
              created_at: f.updated_at || now,
              updated_at: f.updated_at || now,
              mime: f.metadata?.mimetype,
              readonly: false,
            });
        });
        setUserDocs(docs);
      } catch (e: any) {
        setError(e.message || 'Error cargando documentos personales');
      } finally {
        setLoadingUserDocs(false);
      }
    }
    loadUserDocs();
  }, [user]);

  // ------- Persistencia -------
  // Ya no persistimos en local; mantenemos helper por compatibilidad si se quisiera cachear.
  const refreshUserDocs = async () => {
    if (!user) return;
    setLoadingUserDocs(true);
    try {
      const { data: rows, error: dbErr } = await supabase
        .from('student_documents')
        .select('id, file_url, uploaded_at')
        .eq('created_by', user.id)
        .order('uploaded_at', { ascending: false });
      if (dbErr) throw dbErr;
  const fileSet = new Set((rows || []).map((r: any) => r.file_url as string));
      const { data: storageList, error: listErr } = await supabase.storage
        .from('user_docs')
        .list(user.id + '/', { limit: 200 });
      if (listErr) throw listErr;
      const now = new Date().toISOString();
      const docs: StoredDoc[] = [];
  (storageList || []).forEach((f: any) => {
        if (!f.name || f.name.endsWith('/')) return;
        const fullPath = `${user.id}/${f.name}`;
        if (!fileSet.has(fullPath)) return;
  let original = f.name.includes('_') ? f.name.substring(f.name.indexOf('_') + 1) : f.name;
        docs.push({
          id: fullPath,
          name: original,
          type: detectType(f.metadata?.mimetype, original),
          size: f.metadata?.size || 0,
          created_at: f.updated_at || now,
          updated_at: f.updated_at || now,
          mime: f.metadata?.mimetype,
          readonly: false,
        });
      });
      setUserDocs(docs);
    } catch (e: any) {
      setError(e.message || 'Error refrescando documentos');
    } finally {
      setLoadingUserDocs(false);
    }
  };

  // ------- Filtros (búsqueda por nombre) -------
  const byQuery = (docs: StoredDoc[]) => {
    const q = query.trim().toLowerCase();
    const base = docs
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return q ? base.filter(d => d.name.toLowerCase().includes(q)) : base;
  };

  // Globales separados por categoría
  const filteredGlobalLecto = useMemo(
    () => byQuery(globalDocs.filter(d => d.category === 'lectoescritura')),
    [globalDocs, query]
  );
  const filteredGlobalMate = useMemo(
    () => byQuery(globalDocs.filter(d => d.category === 'matematicas')),
    [globalDocs, query]
  );

  const filteredUser = useMemo(() => byQuery(userDocs), [userDocs, query]);

  // ------- Drag & Drop (sube a Mis documentos) -------
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer?.files || null;
      onFilesSelected(files);
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [userDocs]);

  // ------- Subida por input / Drag&Drop -------
  const onFilesSelected = async (files: FileList | null) => {
    if (!files || !files.length || !user) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        // Sanitizar nombre para evitar 400 Invalid key (acentos, espacios y caracteres fuera de rango)
        const sanitizedName = file.name
          .normalize('NFD')
          .replace(/\p{Diacritic}+/gu, '')
          .replace(/[^a-zA-Z0-9._-]+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '');
        const path = `${user.id}/${Date.now()}_${sanitizedName}`;
        const { error: upErr } = await supabase.storage.from('user_docs').upload(path, file);
        if (upErr) throw upErr;
        // Registrar en la tabla (student_documents reutilizada; si hay columna student_id se puede dejar null)
        const { error: insErr } = await supabase.from('student_documents').insert({
          student_id: null,
          file_url: path,
          created_by: user.id
        });
        if (insErr) throw insErr;
      }
      await refreshUserDocs();
    } catch (e: any) {
      setError(e.message || 'Error subiendo archivos');
    } finally {
      setUploading(false);
    }
  };

  // ------- Acciones comunes -------
  // Descarga archivos institucionales desde Supabase Storage (privado)
  const handleDownload = async (doc: StoredDoc) => {
    if (doc.readonly && doc.category && doc.name) {
      // Generar URL firmada
  const { data } = await supabase.storage.from('global-docs').createSignedUrl(`${doc.category}/${doc.name}`, 60);
      if (data?.signedUrl) {
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      } else {
        alert('No se pudo obtener el enlace de descarga.');
        return;
      }
    }
    // Documentos personales en Storage (nueva lógica): generar URL firmada
    if (!doc.readonly) {
      // Si teníamos todavía dataUrl (caso legacy) lo usamos, sino signed URL
      if (doc.dataUrl) {
        const a = document.createElement('a');
        a.href = doc.dataUrl;
        a.download = doc.name || 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      // id contiene path completo userId/archivo
      const { data, error: urlErr } = await supabase.storage.from('user_docs').createSignedUrl(doc.id, 60);
      if (urlErr || !data?.signedUrl) {
        alert('No se pudo generar enlace de descarga del documento personal.');
        return;
      }
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = doc.name || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    if (doc.text) {
      const blob = new Blob([doc.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (doc.name || 'nota').replace(/\.[^.]+$/, '') + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  // ------- Acciones personales -------
  const handleDeleteUser = async (id: string) => {
    if (!user) return;
    setError(null);
    // id es el path completo
    try {
      const path = id; // ya path
      // Borrar objeto storage
      await supabase.storage.from('user_docs').remove([path]);
      // Borrar fila (si la id real fuera distinta necesitaríamos mapear; aquí usamos file_url como referencia)
      await supabase.from('student_documents').delete().eq('file_url', path).eq('created_by', user.id);
      await refreshUserDocs();
      if (previewDoc?.id === id) setPreviewDoc(null);
    } catch (e: any) {
      setError(e.message || 'Error eliminando documento');
    }
  };

  const saveRename = (_id: string) => {
    // Renombrar requeriría copy+delete en Storage y actualizar la fila; por ahora se omite.
    alert('Renombrar no está soportado aún para documentos remotos.');
    setIsEditingNameId(null);
    setTempName('');
  };

  // ------- Recorrer carpeta (File System Access API) -------
  async function* walkDirectory(dirHandle: any): AsyncGenerator<File> {
    // @ts-ignore
    for await (const [, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        const file = await handle.getFile();
        yield file;
      } else if (handle.kind === 'directory') {
        yield* walkDirectory(handle);
      }
    }
  }

  // ------- Abrir selector (archivos o carpeta) -------
  // Si el usuario cancela, NO se abre nada más (no fallback tras cancelación).
  const openFilePicker = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    const shift = !!e?.shiftKey;
    // @ts-ignore
    const hasOpen = typeof window.showOpenFilePicker === 'function';
    // @ts-ignore
    const hasDir = typeof window.showDirectoryPicker === 'function';

    try {
      // 1) Carpeta (Shift) con API moderna
      if (shift && hasDir) {
        try {
          // @ts-ignore
          const dirHandle = await window.showDirectoryPicker();
          const files: File[] = [];
          for await (const file of walkDirectory(dirHandle)) files.push(file);
          const dt = new DataTransfer();
          files.forEach(f => dt.items.add(f));
          await onFilesSelected(dt.files);
          return; // éxito → no fallback
        } catch {
          return; // cancelado → no abrir nada más
        }
      }

      // 2) Archivos con API moderna
      if (!shift && hasOpen) {
        try {
          // @ts-ignore
          const handles: FileSystemFileHandle[] = await window.showOpenFilePicker({
            multiple: true,
            excludeAcceptAllOption: false,
            types: [
              {
                description: 'Todos los documentos',
                accept: {
                  'application/pdf': ['.pdf'],
                  'text/plain': ['.txt', '.md', '.csv', '.log'],
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/vnd.ms-excel': ['.xls'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.ms-powerpoint': ['.ppt'],
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                },
              },
            ],
          });

          const files: File[] = [];
          for (const h of handles) {
            // @ts-ignore
            const f = await h.getFile();
            files.push(f);
          }
          const dt = new DataTransfer();
          files.forEach(f => dt.items.add(f));
          await onFilesSelected(dt.files);
          return; // éxito → no fallback
        } catch {
          return; // cancelado → no abrir nada más
        }
      }

      // 3) Fallback manual SOLO si NO hay APIs modernas disponibles
      if (shift) {
        if (dirInputRef.current) dirInputRef.current.value = '';
        dirInputRef.current?.click();
      } else {
        if (fileInputRef.current) fileInputRef.current.value = '';
        fileInputRef.current?.click();
      }
    } finally {
      setTimeout(() => { isOpeningRef.current = false; }, 150);
    }
  };

  // ------- Colgroup consistente para todas las tablas -------
  const ColGroup = () => (
    // Eliminamos nodos de texto/espacios dentro de <colgroup> para evitar el warning de React en tests
    <colgroup><col style={{ width: '50%' }} /><col style={{ width: '12%' }} /><col style={{ width: '12%' }} /><col style={{ width: '16%' }} /><col style={{ width: '10%' }} /></colgroup>
  );

  // ------- Tabla reutilizable (para globales por categoría) -------
  const GlobalTable = ({ rows }: { rows: StoredDoc[] }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      {rows.length ? (
        <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
          <ColGroup />
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Tamaño</th>
              <th className="px-4 py-2 text-left">Actualizado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-2">
                  <span className="font-medium text-gray-900">{d.name}</span>
                </td>
                <td className="px-4 py-2 uppercase">{d.type}</td>
                <td className="px-4 py-2">{bytesToNice(d.size)}</td>
                <td className="px-4 py-2">{new Date(d.updated_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded hover:bg-gray-100"
                      title="Previsualizar"
                      onClick={() => setPreviewDoc(d)}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100"
                      title="Descargar"
                      onClick={() => handleDownload(d)}
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-4 text-sm text-gray-600">No se encontraron documentos.</div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h1 className="text-xl font-semibold text-gray-900">Documentos</h1>
      </div>

      {/* Barra de acciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar documentos…"
            className="pl-9 pr-3 py-2 border rounded-md w-72"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Input nativo oculto (archivos) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,image/*,application/pdf,text/plain,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          {/* Input nativo oculto (carpeta completa) */}
          <input
            ref={dirInputRef}
            type="file"
            multiple
            // @ts-ignore – atributo no tipado en TS
            webkitdirectory=""
            className="hidden"
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            onClick={openFilePicker}
            title="Subir archivos (Shift+click para subir una carpeta)"
            type="button"
            disabled={uploading}
          >
            <UploadCloud className="h-4 w-4" />
            {uploading ? 'Subiendo…' : 'Subir'}
          </button>
        </div>
      </div>

      {/* Zona Drag & Drop */}
      <div
        ref={dropRef}
        className={`border-2 border-dashed rounded-lg p-6 text-sm ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        Arrastra y suelta PDF, TXT o imágenes aquí para subirlos a <b>Mis documentos</b> (se guardarán en la nube y sólo tú podrás verlos).
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {loadingUserDocs && <div className="mt-2 text-sm text-gray-500">Cargando tus documentos…</div>}
      </div>

      {/* Sección 1: Documentos (globales) con dos subsecciones */}
      <section className="space-y-4">
        <header className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Documentos</h2>
        </header>

        {/* Lectoescritura */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800 px-1">Lectoescritura</h3>
          <GlobalTable rows={filteredGlobalLecto} />
        </div>

        {/* Matemáticas */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800 px-1">Matemáticas</h3>
          <GlobalTable rows={filteredGlobalMate} />
        </div>
      </section>

      {/* Sección 2: Mis documentos */}
      <section className="space-y-3">
        <header className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Mis documentos</h2>
        </header>
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          {filteredUser.length ? (
            <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
              <ColGroup />
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Tamaño</th>
                  <th className="px-4 py-2 text-left">Actualizado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUser.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-2">
                      {isEditingNameId === d.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            className="border rounded px-2 py-1 text-sm"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(d.id);
                              if (e.key === 'Escape') {
                                setIsEditingNameId(null);
                                setTempName('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            title="Guardar"
                            onClick={() => saveRename(d.id)}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            title="Cancelar"
                            onClick={() => {
                              setIsEditingNameId(null);
                              setTempName('');
                            }}
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{d.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 uppercase">{d.type}</td>
                    <td className="px-4 py-2">{bytesToNice(d.size)}</td>
                    <td className="px-4 py-2">{new Date(d.updated_at).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded hover:bg-gray-100"
                          title="Previsualizar"
                          onClick={() => setPreviewDoc(d)}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-gray-100"
                          title="Descargar"
                          onClick={() => handleDownload(d)}
                        >
                          <Download className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-gray-100"
                          title="Eliminar"
                          onClick={() => handleDeleteUser(d.id)}
                          disabled={uploading}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-sm text-gray-600">{loadingUserDocs ? 'Cargando…' : 'No has subido documentos personales aún.'}</div>
          )}
        </div>
      </section>

      {/* Modal: Previsualización */}
      {previewDoc && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewDoc(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Vista previa</h3>
                </div>
                <button className="p-2 rounded hover:bg-gray-100" onClick={() => setPreviewDoc(null)}>
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="p-4">
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">{previewDoc.name}</span>{' '}
                  <span className="text-gray-500">
                    ({previewDoc.type.toUpperCase()}, {bytesToNice(previewDoc.size)})
                  </span>
                  {previewDoc.readonly && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full align-middle">
                      Institucional
                    </span>
                  )}
                </div>

                <div className="border rounded-md overflow-hidden" style={{ height: '70vh' }}>
                  {/* PDF institucional */}
                  {previewDoc.type === 'pdf' && previewDoc.readonly && previewDoc.category && previewDoc.name && (
                    <SupabasePdfPreview doc={previewDoc} />
                  )}
                  {/* PDF o imagen personal almacenada en bucket (sin dataUrl legacy) */}
                  {((previewDoc.type === 'pdf') || (previewDoc.type === 'image')) && !previewDoc.readonly && (
                    <UserStoragePreview doc={previewDoc} />
                  )}
                  {/* Legacy local (dataUrl) imagen */}
                  {previewDoc.type === 'image' && previewDoc.dataUrl && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <img src={previewDoc.dataUrl} alt={previewDoc.name} className="max-w-full max-h-full" />
                    </div>
                  )}
                  {(previewDoc.type === 'txt' || previewDoc.type === 'note') && (
                    <textarea className="w-full h-full p-3 text-sm bg-white" readOnly defaultValue={previewDoc.text ?? ''} />
                  )}
                  {previewDoc.type === 'other' && (
                    <div className="p-4 text-sm text-gray-600">
                      Tipo de archivo no soportado para vista previa. Puedes descargarlo para abrirlo localmente.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
                <button className="px-3 py-2 rounded border hover:bg-gray-50" onClick={() => handleDownload(previewDoc)}>
                  <Download className="h-4 w-4 inline mr-1" />
                  Descargar
                </button>
                {!previewDoc.readonly && (
                  <button
                    className="px-3 py-2 rounded border text-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleDeleteUser(previewDoc.id);
                      setPreviewDoc(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para previsualizar PDF institucional desde Supabase Storage
function SupabasePdfPreview({ doc }: { doc: StoredDoc }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    async function getUrl() {
      const { data } = await supabase.storage.from('global-docs').createSignedUrl(`${doc.category}/${doc.name}`, 60);
      if (mounted) setUrl(data?.signedUrl || null);
    }
    getUrl();
    return () => { mounted = false; };
  }, [doc]);
  if (!url) return <div className="p-4 text-gray-500">Cargando vista previa…</div>;
  return <iframe title="PDF" src={url} className="w-full h-full" />;
}

// Vista previa para documentos personales almacenados en user_docs (PDF o imagen)
function UserStoragePreview({ doc }: { doc: StoredDoc }) {
  const [url, setUrl] = useState<string | null>(null);
  const isPdf = doc.type === 'pdf';
  const isImage = doc.type === 'image';
  useEffect(() => {
    let mounted = true;
    async function getUrl() {
      const { data, error } = await supabase.storage.from('user_docs').createSignedUrl(doc.id, 60);
      if (mounted) setUrl(error ? null : data?.signedUrl || null);
    }
    getUrl();
    return () => { mounted = false; };
  }, [doc.id]);
  if (!url) return <div className="p-4 text-gray-500">Cargando vista previa…</div>;
  if (isPdf) return <iframe title="PDF" src={url} className="w-full h-full" />;
  if (isImage) return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <img src={url} alt={doc.name} className="max-w-full max-h-full" />
    </div>
  );
  return <div className="p-4 text-sm text-gray-600">Vista previa no disponible.</div>;
}

