import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../utils/api';
import logger from '../utils/logger';
import type { Investment, AssetType, User } from '../types';

const investmentSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required').max(100),
  assetType: z.enum(['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other']),
  investedAmount: z.number().positive('Amount must be positive'),
  investmentDate: z.string().min(1, 'Investment date is required'),
  currentValue: z.number().positive('Current value must be positive'),
  owners: z.array(z.string()).min(1, 'At least one owner is required'),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export const InvestmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      owners: [],
    },
  });

  const selectedOwners = watch('owners');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock users for now
        setUsers([
          { id: '1', name: 'Admin User', email: 'admin@altfolio.com', role: 'admin' },
          { id: '2', name: 'Viewer User', email: 'viewer@altfolio.com', role: 'viewer' },
        ]);
        
        if (isEdit && id) {
          const response = await api.get<Investment>(`/investments/${id}`);
          const investment = response.data;
          
          setValue('assetName', investment.assetName);
          setValue('assetType', investment.assetType);
          setValue('investedAmount', investment.investedAmount);
          setValue('currentValue', investment.currentValue);
          setValue('investmentDate', investment.investmentDate.split('T')[0]);
          setValue('owners', investment.owners.map(owner => owner.id));
        }
      } catch (error) {
        logger.error('Failed to fetch data:', error);
        setError('Failed to load data');
      }
    };
    
    fetchData();
  }, [id, isEdit, setValue]);



  const onSubmit = async (data: InvestmentFormData) => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...data,
        investmentDate: new Date(data.investmentDate).toISOString(),
      };

      if (isEdit) {
        await api.put(`/investments/${id}`, payload);
      } else {
        await api.post('/investments', payload);
      }

      navigate('/investments');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save investment';
      logger.error('Failed to save investment:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerToggle = (userId: string) => {
    const currentOwners = selectedOwners || [];
    const newOwners = currentOwners.includes(userId)
      ? currentOwners.filter(id => id !== userId)
      : [...currentOwners, userId];
    setValue('owners', newOwners);
  };

  const assetTypes: AssetType[] = ['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Investment' : 'Add New Investment'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name
              </label>
              <input
                {...register('assetName')}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter asset name"
              />
              {errors.assetName && (
                <p className="mt-1 text-sm text-red-600">{errors.assetName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type
              </label>
              <select
                {...register('assetType')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select asset type</option>
                {assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.assetType && (
                <p className="mt-1 text-sm text-red-600">{errors.assetType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invested Amount
                </label>
                <input
                  {...register('investedAmount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
                {errors.investedAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.investedAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value
                </label>
                <input
                  {...register('currentValue', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
                {errors.currentValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentValue.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Date
              </label>
              <input
                {...register('investmentDate')}
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.investmentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.investmentDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owners
              </label>
              <div className="space-y-2">
                {users.map(user => (
                  <label key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOwners?.includes(user.id) || false}
                      onChange={() => handleOwnerToggle(user.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))}
              </div>
              {errors.owners && (
                <p className="mt-1 text-sm text-red-600">{errors.owners.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/investments')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};