
import { createClient } from '@supabase/supabase-js';

// Detectamos entorno de test (Vitest) para evitar requerir variables reales.
// import.meta.vitest se inyecta sólo durante pruebas.
// En ese caso exponemos un mock mínimo con la interfaz necesaria.
// Esto evita el error: "supabaseUrl is required" en CI cuando no hay .env.
// Si en el futuro se quieren tests de integración reales, se podrá añadir
// una rama que verifique la presencia de las variables y use el cliente real.
// Nota: Este mock devuelve estructuras vacías y valores predecibles.
// Sólo cubre los métodos usados en mockData.ts y hooks asociados.

const isTest = Boolean((import.meta as any).vitest);
// Declaramos la variable que exportaremos al final.
let supabase: any; // eslint-disable-line @typescript-eslint/no-explicit-any

if (isTest) {
	type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
	const makeBuilder = (data: Row[] = []) => {
		const builder: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
			_data: data,
			select: () => builder,
			eq: () => builder,
			order: () => builder,
			single: () => Promise.resolve({ data: builder._data[0] ?? null, error: null }),
			insert: () => ({
				select: () => ({
					single: () => Promise.resolve({ data: { id: 'inserted-id', created_at: new Date().toISOString() }, error: null })
				})
			}),
			then: (resolve: any, reject: any) => Promise.resolve({ data: builder._data, error: null }).then(resolve, reject) // eslint-disable-line @typescript-eslint/no-explicit-any
		};
		return builder;
	};
	supabase = {
		auth: {
			getUser: async () => ({ data: { user: { id: 'test-user' } }, error: null })
		},
		from: (_table: string) => makeBuilder([])
	};
} else {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
	const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
	}
	supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };