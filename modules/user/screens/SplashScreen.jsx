import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Home, MapPin, Key, Building2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export function SplashScreen({ onComplete, duration = 3000 }) {
  const [progress, setProgress] = useState(0);
  const [animationsRef] = useState({
    backgroundScale: new Animated.Value(1.2),
    backgroundOpacity: new Animated.Value(0),
    logoScale: new Animated.Value(0.3),
    logoRotate: new Animated.Value(0),
    contentOpacity: new Animated.Value(0),
    contentY: new Animated.Value(20),
    lineWidth: new Animated.Value(0),
    taglineOpacity: new Animated.Value(0),
    pillsOpacity: new Animated.Value(0),
    pillsY: new Animated.Value(20),
    progressBarOpacity: new Animated.Value(0),
    bottomOpacity: new Animated.Value(0),
    bottomY: new Animated.Value(30),
    icon1Y: new Animated.Value(50),
    icon1Opacity: new Animated.Value(0),
    icon2Y: new Animated.Value(-50),
    icon2Opacity: new Animated.Value(0),
    icon3X: new Animated.Value(-50),
    icon3Opacity: new Animated.Value(0),
    icon4X: new Animated.Value(50),
    icon4Opacity: new Animated.Value(0),
  });

  useEffect(() => {
    const {
      backgroundScale,
      backgroundOpacity,
      logoScale,
      logoRotate,
      contentOpacity,
      contentY,
      lineWidth,
      taglineOpacity,
      pillsOpacity,
      pillsY,
      progressBarOpacity,
      bottomOpacity,
      bottomY,
      icon1Y,
      icon1Opacity,
      icon2Y,
      icon2Opacity,
      icon3X,
      icon3Opacity,
      icon4X,
      icon4Opacity,
    } = animationsRef;

    // Start all animations
    const animationSequence = Animated.sequence([
      // Background fade in
      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backgroundScale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start();

    // Floating icons animations
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(icon1Y, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(icon1Opacity, {
          toValue: 0.15,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(icon2Y, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(icon2Opacity, {
          toValue: 0.15,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(icon3X, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(icon3Opacity, {
          toValue: 0.15,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(icon4X, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(icon4Opacity, {
          toValue: 0.15,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Logo animation
    setTimeout(() => {
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Brand name animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);

    // Line animation
    setTimeout(() => {
      Animated.timing(lineWidth, {
        toValue: 120,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }, 1100);

    // Tagline animation
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1300);

    // Pills animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(pillsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pillsY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    // Progress bar animation
    setTimeout(() => {
      Animated.timing(progressBarOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1700);

    // Bottom element animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bottomY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1900);

    // Progress counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Auto complete
    const completeTimeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [duration, onComplete]);

  const {
    backgroundScale,
    backgroundOpacity,
    logoScale,
    logoRotate,
    contentOpacity,
    contentY,
    lineWidth,
    taglineOpacity,
    pillsOpacity,
    pillsY,
    progressBarOpacity,
    bottomOpacity,
    bottomY,
    icon1Y,
    icon1Opacity,
    icon2Y,
    icon2Opacity,
    icon3X,
    icon3Opacity,
    icon4X,
    icon4Opacity,
  } = animationsRef;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D6A4F" />
      
      {/* Background Image with Overlay */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            opacity: backgroundOpacity,
            transform: [{ scale: backgroundScale }],
          },
        ]}
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjYwNzEyMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
      </Animated.View>

      {/* Floating Icons Background */}
      <View style={styles.iconsContainer}>
        <Animated.View
          style={[
            styles.icon1,
            {
              opacity: icon1Opacity,
              transform: [{ translateY: icon1Y }],
            },
          ]}
        >
          <Home color="#FFFFFF" size={64} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View
          style={[
            styles.icon2,
            {
              opacity: icon2Opacity,
              transform: [{ translateY: icon2Y }],
            },
          ]}
        >
          <Building2 color="#FFFFFF" size={80} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View
          style={[
            styles.icon3,
            {
              opacity: icon3Opacity,
              transform: [{ translateX: icon3X }],
            },
          ]}
        >
          <Key color="#FFFFFF" size={56} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View
          style={[
            styles.icon4,
            {
              opacity: icon4Opacity,
              transform: [{ translateX: icon4X }],
            },
          ]}
        >
          <MapPin color="#FFFFFF" size={64} strokeWidth={1.5} />
        </Animated.View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Logo Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoBox}>
            <Home color="#2D6A4F" size={48} strokeWidth={2.5} />
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
            },
          ]}
        >
          <Text style={styles.brandName}>EstateHub</Text>
          <Animated.View
            style={[
              styles.brandLine,
              { width: lineWidth },
            ]}
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={styles.tagline}>
            Your trusted partner in finding the perfect property
          </Text>
        </Animated.View>

        {/* Features Pills */}
        <Animated.View
          style={[
            styles.pillsContainer,
            {
              opacity: pillsOpacity,
              transform: [{ translateY: pillsY }],
            },
          ]}
        >
          <View style={styles.pill}>
            <Text style={styles.pillText}>Buy</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Sell</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Rent</Text>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          style={[
            styles.progressContainer,
            { opacity: progressBarOpacity },
          ]}
        >
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </Animated.View>
      </View>

      {/* Bottom Decorative Element */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: bottomOpacity,
            transform: [{ translateY: bottomY }],
          },
        ]}
      >
        <Text style={styles.bottomText}>Discover • Connect • Home</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D6A4F',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 106, 79, 0.88)',
  },
  iconsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon1: {
    position: 'absolute',
    top: 100,
    left: 40,
  },
  icon2: {
    position: 'absolute',
    top: 180,
    right: 50,
  },
  icon3: {
    position: 'absolute',
    bottom: 200,
    left: 50,
  },
  icon4: {
    position: 'absolute',
    bottom: 280,
    right: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBox: {
    width: 96,
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  brandLine: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    width: 200,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
});