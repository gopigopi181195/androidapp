import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { getQuestionsByLanguage } from '@/lib/questionService';
import { Question, TestSession } from '@/types/database';
import { ChevronLeft, ChevronRight, CircleCheck as CheckCircle } from 'lucide-react-native';
import QuestionImage from '@/components/QuestionImage';

export default function TestScreen() {
  const { language } = useLanguage();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [testSession, setTestSession] = useState<TestSession | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [language]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first
      const result = await getQuestionsByLanguage(language, 10);

      if (!result.success) {
        console.error('Error loading questions:', result.error);
        Alert.alert('Error', 'Failed to load questions');
        loadSampleQuestions();
        return;
      }

      if (result.data && result.data.length > 0) {
        setQuestions(result.data);
        setAnswers(new Array(result.data.length).fill(null));
        
        // Create test session
        const session: TestSession = {
          id: Date.now().toString(),
          language,
          questions: result.data.map(q => q.id),
          answers: new Array(result.data.length).fill(null),
          score: 0,
          total_questions: result.data.length,
          completed_at: null,
          created_at: new Date().toISOString(),
        };
        setTestSession(session);
      } else {
        // Show sample questions if no data in database
        loadSampleQuestions();
      }
    } catch (error) {
      console.error('Error:', error);
      loadSampleQuestions();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuestions = () => {
    const sampleQuestions: Question[] = [
      {
        id: '1',
        question_text: language === 'en' ? 'What is the capital of India?' : 
                      language === 'hi' ? 'भारत की राजधानी क्या है?' : 
                      'భారతదేశ రాజధాని ఏది?',
        options: language === 'en' ? ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'] :
                language === 'hi' ? ['मुंबई', 'दिल्ली', 'कोलकाता', 'चेन्नई'] :
                ['ముంబై', 'ఢిల్లీ', 'కోల్‌కతా', 'చెన్నై'],
        correct_answer: 1,
        language,
        category: 'general',
        difficulty: 'easy',
        created_at: new Date().toISOString(),
        images: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: '2',
        question_text: language === 'en' ? 'Which planet is known as the Red Planet?' :
                      language === 'hi' ? 'कौन सा ग्रह लाल ग्रह के नाम से जाना जाता है?' :
                      'ఏ గ్రహాన్ని రెడ్ ప్లానెట్ అని పిలుస్తారు?',
        options: language === 'en' ? ['Venus', 'Mars', 'Jupiter', 'Saturn'] :
                language === 'hi' ? ['शुक्र', 'मंगल', 'बृहस्पति', 'शनि'] :
                ['శుక్రుడు', 'మంగళుడు', 'బృహస్పతి', 'శని'],
        correct_answer: 1,
        language,
        category: 'science',
        difficulty: 'easy',
        created_at: new Date().toISOString(),
        images: 'https://images.pexels.com/photos/87009/earth-soil-creep-moon-lunar-surface-87009.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
      {
        id: '3',
        question_text: language === 'en' ? 'What mathematical operation is shown?' :
                      language === 'hi' ? 'कौन सा गणितीय ऑपरेशन दिखाया गया है?' :
                      'ఏ గణిత ఆపరేషన్ చూపబడింది?',
        options: language === 'en' ? ['Addition', 'Subtraction', 'Multiplication', 'Division'] :
                language === 'hi' ? ['जोड़', 'घटाव', 'गुणा', 'भाग'] :
                ['కూడిక', 'తీసివేత', 'గుణకారం', 'భాగహారం'],
        correct_answer: 2,
        language,
        category: 'mathematics',
        difficulty: 'easy',
        created_at: new Date().toISOString(),
        images: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ];
    
    setQuestions(sampleQuestions);
    setAnswers(new Array(sampleQuestions.length).fill(null));
    
    const session: TestSession = {
      id: Date.now().toString(),
      language,
      questions: sampleQuestions.map(q => q.id),
      answers: new Array(sampleQuestions.length).fill(null),
      score: 0,
      total_questions: sampleQuestions.length,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    setTestSession(session);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testSession) return;

    const score = answers.reduce((total, answer, index) => {
      if (answer === questions[index].correct_answer) {
        return total + 1;
      }
      return total;
    }, 0);

    const completedSession: TestSession = {
      ...testSession,
      answers,
      score,
      completed_at: new Date().toISOString(),
    };

    try {
      // Save to Supabase if available
      await supabase.from('test_sessions').insert(completedSession);
    } catch (error) {
      console.log('Failed to save to database:', error);
    }

    // Navigate to results
    router.push({
      pathname: '/results',
      params: { 
        score: score.toString(), 
        total: questions.length.toString(),
        sessionId: testSession.id 
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{getTranslation(language, 'loading')}</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{getTranslation(language, 'error')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuestions}>
          <Text style={styles.retryButtonText}>{getTranslation(language, 'retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {getTranslation(language, 'question')} {currentQuestionIndex + 1} {getTranslation(language, 'of')} {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          {currentQuestion.images && (
            <QuestionImage 
              imageUrl={currentQuestion.images} 
              alt={`Image for question ${currentQuestionIndex + 1}: ${currentQuestion.question_text.substring(0, 50)}...`}
            />
          )}
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                answers[currentQuestionIndex] === index && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIndicator,
                  answers[currentQuestionIndex] === index && styles.selectedIndicator
                ]}>
                  {answers[currentQuestionIndex] === index && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  answers[currentQuestionIndex] === index && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft size={20} color={currentQuestionIndex === 0 ? '#9CA3AF' : '#2563EB'} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>
            {getTranslation(language, 'previous')}
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{getTranslation(language, 'submit')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{getTranslation(language, 'next')}</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#1E293B',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});