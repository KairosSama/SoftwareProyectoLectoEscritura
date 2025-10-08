
export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-sm text-gray-800">
      <h1 className="text-2xl font-semibold mb-4">Términos y Condiciones</h1>
      <p className="mb-2">Última actualización: {new Date().toLocaleDateString()}</p>
      <p className="mb-4">Estos Términos regulan el uso de la plataforma educativa. Léelos detenidamente.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">1. Objeto</h2>
      <p className="mb-2">La plataforma facilita la gestión de estudiantes, evaluaciones y recursos pedagógicos.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">2. Cuentas</h2>
      <p className="mb-2">Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada con tu cuenta.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">3. Uso Aceptable</h2>
      <ul className="list-disc ml-5 mb-2 space-y-1">
        <li>No subir contenido ilegal, ofensivo o que viole derechos de terceros.</li>
        <li>No intentar acceder a datos de otros usuarios sin autorización.</li>
        <li>No realizar ingeniería inversa ni ataques de carga.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">4. Contenido</h2>
      <p className="mb-2">Los documentos y evaluaciones permanecen bajo la titularidad de sus autores. Concedes una licencia limitada para el procesamiento necesario dentro del servicio.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">5. Privacidad</h2>
      <p className="mb-2">El tratamiento de datos personales se describe en la Política de Privacidad.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">6. Disponibilidad</h2>
      <p className="mb-2">No se garantiza disponibilidad ininterrumpida; pueden existir mantenimientos o incidencias.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">7. Terminación</h2>
      <p className="mb-2">Podemos suspender o cerrar cuentas que incumplan estos Términos. Puedes eliminar tu cuenta en cualquier momento desde el perfil.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">8. Limitación de Responsabilidad</h2>
      <p className="mb-2">El servicio se ofrece "tal cual" sin garantías implícitas. No seremos responsables por daños indirectos o pérdida de datos.</p>
      <h2 className="text-lg font-semibold mt-6 mb-2">9. Cambios</h2>
      <p className="mb-2">Publicaremos modificaciones con antelación razonable. El uso continuado implica aceptación.</p>
      <p className="mt-8">Si tienes preguntas contáctanos en soporte@example.com.</p>
    </div>
  );
}
