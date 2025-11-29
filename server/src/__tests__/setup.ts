// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn(),
  connection: {
    collections: {}
  }
}));

// Mock models
jest.mock('../models/User', () => ({
  User: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    populate: jest.fn()
  })),
}));

// Add static methods to User mock
const { User } = require('../models/User');
User.findOne = jest.fn();
User.findById = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue(null)
});
User.create = jest.fn();
User.find = jest.fn();
User.findByIdAndUpdate = jest.fn();
User.findByIdAndDelete = jest.fn();
User.countDocuments = jest.fn();

jest.mock('../models/Investment', () => ({
  Investment: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    populate: jest.fn()
  }))
}));

// Add static methods to Investment mock
const { Investment } = require('../models/Investment');
Investment.find = jest.fn();
Investment.findById = jest.fn();
Investment.create = jest.fn();
Investment.findByIdAndUpdate = jest.fn();
Investment.findByIdAndDelete = jest.fn();
Investment.countDocuments = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});