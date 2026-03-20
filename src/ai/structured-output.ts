/**
 * Parse and validate structured outputs from Claude.
 */

export interface TopicResult {
  question: string;
  intent: 'informational' | 'comparison' | 'recommendation' | 'tutorial';
  difficulty: 'low' | 'medium' | 'high';
  aiCitationPotential: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface ClusterArticle {
  title: string;
  targetQuery: string;
  description: string;
  linksToPillar?: string;
}

export interface ContentCluster {
  name: string;
  pillar: ClusterArticle;
  supporting: ClusterArticle[];
}

export interface ClusterResult {
  clusters: ContentCluster[];
}

export interface OptimizationSuggestion {
  type: 'structure' | 'citation' | 'clarity' | 'factual' | 'technical';
  location: string;
  current: string;
  suggested: string;
  impact: 'low' | 'medium' | 'high';
}

export interface OptimizationResult {
  score: number;
  suggestions: OptimizationSuggestion[];
  summary: string;
}

export function validateTopics(data: unknown): TopicResult[] {
  if (!Array.isArray(data)) throw new Error('Expected array of topics');
  return data.map((item, i) => {
    if (!item.question || typeof item.question !== 'string') {
      throw new Error(`Topic ${i}: missing question`);
    }
    return {
      question: item.question,
      intent: item.intent || 'informational',
      difficulty: item.difficulty || 'medium',
      aiCitationPotential: item.aiCitationPotential || 'medium',
      reasoning: item.reasoning || '',
    };
  });
}

export function validateClusters(data: unknown): ClusterResult {
  const obj = data as Record<string, unknown>;
  if (!obj.clusters || !Array.isArray(obj.clusters)) {
    throw new Error('Expected { clusters: [...] }');
  }
  return {
    clusters: obj.clusters.map((c: any, i: number) => {
      if (!c.name || !c.pillar) throw new Error(`Cluster ${i}: missing name or pillar`);
      return {
        name: c.name,
        pillar: {
          title: c.pillar.title || c.name,
          targetQuery: c.pillar.targetQuery || '',
          description: c.pillar.description || '',
        },
        supporting: (c.supporting || []).map((s: any) => ({
          title: s.title || '',
          targetQuery: s.targetQuery || '',
          description: s.description || '',
          linksToPillar: s.linksToPillar || '',
        })),
      };
    }),
  };
}

export function validateOptimization(data: unknown): OptimizationResult {
  const obj = data as Record<string, unknown>;
  return {
    score: typeof obj.score === 'number' ? obj.score : 0,
    suggestions: Array.isArray(obj.suggestions) ? obj.suggestions : [],
    summary: typeof obj.summary === 'string' ? obj.summary : '',
  };
}
