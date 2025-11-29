import { Investment } from '../models/Investment';
import { CreateInvestmentData, UpdateInvestmentData } from '../types';

interface GetInvestmentsQuery {
  page?: number;
  limit?: number;
  assetType?: string;
  owner?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class InvestmentService {
  static async getAllInvestments(query: GetInvestmentsQuery = {}) {
    const {
      page = 1,
      limit = 10,
      assetType,
      owner,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    // Build filter object
    const filter: Record<string, unknown> = {};
    if (assetType) filter.assetType = assetType;
    if (owner) filter.owners = owner;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .populate('owners', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Investment.countDocuments(filter)
    ]);

    return {
      investments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  static async getInvestmentById(id: string) {
    return Investment.findById(id)
      .populate('owners', 'name email');
  }

  static async createInvestment(data: CreateInvestmentData) {
    const { investmentDate, ...rest } = data;
    const investment = new Investment({
      ...rest,
      investmentDate: new Date(investmentDate),
    });
    
    await investment.save();
    await investment.populate('owners', 'name email');
    return investment;
  }

  static async updateInvestment(id: string, data: UpdateInvestmentData) {
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.investmentDate) {
      updateData.investmentDate = new Date(updateData.investmentDate);
    }

    return Investment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owners', 'name email');
  }

  static async deleteInvestment(id: string) {
    return Investment.findByIdAndDelete(id);
  }
}