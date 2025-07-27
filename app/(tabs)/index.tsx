import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, languages, Language } from '@/lib/i18n';
import { ChevronRight, Globe } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
  };

  const handleStartTest = () => {
    router.push('/test');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Globe size={32} color="#2563EB" />
        </View>
        <Text style={styles.title}>{getTranslation(language, 'mockTest')}</Text>
        <Text style={styles.subtitle}>{getTranslation(language, 'selectLanguage')}</Text>
      </View>

      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>{getTranslation(language, 'selectLanguage')}</Text>
        <View style={styles.languageGrid}>
          {Object.entries(languages).map(([code, name]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.languageCard,
                language === code && styles.selectedLanguageCard
              ]}
              onPress={() => handleLanguageSelect(code as Language)}
            >
              <Text style={[
                styles.languageText,
                language === code && styles.selectedLanguageText
              ]}>
                {name}
              </Text>
              {language === code && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.testSection}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Text style={styles.startButtonText}>{getTranslation(language, 'startTest')}</Text>
          <ChevronRight size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📚 {getTranslation(language, 'questions')}</Text>
          <Text style={styles.infoDescription}>
            Practice with multiple choice questions in your preferred language
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 {getTranslation(language, 'results')}</Text>
          <Text style={styles.infoDescription}>
            Track your progress and view detailed score analysis
          </Text>
        </View>
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
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#EBF4FF',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  languageSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  languageGrid: {
    gap: 12,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  selectedLanguageCard: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  selectedLanguageText: {
    color: '#2563EB',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  testSection: {
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});