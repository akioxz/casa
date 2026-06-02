import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        // Fade in + scale up
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // After 2.5 seconds, fade out then navigate
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                navigation.replace('Onboarding');
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.logoBox}>
                    <Text style={styles.logoText}>C</Text>
                </View>
                <Text style={styles.appName}>Casa</Text>
                <Text style={styles.tagline}>Premium Furniture</Text>
            </Animated.View>

            <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
                Crafted with care
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoBox: {
        width: 90,
        height: 90,
        borderRadius: 24,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 52,
        fontWeight: '700',
        color: COLORS.primary,
        lineHeight: 60,
    },
    appName: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 4,
        marginBottom: 8,
    },
    tagline: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: 1.5,
    },
});

export default SplashScreen;