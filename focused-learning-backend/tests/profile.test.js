const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Mock User model to avoid database connection issues during tests
jest.mock('../models/User');

describe('Profile API Integration Tests', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Learner',
      email: 'test@example.com',
      avatar: null,
      bio: 'Learning to grow'
    };
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should have a working health check route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });

  // Note: To test protected routes, we would normally provide a mock token 
  // or mock the protect middleware. For this test file, we'll focus on 
  // ensuring the server can be loaded and basic routes work.
  it('should return 401 for unauthorized profile access', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.statusCode).toEqual(401); // Unauthorized because no token is provided
  });
});
