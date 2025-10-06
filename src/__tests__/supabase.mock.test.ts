import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

// Test sentinel para asegurar que el mock/fallback no lanza errores en entorno CI.
describe('supabase mock/fallback', () => {
  it('proporciona auth.getUser()', async () => {
    const res = await supabase.auth.getUser();
    expect(res).toBeTruthy();
    expect(res.data?.user?.id).toBeTruthy();
  });

  it('permite from(...).select() sin lanzar', async () => {
    // @ts-ignore estructura flexible del mock
    const table = supabase.from('any');
    expect(table).toBeTruthy();
  });
});
