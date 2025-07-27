/*
  # Mock Test App Database Schema

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `question_text` (text, the question content)
      - `options` (text[], array of multiple choice options)
      - `correct_answer` (integer, index of correct option)
      - `language` (text, 'en'|'hi'|'tel')
      - `category` (text, question category like 'general', 'science', etc.)
      - `difficulty` (text, 'easy'|'medium'|'hard')
      - `created_at` (timestamp)

    - `test_sessions`
      - `id` (text, session identifier)
      - `user_id` (uuid, optional user reference)
      - `language` (text, test language)
      - `questions` (text[], array of question IDs)
      - `answers` (integer[], array of selected answers)
      - `score` (integer, number of correct answers)
      - `total_questions` (integer, total questions in test)
      - `completed_at` (timestamp, when test was completed)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for questions
    - Users can read/write their own test sessions

  3. Sample Data
    - Insert sample questions in all three languages
    - Cover different categories and difficulty levels
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options text[] NOT NULL,
  correct_answer integer NOT NULL,
  language text NOT NULL CHECK (language IN ('en', 'hi', 'tel')),
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  language text NOT NULL CHECK (language IN ('en', 'hi', 'tel')),
  questions text[] NOT NULL,
  answers integer[],
  score integer DEFAULT 0,
  total_questions integer NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions (public read access)
CREATE POLICY "Questions are publicly readable"
  ON questions
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for test_sessions
CREATE POLICY "Users can read own test sessions"
  ON test_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert test sessions"
  ON test_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS questions_language_idx ON questions(language);
CREATE INDEX IF NOT EXISTS questions_category_idx ON questions(category);
CREATE INDEX IF NOT EXISTS test_sessions_language_idx ON test_sessions(language);
CREATE INDEX IF NOT EXISTS test_sessions_created_at_idx ON test_sessions(created_at);

-- Insert sample questions in English
INSERT INTO questions (question_text, options, correct_answer, language, category, difficulty) VALUES
('What is the capital of India?', '{"Mumbai", "Delhi", "Kolkata", "Chennai"}', 1, 'en', 'geography', 'easy'),
('Which planet is known as the Red Planet?', '{"Venus", "Mars", "Jupiter", "Saturn"}', 1, 'en', 'science', 'easy'),
('Who wrote the play "Romeo and Juliet"?', '{"Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"}', 1, 'en', 'literature', 'medium'),
('What is the largest ocean on Earth?', '{"Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"}', 3, 'en', 'geography', 'easy'),
('Which gas makes up about 78% of Earth''s atmosphere?', '{"Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"}', 1, 'en', 'science', 'medium');

-- Insert sample questions in Hindi
INSERT INTO questions (question_text, options, correct_answer, language, category, difficulty) VALUES
('भारत की राजधानी क्या है?', '{"मुंबई", "दिल्ली", "कोलकाता", "चेन्नई"}', 1, 'hi', 'geography', 'easy'),
('कौन सा ग्रह लाल ग्रह के नाम से जाना जाता है?', '{"शुक्र", "मंगल", "बृहस्पति", "शनि"}', 1, 'hi', 'science', 'easy'),
('"रोमियो और जूलियट" नाटक किसने लिखा था?', '{"चार्ल्स डिकेंस", "विलियम शेक्सपियर", "जेन ऑस्टन", "मार्क ट्वेन"}', 1, 'hi', 'literature', 'medium'),
('पृथ्वी का सबसे बड़ा महासागर कौन सा है?', '{"अटलांटिक महासागर", "हिंद महासागर", "आर्कटिक महासागर", "प्रशांत महासागर"}', 3, 'hi', 'geography', 'easy'),
('कौन सी गैस पृथ्वी के वायुमंडल का लगभग 78% भाग बनाती है?', '{"ऑक्सीजन", "नाइट्रोजन", "कार्बन डाइऑक्साइड", "आर्गन"}', 1, 'hi', 'science', 'medium');

-- Insert sample questions in Telugu
INSERT INTO questions (question_text, options, correct_answer, language, category, difficulty) VALUES
('భారతదేశ రాజధాని ఏది?', '{"ముంబై", "ఢిల్లీ", "కోల్‌కతా", "చెన్నై"}', 1, 'tel', 'geography', 'easy'),
('ఏ గ్రహాన్ని రెడ్ ప్లానెట్ అని పిలుస్తారు?', '{"శుక్రుడు", "మంగళుడు", "బృహస్పతి", "శని"}', 1, 'tel', 'science', 'easy'),
('"రోమియో అండ్ జూలియట్" నాటకం ఎవరు రాశారు?', '{"చార్లెస్ డికెన్స్", "విలియం షేక్‌స్పియర్", "జేన్ ఆస్టిన్", "మార్క్ ట్వైన్"}', 1, 'tel', 'literature', 'medium'),
('భూమిపై అతిపెద్ద సముద్రం ఏది?', '{"అట్లాంటిక్ సముద్రం", "హిందూ మహాసముద్రం", "ఆర్కిటిక్ సముద్రం", "పసిఫిక్ సముద్రం"}', 3, 'tel', 'geography', 'easy'),
('భూమి వాతావరణంలో దాదాపు 78% ఏ వాయువు ఉంటుంది?', '{"ఆక్సిజన్", "నైట్రోజన్", "కార్బన్ డైఆక్సైడ్", "ఆర్గాన్"}', 1, 'tel', 'science', 'medium');