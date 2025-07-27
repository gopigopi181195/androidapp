/*
  # Create images table for question-related images

  1. New Tables
    - `images`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to questions table)
      - `image_url` (text, URL to the image)
      - `image_alt` (text, alt text for accessibility)
      - `image_type` (text, type of image - diagram, chart, photo, etc.)
      - `display_order` (integer, order of display if multiple images)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `images` table
    - Add policy for public read access to images
    - Add policy for authenticated users to manage images

  3. Indexes
    - Index on question_id for faster lookups
    - Index on image_type for filtering
*/

CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_alt text DEFAULT '',
  image_type text DEFAULT 'general' CHECK (image_type IN ('diagram', 'chart', 'photo', 'illustration', 'general')),
  display_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Images are publicly readable"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update images"
  ON images
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete images"
  ON images
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS images_question_id_idx ON images(question_id);
CREATE INDEX IF NOT EXISTS images_type_idx ON images(image_type);
CREATE INDEX IF NOT EXISTS images_display_order_idx ON images(display_order);