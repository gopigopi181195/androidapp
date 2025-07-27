import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { CircleAlert as AlertCircle, Image as ImageIcon } from 'lucide-react-native';

interface QuestionImageProps {
  imageUrl?: string | null;
  alt?: string;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export default function QuestionImage({ imageUrl, alt, style }: QuestionImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Don't render anything if no image URL
  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }

  // Clean and validate the URL
  const cleanUrl = imageUrl.trim();
  
  // Basic URL validation
  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(cleanUrl)) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#DC2626" />
          <Text style={styles.errorText}>Invalid image URL</Text>
        </View>
      </View>
    );
  }

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (errorEvent: any) => {
    console.log('Image loading error:', errorEvent.nativeEvent?.error || 'Unknown error');
    setLoading(false);
    setError(true);
  };

  const handleLoad = (event: any) => {
    let width, height;
    
    if (Platform.OS === 'web') {
      // On web, dimensions are in event.nativeEvent.target
      width = event.nativeEvent.target?.naturalWidth || 0;
      height = event.nativeEvent.target?.naturalHeight || 0;
    } else {
      // On native platforms, dimensions are in event.nativeEvent.source
      width = event.nativeEvent.source?.width || 0;
      height = event.nativeEvent.source?.height || 0;
    }
    
    setImageDimensions({ width, height });
    setLoading(false);
    setError(false);
  };

  // Calculate responsive dimensions
  const maxWidth = screenWidth - 48; // Account for padding
  const aspectRatio = imageDimensions.width && imageDimensions.height 
    ? imageDimensions.width / imageDimensions.height 
    : 16 / 9; // Default aspect ratio

  const imageWidth = Math.min(maxWidth, imageDimensions.width || maxWidth);
  const imageHeight = imageWidth / aspectRatio;

  return (
    <View style={[styles.container, style]}>
      {/* Loading indicator */}
      {loading && !error && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      )}
      
      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#DC2626" />
          <Text style={styles.errorText}>Failed to load image</Text>
          <Text style={styles.errorSubtext}>Please check the image URL</Text>
        </View>
      )}
      
      {/* Image */}
      {!error && (
        <Image
          source={{ 
            uri: cleanUrl,
            // Add cache control for better performance
            cache: 'force-cache'
          }}
          style={[
            styles.image,
            {
              width: imageWidth,
              height: Math.min(imageHeight, 300), // Max height constraint
            },
            loading && styles.hidden
          ]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onLoad={handleLoad}
          resizeMode="contain"
          accessibilityLabel={alt || 'Question image'}
          accessibilityRole="image"
          // Performance optimizations
          fadeDuration={300}
          progressiveRenderingEnabled={true}
          // Add timeout for loading
          timeout={10000}
        />
      )}
      
      {/* Placeholder when no dimensions are known yet */}
      {!error && !imageDimensions.width && !loading && (
        <View style={styles.placeholderContainer}>
          <ImageIcon size={32} color="#9CA3AF" />
          <Text style={styles.placeholderText}>Image</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  image: {
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    minWidth: 200,
    minHeight: 150,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    zIndex: 1,
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    zIndex: 2,
    borderRadius: 8,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});