// Grupo de estudiantes: almacenamiento y funciones helper.
// Usamos Supabase si la tabla existe, de lo contrario localStorage como fallback igual que mockData.
import { supabase } from './supabase';
import { getFromStorage, saveToStorage } from './mockData';

export interface StudentGroup {
  id: string; // uuid
  name: string;
  created_at: string;
  created_by?: string;
}

export interface GroupMembership {
  id: string; // uuid
  group_id: string;
  student_id: string;
  created_at: string;
}

const GROUPS_KEY = 'groups';
const GROUP_MEMBERS_KEY = 'group_members';

function uuid() {
  // Simple uuid v4 (no crypto para compatibilidad). Suficiente para ids de mock.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Modo Supabase detectado? Simplificación: verificamos método from y variable de entorno presente.
const hasRealSupabase = Boolean((supabase as any)?.from && import.meta.env?.VITE_SUPABASE_URL);

export async function listGroups(): Promise<StudentGroup[]> {
  if (hasRealSupabase) {
    const { data, error } = await supabase.from('student_groups').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  return (getFromStorage(GROUPS_KEY) || []) as StudentGroup[];
}

export async function createGroup(name: string, userId?: string): Promise<StudentGroup> {
  if (!name.trim()) throw new Error('Nombre requerido');
  if (hasRealSupabase) {
    const payload = { name, created_by: userId };
    const { data, error } = await supabase.from('student_groups').insert([payload]).select('*').single();
    if (error) throw error;
    return data as StudentGroup;
  }
  const groups = await listGroups();
  const g: StudentGroup = { id: uuid(), name: name.trim(), created_at: new Date().toISOString(), created_by: userId };
  const next = [...groups, g];
  saveToStorage(GROUPS_KEY, next);
  return g;
}

export async function deleteGroup(groupId: string): Promise<void> {
  if (hasRealSupabase) {
    const { error } = await supabase.from('student_groups').delete().eq('id', groupId);
    if (error) throw error;
    // Borrar membresías también
    await supabase.from('student_group_members').delete().eq('group_id', groupId);
    return;
  }
  const groups = await listGroups();
  const filtered = groups.filter(g => g.id !== groupId);
  saveToStorage(GROUPS_KEY, filtered);
  const all = (getFromStorage(GROUP_MEMBERS_KEY) || []) as GroupMembership[];
  const cleaned = all.filter(m => m.group_id !== groupId);
  saveToStorage(GROUP_MEMBERS_KEY, cleaned);
}

export async function listGroupMemberships(groupId?: string): Promise<GroupMembership[]> {
  if (hasRealSupabase) {
    let query = supabase.from('student_group_members').select('*');
    if (groupId) query = query.eq('group_id', groupId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  const all = (getFromStorage(GROUP_MEMBERS_KEY) || []) as GroupMembership[];
  return groupId ? all.filter(m => m.group_id === groupId) : all;
}

export async function addStudentToGroup(groupId: string, studentId: string): Promise<GroupMembership> {
  if (hasRealSupabase) {
    // Evitar duplicados via unique constraint idealmente (group_id, student_id)
    const { data: existing, error: existingErr } = await supabase.from('student_group_members').select('*').eq('group_id', groupId).eq('student_id', studentId);
    if (existingErr) throw existingErr;
    if (existing && existing.length) throw new Error('Estudiante ya está en el grupo');
    const payload = { group_id: groupId, student_id: studentId };
    const { data, error } = await supabase.from('student_group_members').insert([payload]).select('*').single();
    if (error) throw error;
    return data as GroupMembership;
  }
  const memberships = (getFromStorage(GROUP_MEMBERS_KEY) || []) as GroupMembership[];
  if (memberships.some(m => m.group_id === groupId && m.student_id === studentId)) {
    throw new Error('Estudiante ya está en el grupo');
  }
  const m: GroupMembership = { id: uuid(), group_id: groupId, student_id: studentId, created_at: new Date().toISOString() };
  const next = [...memberships, m];
  saveToStorage(GROUP_MEMBERS_KEY, next);
  return m;
}

export async function removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
  if (hasRealSupabase) {
    const { error } = await supabase.from('student_group_members').delete().eq('group_id', groupId).eq('student_id', studentId);
    if (error) throw error;
    return;
  }
  const memberships = (getFromStorage(GROUP_MEMBERS_KEY) || []) as GroupMembership[];
  const next = memberships.filter(m => !(m.group_id === groupId && m.student_id === studentId));
  saveToStorage(GROUP_MEMBERS_KEY, next);
}

export async function getGroupWithStudents(groupId: string): Promise<{ group: StudentGroup | null; studentIds: string[] }> {
  const groups = await listGroups();
  const group = groups.find(g => g.id === groupId) || null;
  if (!group) return { group: null, studentIds: [] };
  const memberships = await listGroupMemberships(groupId);
  return { group, studentIds: memberships.map(m => m.student_id) };
}

export async function renameGroup(groupId: string, newName: string): Promise<StudentGroup> {
  if (!newName.trim()) throw new Error('Nombre requerido');
  if (hasRealSupabase) {
    const { data, error } = await supabase.from('student_groups').update({ name: newName.trim() }).eq('id', groupId).select('*').single();
    if (error) throw error;
    return data as StudentGroup;
  }
  const groups = await listGroups();
  const updated = groups.map(g => g.id === groupId ? { ...g, name: newName.trim() } : g);
  saveToStorage(GROUPS_KEY, updated);
  const g = updated.find(g => g.id === groupId)!;
  return g;
}
