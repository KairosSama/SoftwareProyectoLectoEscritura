
import { createClient } from '@supabase/supabase-js';

// Detectamos entorno de test (Vitest) para evitar requerir variables reales.
// import.meta.vitest se inyecta sólo durante pruebas.
// En ese caso exponemos un mock mínimo con la interfaz necesaria.
// Esto evita el error: "supabaseUrl is required" en CI cuando no hay .env.
// Si en el futuro se quieren tests de integración reales, se podrá añadir
// una rama que verifique la presencia de las variables y use el cliente real.
// Nota: Este mock devuelve estructuras vacías y valores predecibles.
// Sólo cubre los métodos usados en mockData.ts y hooks asociados.

// Detección robusta de entorno de test:
// - import.meta.vitest (propiedad oficial de Vitest)
// - process.env.VITEST (fallback)
// - process.env.NODE_ENV === 'test'
// - import.meta.env.MODE === 'test'
// Cualquiera de estos activa el modo mock si además faltan las env reales.
const isVitestFlag = Boolean((import.meta as any).vitest);
// Comprobamos de forma segura la existencia de process (Node / Vitest)
const isProcessTest = typeof process !== 'undefined' && !!(process.env?.VITEST || process.env?.NODE_ENV === 'test');
const isModeTest = Boolean((import.meta as any).env?.MODE === 'test');
const isTest = isVitestFlag || isProcessTest || isModeTest;

// Factoría interna para permitir testear ramas (test / fallback / estricto / real)
export function __createSupabaseInternal(opts: {
	isTest: boolean;
	supabaseUrl?: string;
	supabaseAnonKey?: string;
	strict?: boolean;
}): any { // eslint-disable-line @typescript-eslint/no-explicit-any
	if (opts.isTest) {
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
		return {
			auth: { getUser: async () => ({ data: { user: { id: 'test-user' } }, error: null }) },
			from: (_table: string) => makeBuilder([])
		};
	}

	if (!opts.supabaseUrl || !opts.supabaseAnonKey) {
		if (opts.strict) {
			throw new Error('Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY (STRICT_SUPABASE_ENV)');
		}
		// eslint-disable-next-line no-console
		console.warn('[supabase] Variables de entorno ausentes, usando mock inofensivo. Configure VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.');
		return {
			auth: { getUser: async () => ({ data: { user: { id: 'fallback-user' } }, error: null }) },
			from: () => ({
				select: () => ({ then: (r: any) => Promise.resolve(r({ data: [], error: null })) }), // eslint-disable-line @typescript-eslint/no-explicit-any
				eq: () => ({ then: (r: any) => Promise.resolve(r({ data: [], error: null })) }),
				order: () => ({ then: (r: any) => Promise.resolve(r({ data: [], error: null })) }),
				insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'inserted-id' }, error: null }) }) }),
				single: () => Promise.resolve({ data: null, error: null })
			})
		} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
	}
	return createClient(opts.supabaseUrl, opts.supabaseAnonKey);
}

// Declaramos la variable exportada usando entorno real
let supabase: any; // eslint-disable-line @typescript-eslint/no-explicit-any
if (isTest) {
	supabase = __createSupabaseInternal({ isTest: true });
} else {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
	const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
	// @ts-ignore
	const strict = (typeof process !== 'undefined' && process.env && process.env.STRICT_SUPABASE_ENV === 'true');
	supabase = __createSupabaseInternal({ isTest: false, supabaseUrl, supabaseAnonKey, strict });
}

export { supabase };