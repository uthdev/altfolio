import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import logger from '../utils/logger';
import type { Investment } from '../types';

export const InvestmentDetailPage: React.FC = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const response = await api.get<Investment>(`/investments/${id}`);
        setInvestment(response.data);
      } catch (err: unknown) {
        const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load investment';
        logger.error('Failed to fetch investment:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !investment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Investment not found'}</p>
          <Link to="/investments" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            ← Back to Investments
          </Link>
        </div>
      </Layout>
    );
  }

  const returnValue = investment.currentValue - investment.investedAmount;
  const returnPercent = (returnValue / investment.investedAmount) * 100;
  const returnColor = returnValue > 0 ? 'text-green-600' : returnValue < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Link to="/investments" className="text-indigo-600 hover:text-indigo-800 text-sm">
              ← Back to Investments
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{investment.assetName}</h1>
            <p className="text-gray-600">{investment.assetType}</p>
          </div>
          {isAdmin && (
            <Link
              to={`/investments/${investment._id}/edit`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Edit Investment
            </Link>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invested Amount</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(investment.investedAmount)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Value</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(investment.currentValue)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Return</h3>
            <p className={`text-2xl font-bold mt-2 ${returnColor}`}>{formatCurrency(returnValue)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Return %</h3>
            <p className={`text-2xl font-bold mt-2 ${returnColor}`}>{returnPercent.toFixed(2)}%</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Investment Details */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Investment Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Asset Type</label>
                <p className="mt-1 text-sm text-gray-900">{investment.assetType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Investment Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(investment.investmentDate)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(investment.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(investment.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Owners */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Owners</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {investment.owners.map((owner) => (
                  <div key={owner.id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {owner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                      <p className="text-xs text-gray-500">{owner.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Performance Over Time</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl">📈</span>
              <p className="mt-4">Performance chart will be implemented in Phase 5</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};