import React from 'react';
import { Layout } from '../components/Layout';

export const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your alternative investments</p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <span className="text-indigo-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Invested</h3>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Value</h3>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">💎</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Return</h3>
                <p className="text-2xl font-bold text-gray-900">$0</p>
                <p className="text-sm text-gray-500">0.00%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <span className="text-4xl text-gray-300">📊</span>
              <p className="mt-4 text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Your investment activity will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};