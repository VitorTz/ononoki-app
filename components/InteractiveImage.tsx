import { wp } from '@/helpers/util';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
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

  useEffect(
    () => {
      const init = () => {
        scale.value = MAX_WIDTH / originalWidth
        translateX.value = 0
        translateY.value = 0
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
    .onEnd((e) => {
      'worklet';
      if (scale.value != originalScale || Math.abs(e.velocityX) <= 500) { return }
      e.velocityX < 0 ? runOnJS(swapLeft)() : runOnJS(swapRight)()      
  });

  // Double tap gesture
  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      if (scale.value != minZoom) {
        scale.value = withTiming(minZoom);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else {
        scale.value = withTiming(maxZoom)
      }
  });

  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onUpdate((e) => {
      'worklet';
      console.log(e.scale)
      let newScale = originalScale * e.scale
      newScale = newScale
      if (newScale < minZoom) newScale = minZoom;
      if (newScale > maxZoom) newScale = maxZoom;
      scale.value = newScale;
      translateX.value = e.focalX;
      translateY.value = e.focalY;
  });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value},
        { translateY: translateY.value},
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
