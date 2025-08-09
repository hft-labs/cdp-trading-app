// Mock environment variables
process.env.CRON_SECRET = 'test-cron-secret'
process.env.CDP_API_KEY = 'test-api-key'
process.env.CDP_PRIVATE_KEY = 'test-private-key'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Global test timeout
jest.setTimeout(30000)

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} 