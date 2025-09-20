import React from 'react';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';

function Reports() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track student progress and generate comprehensive reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500 mt-1">Active in program</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Assessments</h3>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500 mt-1">Completed this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Progress</h3>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0%</p>
          <p className="text-xs text-gray-500 mt-1">Across all stages</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Autonomous</h3>
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0%</p>
          <p className="text-xs text-gray-500 mt-1">Students showing independence</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Individual Progress Report
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Detailed progress analysis for individual students across all assessment stages
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Generate Report →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Class Summary Report
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Overview of class performance and progress trends over time
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Generate Report →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Download className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Assessment History
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Complete assessment history with detailed scoring and observations
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Generate Report →
          </button>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Advanced Analytics Coming Soon
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Comprehensive charts, progress tracking, and detailed analytics will be available once you start creating assessments.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reports;