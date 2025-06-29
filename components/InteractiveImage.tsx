import { Colors } from '@/constants/Colors';
import { getRelativeHeight, wp } from '@/helpers/util';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

const MAX_WIDTH = wp(100)

interface InteractiveImageProps {
  imageUri: string
  width: number
  height: number
  minZoom?: number
  maxZoom?: number
  swapLeft: () => any
  swapRight: () => any
}

const InteractiveImage = ({
  imageUri,
  width,
  height,  
  minZoom = 0.5,
  maxZoom = 2,
  swapLeft,
  swapRight
}: InteractiveImageProps) => {
    
  const imageState = useSharedValue({ 
    scale: 1, 
    width: width, 
    height: height,
    currentWidth: width > MAX_WIDTH ? MAX_WIDTH : width,
    currentHeight: getRelativeHeight(width > MAX_WIDTH ? MAX_WIDTH : width, width, height)
  });

  // Inicialize shared values com primitivos ou props diretamente.
  const baseScale = useSharedValue(1);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  const pinchScale = useSharedValue(1);
  const panTranslateX = useSharedValue(0);
  const panTranslateY = useSharedValue(0);
  
  // Inicialize com as props minZoom e maxZoom.
  // Se initialState.value.scale fosse diferente de 1, você faria o ajuste em useEffect.
  const minZoomAdjusted = useSharedValue(minZoom);
  const maxZoomAdjusted = useSharedValue(maxZoom);

  useEffect(() => {
    // Atualize initialState se as props width/height mudarem.
    imageState.value = { 
      scale: 1, 
      width: width, 
      height: height,
      currentWidth: width > MAX_WIDTH ? MAX_WIDTH : width,
      currentHeight: getRelativeHeight(width > MAX_WIDTH ? MAX_WIDTH : width, width, height)
    }
        
    minZoomAdjusted.value = minZoom;
    maxZoomAdjusted.value = maxZoom;

    // Resetar transformações e escalas
    baseTranslateX.value = withTiming(0);
    baseTranslateY.value = withTiming(0);
    baseScale.value = withTiming(1);

    panTranslateX.value = 0;
    panTranslateY.value = 0;
    pinchScale.value = 1;

  }, [
      imageUri,
      width,
      height,
      minZoom,
      maxZoom
    ]);

  const clamp = (value: number, minVal: number, maxVal: number) => {
    'worklet';
    return Math.min(Math.max(value, minVal), maxVal);
  };

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => { })
    .onUpdate((event) => {
      if (event.numberOfPointers < 2) return;

      const proposedTotalAbsoluteScale = baseScale.value * event.scale;
      // Use minZoomAdjusted.value e maxZoomAdjusted.value aqui
      const newTotalAbsoluteScale = clamp(proposedTotalAbsoluteScale, minZoomAdjusted.value, maxZoomAdjusted.value);

      const newPinchScale = baseScale.value !== 0 ? newTotalAbsoluteScale / baseScale.value : newTotalAbsoluteScale;
      const incrementalScaleRatio = (pinchScale.value === 0 || (pinchScale.value === 1 && newPinchScale === 1)) ? 1 : newPinchScale / pinchScale.value;

      if (incrementalScaleRatio !== 1 && isFinite(incrementalScaleRatio)) {
        baseTranslateX.value = event.focalX - (event.focalX - baseTranslateX.value) * incrementalScaleRatio;
        baseTranslateY.value = event.focalY - (event.focalY - baseTranslateY.value) * incrementalScaleRatio;
      }

      pinchScale.value = newPinchScale;
    })
    .onEnd(() => {
      baseScale.value *= pinchScale.value;
      imageState.value.currentWidth = (imageState.value.width > MAX_WIDTH ? MAX_WIDTH : imageState.value.width) * baseScale.value
      imageState.value.currentHeight = imageState.value.currentWidth * (imageState.value.height / imageState.value.width)

      pinchScale.value = 1;
      
      const finalClampedScale = clamp(baseScale.value, minZoomAdjusted.value, maxZoomAdjusted.value);
      if (baseScale.value !== finalClampedScale) {
        baseScale.value = withTiming(finalClampedScale);
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Se a escala base for 1 (sem zoom), não permita arrastar a imagem, apenas o swipe.
      // Se estiver com zoom (baseScale.value !== 1), permita o pan.
      if (baseScale.value * pinchScale.value > 1.01 || baseScale.value * pinchScale.value < 0.99 && baseScale.value !== 1) { // Adiciona uma pequena tolerância
        panTranslateX.value = event.translationX;
        panTranslateY.value = event.translationY;
      }
    })
    .onEnd((event) => {      
      // Use initialState.value.scale (que é 1) para a condição de swipe.
      if (baseScale.value === imageState.value.scale && pinchScale.value === 1) {
        if (event.translationX >= 40) {
          runOnJS(swapRight)();
        } else if (event.translationX <= -40) {
          runOnJS(swapLeft)();
        }
      }
      baseTranslateX.value += panTranslateX.value;
      baseTranslateY.value += panTranslateY.value;
      panTranslateX.value = 0;
      panTranslateY.value = 0;
    })
    .minDistance(20)
    .activeOffsetX([-1000, 1000])
    .activeOffsetY([-1000, 1000])

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (pinchScale.value <= 1) {
        baseScale.value = withTiming(1.5);
        pinchScale.value = withTiming(1.5); 
      } else {
        baseScale.value = withTiming(imageState.value.scale);
        pinchScale.value = withTiming(1); 
      }
      baseTranslateX.value = withTiming(0);
      baseTranslateY.value = withTiming(0);
      panTranslateX.value = withTiming(0);
      panTranslateY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {    
    return {
      transform: [
        { translateX: baseTranslateX.value + panTranslateX.value },
        { translateY: baseTranslateY.value + panTranslateY.value }
      ],
      width: imageState.value.currentWidth, height: imageState.value.currentHeight
    };
  });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );
      
  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        {/* Use as props width e height diretamente para o tamanho base do Animated.View */}
        <Animated.View style={[
          styles.image,
          animatedStyle          
        ]} >
          <Image
            cachePolicy={'disk'}
            source={imageUri}
            style={{ width: '100%', height: '100%' }}
            contentFit='cover' />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.black,
  },
  image: {
    // As dimensões são definidas dinamicamente via props e animatedStyle
  },
});


export default InteractiveImage;