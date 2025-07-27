import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Question } from '@/types/database';
import { insertQuestion, isValidImageUrl } from '@/lib/questionService';
import { Language } from '@/lib/i18n';
import { Plus, Minus, Save, Image as ImageIcon } from 'lucide-react-native';

interface QuestionFormProps {
  language: Language;
  onSuccess?: (question: Question) => void;
  onCancel?: () => void;
}

export default function QuestionForm({ language, onSuccess, onCancel }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [category, setCategory] = useState('general');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrlError, setImageUrlError] = useState('');

  const validateImageUrl = (url: string) => {
    if (!url) {
      setImageUrlError('');
      return true;
    }
    
    if (!isValidImageUrl(url)) {
      setImageUrlError('Please enter a valid image URL (jpg, png, gif, webp, etc.)');
      return false;
    }
    
    setImageUrlError('');
    return true;
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    validateImageUrl(url);
  };

  const handleImageUrlBlur = async () => {
    if (imageUrl && isValidImageUrl(imageUrl)) {
      // Validate URL by attempting to load it
      try {
        setImageUrlError('Checking image...');
        const isValid = await Promise.race([
          validateImageUrl(imageUrl),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 3000)) // 3s timeout
        ]);
        if (!isValid) {
          setImageUrlError('Image URL appears to be invalid or inaccessible');
        } else {
          setImageUrlError('');
        }
      } catch {
        setImageUrlError('');
      }
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Adjust correct answer if needed
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    // Validation
    if (!questionText.trim()) {
      Alert.alert('Error', 'Question text is required');
      return;
    }

    if (options.some(opt => !opt.trim())) {
      Alert.alert('Error', 'All options must be filled');
      return;
    }

    if (imageUrl && !isValidImageUrl(imageUrl)) {
      Alert.alert('Error', 'Please enter a valid image URL or leave it empty');
      return;
    }

    setLoading(true);

    try {
      const questionData: Omit<Question, 'id' | 'created_at'> = {
        question_text: questionText.trim(),
        options: options.map(opt => opt.trim()),
        correct_answer: correctAnswer,
        language,
        category,
        difficulty,
        images: imageUrl.trim() || null,
      };

      const result = await insertQuestion(questionData);

      if (result.success && result.data) {
        Alert.alert('Success', 'Question created successfully');
        onSuccess?.(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to create question');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Question creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create New Question</Text>

      {/* Question Text */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Question Text *</Text>
        <TextInput
          style={styles.textInput}
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="Enter your question here..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Image URL */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <ImageIcon size={16} color="#2563EB" />
          <Text style={styles.label}>Image URL (Optional)</Text>
        </View>
        <TextInput
          style={[styles.textInput, imageUrlError && styles.inputError]}
          value={imageUrl}
          onChangeText={handleImageUrlChange}
          onBlur={handleImageUrlBlur}
          placeholder="https://images.pexels.com/photos/123456/image.jpg?auto=compress&cs=tinysrgb&w=800"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {imageUrlError ? (
          <Text style={styles.errorText}>{imageUrlError}</Text>
        ) : imageUrl && isValidImageUrl(imageUrl) ? (
          <Text style={styles.successText}>✓ Valid image URL format</Text>
        ) : null}
      </View>

      {/* Options */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Answer Options *</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.correctButton,
                correctAnswer === index && styles.correctButtonSelected
              ]}
              onPress={() => setCorrectAnswer(index)}
            >
              <Text style={[
                styles.correctButtonText,
                correctAnswer === index && styles.correctButtonTextSelected
              ]}>
                {correctAnswer === index ? '✓' : index + 1}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              style={[styles.optionInput, correctAnswer === index && styles.correctOptionInput]}
              value={option}
              onChangeText={(value) => updateOption(index, value)}
              placeholder={`Option ${index + 1}`}
            />
            
            {options.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeOption(index)}
              >
                <Minus size={16} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {options.length < 6 && (
          <TouchableOpacity style={styles.addButton} onPress={addOption}>
            <Plus size={16} color="#2563EB" />
            <Text style={styles.addButtonText}>Add Option</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category and Difficulty */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.textInput}
            value={category}
            onChangeText={setCategory}
            placeholder="general"
          />
        </View>
        
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  difficulty === level && styles.difficultyButtonSelected
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[
                  styles.difficultyButtonText,
                  difficulty === level && styles.difficultyButtonTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Save size={16} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  correctButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  correctButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  correctButtonTextSelected: {
    color: '#FFFFFF',
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  correctOptionInput: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  difficultyButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  difficultyButtonTextSelected: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});