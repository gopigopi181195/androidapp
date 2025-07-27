export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  language: 'en' | 'hi' | 'tel';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  images?: string | null;
}

export interface TestSession {
  id: string;
  user_id?: string;
  language: 'en' | 'hi' | 'tel';
  questions: string[];
  answers: (number | null)[];
  score: number;
  total_questions: number;
  completed_at: string | null;
  created_at: string;
}

export interface UserAnswer {
  question_id: string;
  selected_option: number;
  is_correct: boolean;
}

export interface ImageData {
  id: string;
  question_id: string;
  image_url: string;
  image_alt: string;
  image_type: 'diagram' | 'chart' | 'photo' | 'illustration' | 'general';
  display_order: number;
  created_at: string;
}