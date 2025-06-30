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
    .onUpdate((e) => {
      'worklet';
      if (e.numberOfPointers < 2) { return }
      let newScale = scale.value * e.scale;
      if (newScale < minZoom) newScale = minZoom;
      if (newScale > maxZoom) newScale = maxZoom;
      scale.value = newScale;  
    })
    .onEnd(() => {
      if (scale.value >= originalScale) {
        baseTranslateX.value = withTiming(0)
        baseTranslateY.value = withTiming(0)
      }
    })
    

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: baseTranslateX.value + translateX.value},
        { translateY: baseTranslateY.value + translateY.value},
        { scale: scale.value },        
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