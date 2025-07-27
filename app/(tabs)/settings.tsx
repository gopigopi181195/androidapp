import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, languages, Language } from '@/lib/i18n';
import { Globe, CircleCheck as CheckCircle, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTranslation(language, 'settings')}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>{getTranslation(language, 'selectLanguage')}</Text>
        </View>
        
        <View style={styles.languageOptions}>
          {Object.entries(languages).map(([code, name]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.languageOption,
                language === code && styles.selectedLanguageOption
              ]}
              onPress={() => handleLanguageChange(code as Language)}
            >
              <Text style={[
                styles.languageOptionText,
                language === code && styles.selectedLanguageOptionText
              ]}>
                {name}
              </Text>
              {language === code && (
                <CheckCircle size={20} color="#2563EB" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Mock Test App v1.0.0{'\n\n'}
            A simple and effective way to practice multiple choice questions in Telugu, Hindi, and English.{'\n\n'}
            Features:{'\n'}
            • Multi-language support{'\n'}
            • Progress tracking{'\n'}
            • Test history{'\n'}
            • Offline support
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Setup</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            To connect this app to Supabase:{'\n\n'}
            1. Click "Connect to Supabase" in the top right{'\n'}
            2. The app will automatically create the required tables{'\n'}
            3. You can then add your own questions through the Supabase dashboard
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  languageOptions: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedLanguageOption: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedLanguageOptionText: {
    color: '#2563EB',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});