import Database from 'better-sqlite3';
import { settings } from '../config/settings';
import type { CodePattern, Solution, UserPreference } from '../types';

const db = new Database(settings.database.url);

export class KnowledgeBase {
  async initialize(): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS code_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_type TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        usage_count INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 1.0,
        metadata TEXT,
        context TEXT
      );

      CREATE TABLE IF NOT EXISTS solutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem_type TEXT NOT NULL,
        solution TEXT NOT NULL,
        description TEXT,
        effectiveness_score REAL DEFAULT 1.0,
        usage_count INTEGER DEFAULT 0,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preference_type TEXT NOT NULL,
        value TEXT NOT NULL,
        confidence REAL DEFAULT 0.5,
        metadata TEXT
      );
    `);
  }

  async addPattern(
    patternType: string,
    code: string,
    description: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): Promise<CodePattern> {
    const result = await db.insert<CodePattern>('code_patterns', {
      pattern_type: patternType,
      code,
      description,
      context: context || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    const id = result.meta.last_row_rowid!;
    const inserted = await db.select<CodePattern>('code_patterns', {
      where: { id },
    });

    return inserted[0];
  }

  async searchPatterns(
    patternType?: string,
    minSuccessRate: number = 0.0,
    limit: number = 10,
  ): Promise<CodePattern[]> {
    let query = db
      .selectFrom('code_patterns')
      .where({ success_rate: { $gte: minSuccessRate } });

    if (patternType) {
      query = query.and({ pattern_type: patternType });
    }

    const results = await query
      .orderBy(['success_rate DESC', 'usage_count DESC'])
      .limit(limit)
      .all();

    return results.map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata as string) : {},
    }));
  }

  async updatePatternSuccess(
    patternId: number,
    success: boolean,
  ): Promise<void> {
    const pattern = await db.select<CodePattern>('code_patterns', {
      where: { id: patternId },
    });

    if (pattern.length === 0) return;

    const p = pattern[0];
    const newSuccessRate =
      (p.success_rate * (p.usage_count - 1) + (success ? 1 : 0)) / p.usage_count;

    await db.update('code_patterns', {
      usage_count: p.usage_count + 1,
      success_rate: newSuccessRate,
    }).where({ id: patternId });
  }

  async addSolution(
    problemType: string,
    solution: string,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Solution> {
    const result = await db.insert<Solution>('solutions', {
      problem_type: problemType,
      solution,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    const id = result.meta.last_row_rowid!;
    const inserted = await db.select<Solution>('solutions', {
      where: { id },
    });

    return inserted[0];
  }

  async searchSolutions(
    problemType?: string,
    limit: number = 10,
  ): Promise<Solution[]> {
    let query = db.selectFrom('solutions');

    if (problemType) {
      query = query.where({ problem_type: problemType });
    }

    const results = await query
      .orderBy(['effectiveness_score DESC', 'usage_count DESC'])
      .limit(limit)
      .all();

    return results.map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata as string) : {},
    }));
  }

  async updateSolutionEffectiveness(
    solutionId: number,
    wasHelpful: boolean,
  ): Promise<void> {
    const solution = await db.select<Solution>('solutions', {
      where: { id: solutionId },
    });

    if (solution.length === 0) return;

    const s = solution[0];
    const newEffectivenessScore =
      (s.effectiveness_score * (s.usage_count - 1) + (wasHelpful ? 1 : 0)) / s.usage_count;

    await db.update('solutions', {
      usage_count: s.usage_count + 1,
      effectiveness_score: newEffectivenessScore,
    }).where({ id: solutionId });
  }

  async setPreference(
    preferenceType: string,
    value: string,
    confidence: number = 0.5,
    metadata?: Record<string, unknown>,
  ): Promise<UserPreference> {
    const result = await db.insert<UserPreference>('user_preferences', {
      preference_type: preferenceType,
      value,
      confidence,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    const id = result.meta.last_row_rowid!;
    const inserted = await db.select<UserPreference>('user_preferences', {
      where: { id },
    });

    return inserted[0];
  }

  async getPreferences(
    preferenceType?: string,
  ): Promise<UserPreference[]> {
    let query = db.selectFrom('user_preferences');

    if (preferenceType) {
      query = query.where({ preference_type: preferenceType });
    }

    const results = await query.orderBy('confidence DESC').all();

    return results.map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata as string) : {},
    }));
  }
}
