
export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-sm text-gray-800">
      <h1 className="text-2xl font-semibold mb-4">Política de Privacidad</h1>
      <p className="mb-2">Última actualización: {new Date().toLocaleDateString()}</p>
      <p className="mb-4">Esta Política describe cómo recopilamos, usamos y protegemos los datos personales en la plataforma.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">1. Datos Recopilados</h2>
      <ul className="list-disc ml-5 mb-2 space-y-1">
        <li>Identificación: nombre, correo electrónico.</li>
        <li>Académicos: evaluaciones, progreso y diagnósticos ingresados.</li>
        <li>Técnicos: logs de acceso, dirección IP, tipo de navegador (para seguridad y métricas).</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">2. Finalidades</h2>
      <ul className="list-disc ml-5 mb-2 space-y-1">
        <li>Autenticación y gestión de cuenta.</li>
        <li>Generación de reportes y estadísticas educativas.</li>
        <li>Seguridad, prevención de abuso y mejora del servicio.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">3. Base Legal</h2>
      <p className="mb-2">Interés legítimo y, cuando corresponda, consentimiento explícito (por ejemplo, comunicaciones opcionales).</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">4. Conservación</h2>
      <p className="mb-2">Los datos se conservan mientras la cuenta permanezca activa o según obligaciones legales. Al eliminar la cuenta se procede a la purga de datos según el flujo implementado.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">5. Destinatarios</h2>
      <p className="mb-2">Proveedores de infraestructura (p.ej. Supabase) bajo contratos que garantizan confidencialidad y seguridad.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">6. Derechos</h2>
      <ul className="list-disc ml-5 mb-2 space-y-1">
        <li>Acceso, rectificación, eliminación y portabilidad.</li>
        <li>Oposición o limitación al tratamiento en ciertos casos.</li>
        <li>Presentar reclamos ante la autoridad de control aplicable.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">7. Seguridad</h2>
      <p className="mb-2">Aplicamos cifrado en tránsito, control de acceso y políticas de contraseñas robustas.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">8. Cookies</h2>
      <p className="mb-2">Utilizamos almacenamiento local/sesión y cookies estrictamente necesarias para mantener la sesión y preferencias básicas.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">9. Cambios</h2>
      <p className="mb-2">Las modificaciones se publicarán en esta página con fecha de actualización.</p>
      <p className="mt-8">Consultas: privacidad@example.com.</p>
    </div>
  );
}
