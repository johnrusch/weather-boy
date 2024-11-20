import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT } from "../progress";
import { UserProgress } from "../../../models/UserProgress";
import mongoose from 'mongoose';

vi.mock('../../../lib/db', () => ({
  connectDB: vi.fn(),
}));

vi.mock('../../../models/UserProgress', () => ({
  UserProgress: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

describe('Progress API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/progress', () => {
    it('returns user progress when found', async () => {
      const mockProgress = {
        userId: 'test-user',
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: new Map(),
        },
        save: vi.fn(),
      };

      (UserProgress.findOne as any).mockResolvedValueOnce(mockProgress);

      const request = new Request('http://localhost/api/progress');
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData).toEqual({
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: {},
        }
      });
    });

    it('returns 404 when user progress not found', async () => {
      (UserProgress.findOne as any).mockResolvedValueOnce(null);

      const request = new Request('http://localhost/api/progress');
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'User progress not found' });
    });
  });

  describe('POST /api/progress', () => {
    it('creates new progress when not found', async () => {
      const mockProgress = {
        userId: 'test-user',
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: new Map(),
        },
        save: vi.fn(),
      };

      (UserProgress.findOne as any).mockResolvedValueOnce(null);
      (UserProgress.create as any).mockResolvedValueOnce(mockProgress);

      const request = new Request('http://localhost/api/progress', {
        method: 'POST',
      });
      const response = await POST({ request } as any);
      
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual({
        userId: 'test-user',
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: {},
        }
      });
    });

    it('returns 409 when progress already exists', async () => {
      const existingProgress = {
        userId: 'test-user',
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: new Map(),
        },
      };

      (UserProgress.findOne as any).mockResolvedValueOnce(existingProgress);

      const request = new Request('http://localhost/api/progress', {
        method: 'POST',
      });
      const response = await POST({ request } as any);
      
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ error: 'User progress already exists' });
    });
  });

  describe('PUT /api/progress', () => {
    it('updates progress with new score', async () => {
      const mockProgress = {
        userId: 'test-user',
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: new Map(),
        },
        save: vi.fn(),
      };

      (UserProgress.findOne as any).mockResolvedValueOnce(mockProgress);

      const request = new Request('http://localhost/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelId: 1,
          score: 85,
        }),
      });
      const response = await PUT({ request } as any);
      
      expect(response.status).toBe(200);
      expect(mockProgress.save).toHaveBeenCalled();
      const responseData = await response.json();
      // Since score 85 is above passing score (70), level 1 should be completed
      // and current level should advance to level 2
      expect(responseData).toEqual({
        campaignProgress: {
          currentLevel: 2,
          completedLevels: [1],
          bestScores: { '1': 85 },
        }
      });
    });

    it('updates best score without completing level when score is below passing', async () => {
      const mockProgress = {
        userId: 'test-user',
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: new Map(),
        },
        save: vi.fn(),
      };

      (UserProgress.findOne as any).mockResolvedValueOnce(mockProgress);

      const request = new Request('http://localhost/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelId: 1,
          score: 65,
        }),
      });
      const response = await PUT({ request } as any);
      
      expect(response.status).toBe(200);
      expect(mockProgress.save).toHaveBeenCalled();
      const responseData = await response.json();
      // Score 65 is below passing score (70), so level should not be completed
      expect(responseData).toEqual({
        campaignProgress: {
          currentLevel: 1,
          completedLevels: [],
          bestScores: { '1': 65 },
        }
      });
    });

    it('returns 404 when progress not found', async () => {
      (UserProgress.findOne as any).mockResolvedValueOnce(null);

      const request = new Request('http://localhost/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelId: 1,
          score: 85,
        }),
      });
      const response = await PUT({ request } as any);
      
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'User progress not found' });
    });
  });
});
