const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Create a mock app for testing base routes
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

describe('API Health Check', () => {
  it('should return 200 OK and health message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.message).toBe('API is healthy');
  });
});
