import { Investment } from '../models/Investment';

export class AnalyticsService {
  static async getSummary() {
    const investments = await Investment.find();
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalCurrentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Group by asset type
    const byAssetType = investments.reduce((acc, inv) => {
      if (!acc[inv.assetType]) {
        acc[inv.assetType] = {
          count: 0,
          invested: 0,
          currentValue: 0,
        };
      }
      acc[inv.assetType]!.count++;
      acc[inv.assetType]!.invested += inv.investedAmount;
      acc[inv.assetType]!.currentValue += inv.currentValue;
      return acc;
    }, {} as Record<string, { count: number; invested: number; currentValue: number }>);

    // Monthly investment timeline
    const monthlyData = investments.reduce((acc, inv) => {
      const month = inv.investmentDate.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { invested: 0, count: 0 };
      }
      acc[month].invested += inv.investedAmount;
      acc[month].count++;
      return acc;
    }, {} as Record<string, { invested: number; count: number }>);

    return {
      summary: {
        totalInvestments: investments.length,
        totalInvested,
        totalCurrentValue,
        totalReturn,
        returnPercentage: Math.round(returnPercentage * 100) / 100,
      },
      byAssetType,
      monthlyTimeline: Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }
}