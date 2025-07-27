import { supabase } from './supabase';

/**
 * Interface for image data structure
 */
export interface ImageData {
  id?: string;
  question_id: string;
  image_url: string;
  image_alt?: string;
  image_type?: 'diagram' | 'chart' | 'photo' | 'illustration' | 'general';
  display_order?: number;
  created_at?: string;
}

/**
 * Insert a new image record into the Supabase images table
 * 
 * @param imageData - The image data to insert
 * @returns Promise with the inserted image data or error
 */
export async function insertImage(imageData: Omit<ImageData, 'id' | 'created_at'>) {
  try {
    // Step 1: Validate required fields
    if (!imageData.question_id || !imageData.image_url) {
      throw new Error('question_id and image_url are required fields');
    }

    // Step 2: Prepare the data with defaults
    const dataToInsert = {
      question_id: imageData.question_id,
      image_url: imageData.image_url,
      image_alt: imageData.image_alt || '',
      image_type: imageData.image_type || 'general',
      display_order: imageData.display_order || 1
    };

    // Step 3: Insert the row into Supabase
    const { data, error } = await supabase
      .from('images')
      .insert(dataToInsert)
      .select() // Return the inserted row
      .single(); // Expect only one row back

    // Step 4: Handle any errors
    if (error) {
      console.error('Error inserting image:', error);
      throw new Error(`Failed to insert image: ${error.message}`);
    }

    // Step 5: Return success confirmation
    console.log('Image inserted successfully:', data);
    return {
      success: true,
      data: data,
      message: 'Image inserted successfully'
    };

  } catch (error) {
    console.error('Insert image operation failed:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Example usage function showing how to insert sample image data
 */
export async function insertSampleImage() {
  // Sample image data for a math question
  const sampleImageData: Omit<ImageData, 'id' | 'created_at'> = {
    question_id: '123e4567-e89b-12d3-a456-426614174000', // Replace with actual question ID
    image_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg', // Math diagram
    image_alt: 'Mathematical diagram showing geometric shapes and formulas',
    image_type: 'diagram',
    display_order: 1
  };

  // Insert the image
  const result = await insertImage(sampleImageData);
  
  if (result.success) {
    console.log('✅ Sample image inserted:', result.data);
    return result.data;
  } else {
    console.error('❌ Failed to insert sample image:', result.error);
    throw new Error(result.error);
  }
}

/**
 * Get all images for a specific question
 * 
 * @param questionId - The ID of the question
 * @returns Promise with array of images
 */
export async function getImagesByQuestionId(questionId: string) {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('question_id', questionId)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      message: `Found ${data?.length || 0} images`
    };

  } catch (error) {
    console.error('Get images operation failed:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}