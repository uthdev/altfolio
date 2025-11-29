import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Table } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import logger from '../utils/logger';
import type { Investment, InvestmentsResponse, AssetType } from '../types';

export const InvestmentsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    assetType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const fetchInvestments = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.assetType && { assetType: filters.assetType }),
      });

      const response = await api.get<InvestmentsResponse>(`/investments?${params}`);
      setInvestments(response.data.investments);
      setPagination(response.data.pagination);
    } catch (error) {
      logger.error('Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy: key, sortOrder: direction }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getReturnColor = (invested: number, current: number) => {
    const returnValue = current - invested;
    if (returnValue > 0) return 'text-green-600';
    if (returnValue < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const columns = [
    {
      key: 'assetName',
      header: 'Asset Name',
      sortable: true,
      render: (investment: Investment) => (
        <div>
          <div className="font-medium text-gray-900">{investment.assetName}</div>
          <div className="text-sm text-gray-500">{investment.assetType}</div>
        </div>
      ),
    },
    {
      key: 'investedAmount',
      header: 'Invested',
      sortable: true,
      render: (investment: Investment) => formatCurrency(investment.investedAmount),
    },
    {
      key: 'currentValue',
      header: 'Current Value',
      sortable: true,
      render: (investment: Investment) => formatCurrency(investment.currentValue),
    },
    {
      key: 'return',
      header: 'Return',
      render: (investment: Investment) => {
        const returnValue = investment.currentValue - investment.investedAmount;
        const returnPercent = (returnValue / investment.investedAmount) * 100;
        return (
          <div className={getReturnColor(investment.investedAmount, investment.currentValue)}>
            <div className="font-medium">{formatCurrency(returnValue)}</div>
            <div className="text-sm">{returnPercent.toFixed(2)}%</div>
          </div>
        );
      },
    },
    {
      key: 'investmentDate',
      header: 'Date',
      sortable: true,
      render: (investment: Investment) => formatDate(investment.investmentDate),
    },
    {
      key: 'owners',
      header: 'Owners',
      render: (investment: Investment) => (
        <div className="text-sm">
          {investment.owners.map(owner => owner.name).join(', ')}
        </div>
      ),
    },
    ...(isAdmin ? [{
      key: 'actions',
      header: 'Actions',
      render: (investment: Investment) => (
        <div className="flex space-x-2">
          <Link
            to={`/investments/${investment._id}`}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            View
          </Link>
          <Link
            to={`/investments/${investment._id}/edit`}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(investment._id)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    }] : [{
      key: 'actions',
      header: 'Actions',
      render: (investment: Investment) => (
        <Link
          to={`/investments/${investment._id}`}
          className="text-indigo-600 hover:text-indigo-900 text-sm"
        >
          View
        </Link>
      ),
    }]),
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    
    try {
      await api.delete(`/investments/${id}`);
      fetchInvestments();
    } catch (error) {
      logger.error('Failed to delete investment:', error);
    }
  };

  const assetTypes: AssetType[] = ['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
            <p className="text-gray-600">Manage your alternative investments</p>
          </div>
          {isAdmin && (
            <Link
              to="/investments/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Investment
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type
              </label>
              <select
                value={filters.assetType}
                onChange={(e) => setFilters(prev => ({ ...prev, assetType: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          data={investments}
          columns={columns}
          onSort={handleSort}
          sortKey={filters.sortBy}
          sortDirection={filters.sortOrder}
          loading={loading}
        />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
          />
        )}
      </div>
    </Layout>
  );
};