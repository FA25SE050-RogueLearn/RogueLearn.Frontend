// Utility functions to normalize activity properties from API responses
// Handles both camelCase and PascalCase properties

import { Activity } from '../types/quest';

/**
 * Gets a property from an object in a case-insensitive manner.
 * Supports both camelCase and PascalCase.
 */
export function getPropertyInsensitive<T>(obj: any, key: string): T | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  
  // Try exact key first
  if (key in obj) return obj[key];
  
  // Try PascalCase version
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  if (pascalKey in obj) return obj[pascalKey];
  
  // Try camelCase version
  const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
  if (camelKey in obj) return obj[camelKey];
  
  return undefined;
}

/**
 * Normalizes an activity object to use camelCase properties.
 * Handles both PascalCase and camelCase API responses.
 */
export function normalizeActivity(activity: any): Activity {
  const type = getPropertyInsensitive<string>(activity, 'type') || 'Reading';
  const activityId = getPropertyInsensitive<string>(activity, 'activityId') || '';
  const skillId = getPropertyInsensitive<string>(activity, 'skillId') || '';
  const rawPayload = getPropertyInsensitive<any>(activity, 'payload') || {};
  
  // Normalize payload properties
  const payload = normalizePayload(rawPayload, type);
  
  return {
    type: type as Activity['type'],
    activityId,
    skillId,
    payload,
  };
}

/**
 * Normalizes payload properties to camelCase.
 */
export function normalizePayload(payload: any, type: string): any {
  if (!payload || typeof payload !== 'object') return {};
  
  const normalized: any = {};
  
  // Common properties
  const experiencePoints = getPropertyInsensitive<number>(payload, 'experiencePoints');
  if (experiencePoints !== undefined) normalized.experiencePoints = experiencePoints;
  
  // Type-specific properties
  switch (type) {
    case 'Reading':
      const url = getPropertyInsensitive<string>(payload, 'url');
      const articleTitle = getPropertyInsensitive<string>(payload, 'articleTitle');
      const summary = getPropertyInsensitive<string>(payload, 'summary');
      if (url !== undefined) normalized.url = url;
      if (articleTitle !== undefined) normalized.articleTitle = articleTitle;
      if (summary !== undefined) normalized.summary = summary;
      break;
      
    case 'KnowledgeCheck':
    case 'Quiz':
      const questions = getPropertyInsensitive<any[]>(payload, 'questions');
      const topic = getPropertyInsensitive<string>(payload, 'topic');
      if (questions !== undefined) normalized.questions = questions.map(normalizeQuestion);
      if (topic !== undefined) normalized.topic = topic;
      break;
      
    case 'Coding':
      const codingTopic = getPropertyInsensitive<string>(payload, 'topic');
      const language = getPropertyInsensitive<string>(payload, 'language');
      const difficulty = getPropertyInsensitive<string>(payload, 'difficulty');
      if (codingTopic !== undefined) normalized.topic = codingTopic;
      if (language !== undefined) normalized.language = language;
      if (difficulty !== undefined) normalized.difficulty = difficulty;
      break;
  }
  
  return normalized;
}

/**
 * Normalizes question properties to camelCase.
 */
export function normalizeQuestion(question: any): any {
  if (!question || typeof question !== 'object') return question;
  
  return {
    question: getPropertyInsensitive<string>(question, 'question') || '',
    options: getPropertyInsensitive<string[]>(question, 'options') || [],
    answer: getPropertyInsensitive<string>(question, 'answer') || 
            getPropertyInsensitive<string>(question, 'correctAnswer') || '',
    explanation: getPropertyInsensitive<string>(question, 'explanation') || '',
  };
}

/**
 * Normalizes all activities in a step's content.
 */
export function normalizeStepActivities(step: any): any {
  if (!step) return step;
  
  const content = step.content;
  if (!content) return step;
  
  // Parse content if it's a string
  const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  
  // Normalize activities array
  const rawActivities = getPropertyInsensitive<any[]>(parsedContent, 'activities') || [];
  const normalizedActivities = rawActivities.map(normalizeActivity);
  
  return {
    ...step,
    content: {
      activities: normalizedActivities,
    },
  };
}

/**
 * Normalizes quest details including all steps.
 */
export function normalizeQuestDetails(questDetails: any): any {
  if (!questDetails) return questDetails;
  
  if (questDetails.steps) {
    questDetails.steps = questDetails.steps.map(normalizeStepActivities);
  }
  
  return questDetails;
}
