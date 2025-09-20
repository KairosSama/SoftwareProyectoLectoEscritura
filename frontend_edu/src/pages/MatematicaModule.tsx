import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Plus, Search } from 'lucide-react';

function MatematicaModule() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Matemática Funcional</h1>
          <p className="text-gray-600 mt-2">
            Evaluación del desarrollo de habilidades matemáticas funcionales
          </p>
        </div>
      </div>

      {/* Assessment Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            stage: 1,
            title: 'Conceptos Básicos',
            description: 'Correspondencia 1 a 1, clasificación por atributos y patrones',
            blocks: 5
          },
          {
            stage: 2,
            title: 'Los Números',
            description: 'Reconocimiento, conteo, comparación y secuencias numéricas',
            blocks: 6
          },
          {
            stage: 3,
            title: 'Problemas Aditivos',
            description: 'Adición, sustracción y resolución de problemas simples',
            blocks: 5
          },
          {
            stage: 4,
            title: 'Problemas Multiplicativos',
            description: 'Multiplicación, división y tablas básicas',
            blocks: 5
          },
          {
            stage: 5,
            title: 'Manejo del Dinero',
            description: 'Reconocimiento, equivalencias y problemas con dinero',
            blocks: 5
          }
        ].map((stageInfo) => (
          <div
            key={stageInfo.stage}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Etapa {stageInfo.stage}
            </h3>
            <h4 className="text-sm font-medium text-green-600 mb-2">
              {stageInfo.title}
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              {stageInfo.description}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Bloques de evaluación: {stageInfo.blocks}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Evaluaciones Recientes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="text-center py-12">
          <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay evaluaciones aún
          </h3>
          <p className="text-gray-600 mb-6">
            Las evaluaciones aparecerán aquí una vez que comiences a evaluar estudiantes
          </p>
          <Link
            to="/students"
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Seleccionar Estudiante para Evaluar</span>
          </Link>
        </div>
      </div>

      {/* Assessment Guidelines */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          Guía de Evaluación Matemática
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-900">SA - Sin Apoyo</span>
            </div>
            <p className="text-green-800 text-sm">
              El estudiante resuelve el problema matemático de forma independiente
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-green-900">AP - Con Apoyo</span>
            </div>
            <p className="text-green-800 text-sm">
              El estudiante necesita material concreto, pistas o guía para resolver
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-green-900">NP - No Logrado</span>
            </div>
            <p className="text-green-800 text-sm">
              El estudiante no puede resolver el problema incluso con apoyo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatematicaModule;