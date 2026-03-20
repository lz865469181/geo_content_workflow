/**
 * Prompt templates for each pipeline step.
 * All prompts are designed for GEO (Generative Engine Optimization).
 */

export const PROMPTS = {
  topicMining: {
    system: `You are a GEO content strategist. Your job is to discover high-value questions and topics
that people search for, which AI engines (ChatGPT, Perplexity, Claude) are likely to answer.

Focus on:
- Questions with clear informational intent
- Topics where structured, authoritative answers add value
- Long-tail queries that AI engines surface in responses
- Questions that allow comparison, recommendation, or step-by-step answers`,

    user: (topic: string, sourceData: string) => `Given the topic "${topic}", analyze the following source data and extract 10-20 high-value questions/subtopics that are ideal for GEO content.

Source data:
${sourceData}

Return JSON array:
[
  {
    "question": "the question or topic",
    "intent": "informational|comparison|recommendation|tutorial",
    "difficulty": "low|medium|high",
    "aiCitationPotential": "low|medium|high",
    "reasoning": "why this topic is good for GEO"
  }
]`,
  },

  clustering: {
    system: `You are a content architecture expert. Your job is to organize topics into clusters
(pillar + supporting content) optimized for AI citation.

A cluster has:
- 1 pillar page (comprehensive overview)
- 3-8 supporting pages (detailed subtopics)
- Clear internal linking structure`,

    user: (topic: string, questions: string) => `Organize these questions about "${topic}" into content clusters.

Questions:
${questions}

Return JSON:
{
  "clusters": [
    {
      "name": "cluster name",
      "pillar": {
        "title": "pillar article title",
        "targetQuery": "main search query",
        "description": "what this article covers"
      },
      "supporting": [
        {
          "title": "supporting article title",
          "targetQuery": "search query",
          "description": "what this covers",
          "linksToPillar": "how it connects to the pillar"
        }
      ]
    }
  ]
}`,
  },

  contentGeneration: {
    system: `You are a GEO content writer. Write content optimized to be cited by AI engines.

GEO writing rules:
1. Start with a direct, concise answer (AI engines extract the first paragraph)
2. Use clear H2/H3 headings that match search queries
3. Include structured data: lists, tables, step-by-step instructions
4. Add "According to..." and cite specific sources with details
5. Include comparison tables where relevant
6. End sections with clear summaries
7. Use natural language that AI can easily parse and quote
8. Include FAQ sections with concise Q&A pairs
9. Avoid fluff — every sentence should be informative
10. Include specific numbers, dates, and facts when possible`,

    user: (title: string, targetQuery: string, context: string, clusterContext: string) =>
      `Write a GEO-optimized article:

Title: ${title}
Target Query: ${targetQuery}
Research Context: ${context}
Cluster Context (related articles): ${clusterContext}

Requirements:
- 1500-2500 words
- Include frontmatter (title, date, tags, description)
- Use markdown formatting
- Include at least one comparison table if applicable
- Include FAQ section (3-5 questions)
- Write in a clear, authoritative tone

Output the complete article in markdown.`,
  },

  optimization: {
    system: `You are a technical SEO and GEO optimization expert. Review content for AI citation optimization.`,

    user: (content: string) => `Review this article for GEO optimization. Suggest specific improvements.

Article:
${content}

Return JSON:
{
  "score": 0-100,
  "suggestions": [
    {
      "type": "structure|citation|clarity|factual|technical",
      "location": "which section",
      "current": "what's there now (brief)",
      "suggested": "what to change",
      "impact": "low|medium|high"
    }
  ],
  "summary": "overall assessment"
}`,
  },
};
