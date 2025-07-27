import { supabase } from './supabase';
import { Question } from '@/types/database';

/**
 * Validates if a URL is a valid image URL format
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    // Check if URL has valid protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check if URL ends with common image extensions or is from known image services
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
    const pathname = urlObj.pathname.toLowerCase();
    const hostname = urlObj.hostname.toLowerCase();
    
    // Known image hosting services
    const imageHosts = [
      'images.pexels.com',
      'images.unsplash.com',
      'cdn.pixabay.com',
      'i.imgur.com',
      'upload.wikimedia.org',
      'raw.githubusercontent.com'
    ];
    
    // Allow URLs with image extensions or from known image hosting services
    return imageExtensions.some(ext => pathname.includes(ext)) || 
           imageHosts.some(host => hostname.includes(host)) ||
           pathname.includes('/images/') ||
           urlObj.searchParams.has('w') || // Common for image services with query params
           urlObj.searchParams.has('width');
  } catch {
    return false;
  }
}

/**
 * Validates image URL by attempting to fetch headers
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!isValidImageUrl(url)) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      // Add headers to avoid CORS issues
      headers: {
        'Accept': 'image/*',
      },
    });
    const contentType = response.headers.get('content-type');
    return response.ok && (
      contentType?.startsWith('image/') === true ||
      response.status === 200 // Some services don't return proper content-type in HEAD
    );
  } catch {
    // If HEAD request fails, try a GET request with range header
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1023', // Only fetch first 1KB
          'Accept': 'image/*',
        },
      });
      return response.ok;
    } catch {
      // If both fail, assume URL might still be valid
      return true;
    }
  }
}

/**
 * Get questions by language with image support
 */
export async function getQuestionsByLanguage(language: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('language', language)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      message: `Found ${data?.length || 0} questions`
    };
  } catch (error) {
    console.error('Get questions operation failed:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Insert a new question with optional image
 */
export async function insertQuestion(questionData: Omit<Question, 'id' | 'created_at'>) {
  try {
    // Validate required fields
    if (!questionData.question_text || !questionData.options || questionData.options.length === 0) {
      throw new Error('question_text and options are required fields');
    }

    // Validate image URL if provided
    if (questionData.images && !isValidImageUrl(questionData.images)) {
      throw new Error('Invalid image URL format');
    }

    // Prepare data with defaults
    const dataToInsert = {
      question_text: questionData.question_text,
      options: questionData.options,
      correct_answer: questionData.correct_answer,
      language: questionData.language,
      category: questionData.category || 'general',
      difficulty: questionData.difficulty || 'easy',
      images: questionData.images || null
    };

    // Insert the question
    const { data, error } = await supabase
      .from('questions')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error inserting question:', error);
      throw new Error(`Failed to insert question: ${error.message}`);
    }

    console.log('Question inserted successfully:', data);
    return {
      success: true,
      data: data,
      message: 'Question inserted successfully'
    };

  } catch (error) {
    console.error('Insert question operation failed:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update an existing question
 */
export async function updateQuestion(id: string, updates: Partial<Omit<Question, 'id' | 'created_at'>>) {
  try {
    // Validate image URL if being updated
    if (updates.images && !isValidImageUrl(updates.images)) {
      throw new Error('Invalid image URL format');
    }

    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'Question updated successfully'
    };

  } catch (error) {
    console.error('Update question operation failed:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Insert sample questions with images
 */
export async function insertSampleQuestionsWithImages() {
  const sampleQuestions: Omit<Question, 'id' | 'created_at'>[] = [
    {
      question_text: 'What is shown in this mathematical diagram?',
      options: ['Circle', 'Triangle', 'Square', 'Rectangle'],
      correct_answer: 1,
      language: 'en',
      category: 'mathematics',
      difficulty: 'easy',
      images: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg'
    },
    {
      question_text: 'इस चित्र में क्या दिखाया गया है?',
      options: ['वृत्त', 'त्रिभुज', 'वर्ग', 'आयत'],
      correct_answer: 1,
      language: 'hi',
      category: 'mathematics',
      difficulty: 'easy',
      images: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg'
    },
    {
      question_text: 'ఈ చిత్రంలో ఏమి చూపబడింది?',
      options: ['వృత్తం', 'త్రిభుజం', 'చతురస్రం', 'దీర్ఘచతురస్రం'],
      correct_answer: 1,
      language: 'tel',
      category: 'mathematics',
      difficulty: 'easy',
      images: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg'
    }
  ];

  const results = [];
  for (const question of sampleQuestions) {
    const result = await insertQuestion(question);
    results.push(result);
  }

  return results;
}