import { wp } from '@/helpers/util';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

interface InteractiveImageProps {
  imageUri: string;
  originalWidth: number;
  originalHeight: number;
  swapLeft: () => any;
  swapRight: () => any;
}

const MAX_WIDTH = wp(100)


export default function InteractiveImage({
  imageUri,
  originalWidth,
  originalHeight,  
  swapLeft,
  swapRight,
}: InteractiveImageProps) {
  
  const originalScale = MAX_WIDTH / originalWidth
  const maxZoom = originalScale * 2
  const minZoom = originalScale
  const scale = useSharedValue(1);
  const pinchScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  useEffect(
    () => {
      const init = () => {
        scale.value = MAX_WIDTH / originalWidth
        translateX.value = 0
        translateY.value = 0
        baseTranslateX.value = 0
        baseTranslateY.value = 0
      }
      init()
    },
    [imageUri, originalWidth, originalHeight]
  )

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      'worklet';
    })
    .onUpdate((e) => {
      if (scale.value != originalScale) {        
        translateX.value = e.translationX
        translateY.value = e.translationY
      }
    })
    .onEnd((e) => {
      'worklet';
      baseTranslateX.value += translateX.value;
      baseTranslateY.value += translateY.value;
      translateX.value = 0;
      translateY.value = 0;
      if (scale.value != originalScale || Math.abs(e.velocityX) <= 500) { return }
      e.velocityX < 0 ? runOnJS(swapLeft)() : runOnJS(swapRight)()      
    })
    .minDistance(10)
    .activeOffsetX([-1000, 1000])
    .activeOffsetY([-1000, 1000])

  // Double tap gesture
  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .numberOfTaps(2)
    .onEnd((e) => {
      'worklet';
      if (scale.value != minZoom) {      
        scale.value = withTiming(minZoom);
        baseTranslateX.value = withTiming(0);
        baseTranslateY.value = withTiming(0);
      } else {
        scale.value = withTiming(maxZoom)
      }
  });

  const clamp = (value: number, min: number, max: number) => {
    'worklet'; // Indica que esta função pode rodar no thread de UI
    return Math.min(Math.max(value, min), max);
  };

  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onUpdate((event) => {
      'worklet';
      if (event.numberOfPointers < 2) { return }
      // let newScale = scale.value * e.scale;
      // if (newScale < minZoom) newScale = minZoom;
      // if (newScale > maxZoom) newScale = maxZoom;
      // scale.value = newScale;  
      const proposedTotalAbsoluteScale = originalScale * event.scale;
      const newTotalAbsoluteScale = clamp(proposedTotalAbsoluteScale, minZoom, maxZoom);
      
      // newPinchScale é o fator que, multiplicado por baseScale.value, resulta na nova escala absoluta clampada.
      // Se baseScale.value for 0, evite divisão. (Na sua lógica, baseScale.value começa em 1).
      const newPinchScale = scale.value !== 0 ? newTotalAbsoluteScale / scale.value : newTotalAbsoluteScale;

      const incrementalScaleRatio = (pinchScale.value === 0 || pinchScale.value === 1 && newPinchScale === 1) ? 1 : newPinchScale / pinchScale.value;

      if (incrementalScaleRatio !== 1 && isFinite(incrementalScaleRatio)) {
        baseTranslateX.value = event.focalX - (event.focalX - baseTranslateX.value) * incrementalScaleRatio;
        baseTranslateY.value = event.focalY - (event.focalY - baseTranslateY.value) * incrementalScaleRatio;
      }
      
      pinchScale.value = newPinchScale;
    })
    .onEnd(() => {
      // if (scale.value >= originalScale) {
      //   baseTranslateX.value = withTiming(0)
      //   baseTranslateY.value = withTiming(0)
      // }
      scale.value *= pinchScale.value;
      pinchScale.value = 1;

      const finalClampedScale = clamp(scale.value, minZoom, maxZoom);
      if (scale.value !== finalClampedScale) {
        scale.value = withTiming(finalClampedScale);
      }
    })
    

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const currentTotalScale = scale.value * pinchScale.value;
    return {
      transform: [
        { translateX: baseTranslateX.value + translateX.value},
        { translateY: baseTranslateY.value + translateY.value},
        { scale: currentTotalScale },        
      ],
    };
  });

  const composedGesture = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinch, pan)
  );

  return (
    <GestureDetector gesture={composedGesture} >
      <Animated.View style={[animatedStyle, {width: originalWidth, height: originalHeight}]} >
        <Image 
          source={imageUri} 
          style={{width: '100%', height: '100%'}} 
          contentFit='contain'
        />
      </Animated.View>
    </GestureDetector>
  );
}