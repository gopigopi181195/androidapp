import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { TestSession } from '@/types/database';
import { Trophy, RotateCcw, Chrome as Home, Calendar } from 'lucide-react-native';

export default function ResultsScreen() {
  const { language } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [testHistory, setTestHistory] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  const score = params.score ? parseInt(params.score as string) : 0;
  const total = params.total ? parseInt(params.total as string) : 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('language', language)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setTestHistory(data);
      }
    } catch (error) {
      console.log('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#16A34A';
    if (percentage >= 60) return '#D97706';
    return '#DC2626';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) {
      return language === 'en' ? 'Excellent!' : language === 'hi' ? 'उत्कृष्ट!' : 'అద్భుతం!';
    }
    if (percentage >= 60) {
      return language === 'en' ? 'Good!' : language === 'hi' ? 'अच्छा!' : 'బాగుంది!';
    }
    return language === 'en' ? 'Keep practicing!' : language === 'hi' ? 'अभ्यास जारी रखें!' : 'అభ్యాసం కొనసాగించండి!';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Trophy size={32} color={getScoreColor(percentage)} />
        </View>
        <Text style={styles.title}>{getTranslation(language, 'testCompleted')}</Text>
      </View>

      <View style={styles.scoreSection}>
        <View style={[styles.scoreCard, { borderColor: getScoreColor(percentage) }]}>
          <Text style={styles.scoreLabel}>{getTranslation(language, 'yourScore')}</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(percentage) }]}>
            {score}/{total}
          </Text>
          <Text style={[styles.percentageText, { color: getScoreColor(percentage) }]}>
            {percentage}%
          </Text>
          <Text style={styles.scoreMessage}>{getScoreMessage(percentage)}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>{getTranslation(language, 'correct')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{total - score}</Text>
            <Text style={styles.statLabel}>{getTranslation(language, 'incorrect')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>{getTranslation(language, 'testHistory')}</Text>
        {loading ? (
          <Text style={styles.loadingText}>{getTranslation(language, 'loading')}</Text>
        ) : testHistory.length > 0 ? (
          <View style={styles.historyList}>
            {testHistory.map((session, index) => (
              <View key={session.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.historyDate}>
                    {formatDate(session.completed_at || session.created_at)}
                  </Text>
                </View>
                <View style={styles.historyStats}>
                  <Text style={styles.historyScore}>
                    {session.score}/{session.total_questions}
                  </Text>
                  <Text style={[
                    styles.historyPercentage,
                    { color: getScoreColor(Math.round((session.score / session.total_questions) * 100)) }
                  ]}>
                    {Math.round((session.score / session.total_questions) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noHistoryText}>{getTranslation(language, 'noTestsYet')}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.retakeButton} onPress={() => router.push('/test')}>
          <RotateCcw size={20} color="#2563EB" />
          <Text style={styles.retakeButtonText}>{getTranslation(language, 'retakeTest')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
          <Home size={20} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>{getTranslation(language, 'backToHome')}</Text>
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
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  scoreSection: {
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  scoreMessage: {
    fontSize: 18,
    color: '#334155',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  historySection: {
    marginBottom: 32,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    padding: 20,
  },
  noHistoryText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  historyList: {
    gap: 8,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: '#64748B',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  historyPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
  },
  retakeButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});