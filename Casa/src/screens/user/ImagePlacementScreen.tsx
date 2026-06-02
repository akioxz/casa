import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserStackParamList } from '../../navigation/types';
import { COLORS, THEME } from '../../constants/theme';
import { MOCK_FURNITURE } from './HomeScreen';
import Button from '../../components/Button';

type ImagePlacementScreenProps = NativeStackScreenProps<UserStackParamList, 'ImagePlacement'>;

const { width, height } = Dimensions.get('window');
const CANVAS_HEIGHT = height * 0.55;

export const ImagePlacementScreen: React.FC<ImagePlacementScreenProps> = ({ route, navigation }) => {
  const { imageUrl } = route.params;

  // Background room image (default to a stylish minimal loft room)
  const [roomImage, setRoomImage] = useState<string>(
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'
  );

  // Overlay furniture image
  const [furnitureImage, setFurnitureImage] = useState<string | number>(
    imageUrl || MOCK_FURNITURE[0].image_url
  );

  // Layout parameters for placing the furniture item on top of the room
  const [posX, setPosX] = useState(width / 2 - 80);
  const [posY, setPosY] = useState(CANVAS_HEIGHT / 2 - 80);
  const [scale, setScale] = useState(1.0);

  const requestPermissionAndPickRoom = async (fromCamera: boolean) => {
    const { status } = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', `We need ${fromCamera ? 'camera' : 'gallery'} access to load your room background.`);
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setRoomImage(pickerResult.assets[0].uri);
    }
  };

  const handleDrag = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 20;
    if (direction === 'up') setPosY((p) => Math.max(0, p - step));
    if (direction === 'down') setPosY((p) => Math.min(CANVAS_HEIGHT - 120, p + step));
    if (direction === 'left') setPosX((p) => Math.max(0, p - step));
    if (direction === 'right') setPosX((p) => Math.min(width - 120, p + step));
  };

  const handleScale = (action: 'grow' | 'shrink') => {
    if (action === 'grow') setScale((s) => Math.min(2.0, s + 0.1));
    if (action === 'shrink') setScale((s) => Math.max(0.5, s - 0.1));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Casa Space Visualizer</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() =>
            Alert.alert(
              'Space Visualizer Guide',
              '1. Import a photo of your room using the buttons below.\n2. Select a product from the list.\n3. Position and resize the furniture overlay using the control deck to see how it fits.'
            )
          }
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Canvas Area */}
      <View style={styles.canvasContainer}>
        {/* Background Room Photo */}
        <Image source={{ uri: roomImage }} style={styles.roomBackground} />

        {/* Overlay Furniture Item */}
        <View
          style={[
            styles.furnitureOverlay,
            {
              left: posX,
              top: posY,
              transform: [{ scale: scale }],
            },
          ]}
        >
          <Image
            source={
              typeof furnitureImage === 'number'
                ? furnitureImage
                : { uri: furnitureImage }
            }
            style={styles.furnitureImage}
          />
        </View>

        {/* Floating Calibration Deck */}
        <View style={styles.calibrationDeck}>
          <TouchableOpacity style={styles.deckBtn} onPress={() => handleScale('grow')}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.deckText}>Scale +</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deckBtn} onPress={() => handleScale('shrink')}>
            <Ionicons name="remove-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.deckText}>Scale -</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deckBtn}
            onPress={() => {
              setPosX(width / 2 - 80);
              setPosY(CANVAS_HEIGHT / 2 - 80);
              setScale(1.0);
            }}
          >
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            <Text style={styles.deckText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Control Panel Deck */}
      <View style={styles.controlsContainer}>
        {/* Positional Direction Pad */}
        <View style={styles.dPadSection}>
          <View style={styles.dPadRow}>
            <TouchableOpacity style={styles.dPadBtn} onPress={() => handleDrag('up')}>
              <Ionicons name="chevron-up" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dPadRowMiddle}>
            <TouchableOpacity style={styles.dPadBtn} onPress={() => handleDrag('left')}>
              <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.dPadCenter}>
              <Ionicons name="move-outline" size={16} color={COLORS.textMuted} />
            </View>
            <TouchableOpacity style={styles.dPadBtn} onPress={() => handleDrag('right')}>
              <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dPadRow}>
            <TouchableOpacity style={styles.dPadBtn} onPress={() => handleDrag('down')}>
              <Ionicons name="chevron-down" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Room Upload Source Actions */}
        <View style={styles.sourceActions}>
          <TouchableOpacity
            style={styles.actionBlock}
            onPress={() => requestPermissionAndPickRoom(false)}
          >
            <Ionicons name="images-outline" size={22} color={COLORS.primary} />
            <Text style={styles.actionBlockText}>Upload Room</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBlock}
            onPress={() => requestPermissionAndPickRoom(true)}
          >
            <Ionicons name="camera-outline" size={22} color={COLORS.primary} />
            <Text style={styles.actionBlockText}>Take Room Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Furniture Selection Carousel */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselHeader}>Tap to Place Different Items</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScroll}
        >
          {MOCK_FURNITURE.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.carouselCard,
                furnitureImage === item.image_url && styles.activeCarouselCard,
              ]}
              onPress={() => setFurnitureImage(item.image_url)}
            >
              <Image
                source={
                  typeof item.image_url === 'number'
                    ? item.image_url
                    : { uri: item.image_url }
                }
                style={styles.carouselImg}
              />
              <Text style={styles.carouselCardText} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backButton: {
    padding: THEME.spacing.xs,
  },
  infoButton: {
    padding: THEME.spacing.xs,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  canvasContainer: {
    width: width,
    height: CANVAS_HEIGHT,
    position: 'relative',
    backgroundColor: '#EAE6DF',
    overflow: 'hidden',
  },
  roomBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  furnitureOverlay: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  furnitureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  calibrationDeck: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    left: THEME.spacing.md,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: 4,
    ...THEME.shadows.small,
  },
  deckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm - 2,
    paddingVertical: 4,
  },
  deckText: {
    fontSize: 10,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginLeft: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  dPadSection: {
    alignItems: 'center',
  },
  dPadRow: {
    alignItems: 'center',
  },
  dPadRowMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dPadBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dPadCenter: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  sourceActions: {
    width: '50%',
    justifyContent: 'center',
  },
  actionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm - 2,
    marginBottom: THEME.spacing.sm,
    justifyContent: 'center',
  },
  actionBlockText: {
    fontSize: THEME.typography.fontSize.xs,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginLeft: THEME.spacing.sm - 2,
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: THEME.spacing.sm,
  },
  carouselHeader: {
    fontSize: 10,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.xs,
  },
  carouselScroll: {
    paddingHorizontal: THEME.spacing.lg,
  },
  carouselCard: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 6,
    marginRight: THEME.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCarouselCard: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  carouselImg: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  carouselCardText: {
    fontSize: 8,
    fontFamily: THEME.typography.fontFamily.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default ImagePlacementScreen;
