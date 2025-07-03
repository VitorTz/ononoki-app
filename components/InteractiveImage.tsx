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
  const minScale = 1
  const maxScale = 2.5

  const scale = useSharedValue(1);  
  const savedScale = useSharedValue(1)  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  useEffect(
    () => {
      const init = () => {
        scale.value = 1
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
      if (scale.value != 1) {        
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
      if (scale.value != 1 || Math.abs(e.velocityX) <= 500) { return }
      e.velocityX < 0 ? runOnJS(swapLeft)() : runOnJS(swapRight)()      
    })
    .minDistance(10)
    .activeOffsetX([-1000, 1000])
    .activeOffsetY([-1000, 1000])
  
  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .numberOfTaps(2)
    .onEnd((e) => {
      'worklet';
      if (scale.value != 1) {
        scale.value = withTiming(1)
        savedScale.value = 1
        baseTranslateX.value = withTiming(0)
        baseTranslateY.value = withTiming(0)
      } else {
        scale.value = withTiming(1.8)       
        savedScale.value = 1.8
      }
  });  

  const pinch = Gesture.Pinch()
    .onStart(() => {})
    .onUpdate((event) => {
      let nextScale = savedScale.value * event.scale      
      if (nextScale < minScale) nextScale = minScale
      if (nextScale > maxScale) nextScale = maxScale      
      scale.value = nextScale
    })
    .onEnd(() => {
      savedScale.value = scale.value
      if (scale.value === minScale) {
        baseTranslateX.value = 0
        baseTranslateY.value = 0
        translateX.value = 0
        translateY.value = 0
      }
    })
     

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: baseTranslateX.value + translateX.value},
        { translateY: baseTranslateY.value + translateY.value},
        { scale: originalScale * scale.value },
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