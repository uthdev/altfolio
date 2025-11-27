import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Altfolio API',
    version: '1.0.0',
    description: 'Alternative Investments Tracker API',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'viewer'] },
        },
      },
      Investment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          assetName: { type: 'string' },
          assetType: { 
            type: 'string', 
            enum: ['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'] 
          },
          investedAmount: { type: 'number', minimum: 0 },
          investmentDate: { type: 'string', format: 'date-time' },
          currentValue: { type: 'number', minimum: 0 },
          owners: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          role: { type: 'string', enum: ['admin', 'viewer'], default: 'viewer' },
        },
      },
      CreateInvestmentRequest: {
        type: 'object',
        required: ['assetName', 'assetType', 'investedAmount', 'investmentDate', 'currentValue', 'owners'],
        properties: {
          assetName: { type: 'string', minLength: 1, maxLength: 100 },
          assetType: { 
            type: 'string', 
            enum: ['Startup', 'Crypto Fund', 'Farmland', 'Collectible', 'Other'] 
          },
          investedAmount: { type: 'number', minimum: 0 },
          investmentDate: { type: 'string', format: 'date-time' },
          currentValue: { type: 'number', minimum: 0 },
          owners: { 
            type: 'array', 
            items: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } 
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: { 
            type: 'object',
            additionalProperties: { type: 'string' }
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);