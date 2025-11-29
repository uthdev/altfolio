import { Investment } from '../models/Investment';
import { Types } from 'mongoose';

interface AnalyticsFilters {
  ownerId?: string;
}

export class AnalyticsService {
  static async getSummary(filters: AnalyticsFilters = {}) {
    // Build query based on filters
    const query: Record<string, unknown> = {};
    if (filters.ownerId) {
      query.owners = new Types.ObjectId(filters.ownerId);
    }

    const investments = await Investment.find(query).populate('owners', 'name email');
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalCurrentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Group by asset type
    const assetTypeMap = investments.reduce((acc, inv) => {
      if (!acc[inv.assetType]) {
        acc[inv.assetType] = {
          count: 0,
          totalInvested: 0,
          totalCurrentValue: 0,
        };
      }
      acc[inv.assetType]!.count++;
      acc[inv.assetType]!.totalInvested += inv.investedAmount;
      acc[inv.assetType]!.totalCurrentValue += inv.currentValue;
      return acc;
    }, {} as Record<string, { count: number; totalInvested: number; totalCurrentValue: number }>);

    const byAssetType = Object.entries(assetTypeMap).map(([assetType, data]) => ({
      assetType: assetType as 'Startup' | 'Crypto Fund' | 'Farmland' | 'Collectible' | 'Other',
      ...data,
    }));

    // Monthly investment timeline with cumulative values
    const monthlyData = investments.reduce((acc, inv) => {
      const month = inv.investmentDate.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { totalInvested: 0, totalCurrentValue: 0 };
      }
      acc[month].totalInvested += inv.investedAmount;
      acc[month].totalCurrentValue += inv.currentValue;
      return acc;
    }, {} as Record<string, { totalInvested: number; totalCurrentValue: number }>);

    // Convert to array and sort by month
    const sortedMonths = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Make timeline cumulative
    let cumulativeInvested = 0;
    let cumulativeCurrentValue = 0;
    const timeline = sortedMonths.map(item => {
      cumulativeInvested += item.totalInvested;
      cumulativeCurrentValue += item.totalCurrentValue;
      return {
        month: item.month,
        totalInvested: cumulativeInvested,
        totalCurrentValue: cumulativeCurrentValue,
      };
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalReturn,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      byAssetType,
      timeline,
    };
  }
}