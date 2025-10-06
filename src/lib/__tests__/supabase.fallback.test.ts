import { describe, it, expect, vi, beforeEach } from 'vitest';
import { __createSupabaseInternal } from '../supabase';

// Import dinámico dentro de cada test para forzar re-evaluación del módulo con distintos entornos.
function clearSupabaseModule() {
  vi.resetModules();
}

describe('supabase fallback / strict env behaviour', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    clearSupabaseModule();
    process.env = { ...ORIGINAL_ENV }; // reset
    delete process.env.STRICT_SUPABASE_ENV;
  });

  it('usa mock de fallback cuando faltan variables y STRICT no está activo', async () => {
    const client = __createSupabaseInternal({ isTest: false });
    const res = await client.auth.getUser();
    expect(res.data.user.id).toBe('fallback-user');
  });

  it('lanza error si faltan variables y STRICT_SUPABASE_ENV=true', async () => {
    expect(() => __createSupabaseInternal({ isTest: false, strict: true })).toThrow('Faltan variables');
  });
});
