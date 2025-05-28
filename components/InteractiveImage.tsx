import { Colors } from '@/constants/Colors';
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

  // initialState ainda pode ser útil para armazenar valores base que mudam com props.
  // Sua atualização será feita em useEffect.
  const initialState = useSharedValue({ scale: 1, width: width, height: height });

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
    initialState.value = { scale: 1, width: width, height: height };
    
    // Atualize os limites de zoom com base nas props.
    minZoomAdjusted.value = minZoom; // Assumindo que a escala base para zoom é 1
    maxZoomAdjusted.value = maxZoom; // Assumindo que a escala base para zoom é 1

    // Resetar transformações e escalas
    baseTranslateX.value = withTiming(0);
    baseTranslateY.value = withTiming(0);
    baseScale.value = withTiming(1); // Resetar para a escala base (1)

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
      if (baseScale.value === initialState.value.scale && pinchScale.value === 1) {
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
    .activeOffsetX([-1000, 1000]) // Permite grande movimento no eixo X
    .activeOffsetY([-1000, 1000]); // Permite grande movimento no eixo Y


  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Use initialState.value.scale (que é 1) para resetar.
      baseScale.value = withTiming(initialState.value.scale);
      baseTranslateX.value = withTiming(0);
      baseTranslateY.value = withTiming(0);
      pinchScale.value = withTiming(1); 
      panTranslateX.value = withTiming(0);
      panTranslateY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const currentTotalScale = baseScale.value * pinchScale.value;
    return {
      transform: [
        { translateX: baseTranslateX.value + panTranslateX.value },
        { translateY: baseTranslateY.value + panTranslateY.value },
        { scale: currentTotalScale },
      ],
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
          { width, height },
          animatedStyle,
        ]} >
          <Image
            cachePolicy={'disk'}
            source={imageUri}
            style={{ width, height }}
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