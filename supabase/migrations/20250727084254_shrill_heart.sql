/*
  # Add images column to questions table

  1. Schema Changes
    - Add `images` column to `questions` table as nullable text field
    - Column will store image URL as text/varchar
    - Maintains backward compatibility with existing records

  2. Notes
    - Column is nullable to preserve existing data
    - No default value to keep existing records unchanged
    - Can store single image URL or be extended later for multiple images
*/

-- Add images column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'images'
  ) THEN
    ALTER TABLE questions ADD COLUMN images text;
  END IF;
END $$;

-- Add comment to document the column purpose
COMMENT ON COLUMN questions.images IS 'Stores image URL for the question (nullable for backward compatibility)';