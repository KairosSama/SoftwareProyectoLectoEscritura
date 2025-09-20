import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search } from 'lucide-react';

function Assessments() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-2">
            Create and manage student evaluations across all literacy stages
          </p>
        </div>
      </div>

      {/* Assessment Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((stage) => (
          <div
            key={stage}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stage {stage}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {stage === 1 && 'Photo recognition, selection, matching, and basic categorization'}
              {stage === 2 && 'Advanced categorization and temporal sequences'}
              {stage === 3 && 'Complex pattern recognition and logical sequences'}
              {stage === 4 && 'Abstract concepts and advanced literacy skills'}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Assessment blocks: {stage === 1 ? '6' : stage === 2 ? '4' : stage === 3 ? '3' : '5'}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Assessments</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search assessments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="text-center py-12">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assessments yet
          </h3>
          <p className="text-gray-600 mb-6">
            Assessments will appear here once you start evaluating students
          </p>
          <Link
            to="/students"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Select Student to Assess</span>
          </Link>
        </div>
      </div>

      {/* Assessment Guidelines */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Assessment Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-blue-900">SA - Without Support</span>
            </div>
            <p className="text-blue-800 text-sm">
              Student demonstrates skill independently without any assistance
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-blue-900">AP - With Support</span>
            </div>
            <p className="text-blue-800 text-sm">
              Student can perform with guidance, prompts, or assistance
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-blue-900">NP - Not Achieved</span>
            </div>
            <p className="text-blue-800 text-sm">
              Student cannot demonstrate the skill even with support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assessments;