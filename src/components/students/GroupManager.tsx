import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { type Student } from '../../lib/mockData';
import { addStudentToGroup, createGroup, deleteGroup, getGroupWithStudents, listGroups, removeStudentFromGroup, renameGroup, type StudentGroup } from '../../lib/groups';
import { supabase } from '../../lib/supabase';

interface Props {
  students: Student[];
}

const GroupManager: React.FC<Props> = ({ students }) => {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [renaming, setRenaming] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      try { await supabase.auth.getSession(); } catch {}
      const gs = await listGroups();
      setGroups(gs);
      if (!selectedGroupId && gs.length) setSelectedGroupId(gs[0].id);
    } catch (e:any) {
      setError(e.message || 'Error cargando grupos');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (gid: string) => {
    if (!gid) { setMemberIds(new Set()); return; }
    try {
      const { studentIds } = await getGroupWithStudents(gid);
      setMemberIds(new Set(studentIds));
    } catch (e:any) {
      setError(e.message || 'Error cargando miembros');
    }
  };

  useEffect(() => { void loadGroups(); }, []);
  useEffect(() => { if (selectedGroupId) void loadMembers(selectedGroupId); }, [selectedGroupId]);

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const g = await createGroup(newGroupName.trim(), u?.user?.id);
      setNewGroupName('');
      await loadGroups();
      setSelectedGroupId(g.id);
    } catch (e:any) {
      setError(e.message || 'No se pudo crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gid: string) => {
    if (!gid) return;
    if (!confirm('¿Eliminar este grupo y sus membresías?')) return;
    try {
      setLoading(true);
      await deleteGroup(gid);
      await loadGroups();
      if (selectedGroupId === gid) setSelectedGroupId(groups.find(g => g.id !== gid)?.id || '');
    } catch (e:any) {
      setError(e.message || 'No se pudo eliminar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudent = async (sid: string) => {
    const gid = selectedGroupId;
    if (!gid) return;
    try {
      if (memberIds.has(sid)) {
        await removeStudentFromGroup(gid, sid);
        const next = new Set(memberIds); next.delete(sid); setMemberIds(next);
      } else {
        await addStudentToGroup(gid, sid);
        const next = new Set(memberIds); next.add(sid); setMemberIds(next);
      }
    } catch (e:any) {
      setError(e.message || 'No se pudo actualizar el grupo');
    }
  };

  const handleRename = async (gid: string) => {
    if (!renaming.trim()) return setRenaming('');
    try {
      await renameGroup(gid, renaming.trim());
      setRenaming('');
      await loadGroups();
    } catch (e:any) {
      setError(e.message || 'No se pudo renombrar');
    }
  };

  const selectedGroup = useMemo(() => groups.find(g => g.id === selectedGroupId) || null, [groups, selectedGroupId]);

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Grupos de Estudiantes</h2>
        {selectedGroupId && (
          <button title="Eliminar grupo" onClick={() => handleDelete(selectedGroupId)} className="inline-flex items-center gap-1 text-red-600 text-sm hover:underline">
            <Trash2 className="h-4 w-4" /> Eliminar grupo
          </button>
        )}
      </div>

      {/* Crear grupo */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          value={newGroupName}
          onChange={(e)=>setNewGroupName(e.target.value)}
          placeholder="Nombre del nuevo grupo"
          className="border rounded-md px-3 py-2 w-full"
        />
        <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={loading || !newGroupName.trim()}>
          <Plus className="h-4 w-4" /> Crear
        </button>
      </div>

      {/* Seleccionar grupo */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
        <label className="text-sm text-gray-600">Seleccionar grupo</label>
        <select className="border rounded-md px-3 py-2 w-full sm:w-auto" value={selectedGroupId} onChange={e=>setSelectedGroupId(e.target.value)}>
          <option value="">— Ninguno —</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {selectedGroup && (
          <div className="flex items-center gap-2">
            <input className="border rounded-md px-2 py-1 text-sm" placeholder="Renombrar" value={renaming} onChange={e=>setRenaming(e.target.value)} />
            <button onClick={()=>handleRename(selectedGroup.id)} className="text-sm text-blue-600 hover:underline">Guardar nombre</button>
          </div>
        )}
      </div>

      {/* Lista de estudiantes con toggles */}
      {selectedGroup ? (
        <div>
          <p className="text-sm text-gray-600 mb-2">Añade o quita estudiantes del grupo. Si ya pertenece, no se duplica. Pulsa la X para quitar.</p>
          <ul className="divide-y divide-gray-100 border rounded-md">
            {students.map(s => {
              const inGroup = memberIds.has(s.id);
              return (
                <li key={s.id} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="font-medium text-gray-800">{s.full_name}</div>
                    <div className="text-xs text-gray-500">{s.diagnosis}</div>
                  </div>
                  <div>
                    {inGroup ? (
                      <button onClick={()=>handleToggleStudent(s.id)} className="inline-flex items-center gap-1 text-red-600 text-sm hover:underline" title="Quitar del grupo">
                        <X className="h-4 w-4" /> Quitar
                      </button>
                    ) : (
                      <button onClick={()=>handleToggleStudent(s.id)} className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline" title="Agregar al grupo">
                        <Plus className="h-4 w-4" /> Agregar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="text-sm text-gray-600">Crea y selecciona un grupo para gestionar sus integrantes.</div>
      )}

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default GroupManager;
