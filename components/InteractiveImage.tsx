import { ChapterImage } from '@/helpers/types';
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
  chapterImage: ChapterImage
  swapLeft: () => any;
  swapRight: () => any;
}

const MAX_WIDTH = wp(100)
const MIN_SCALE = 1
const MAX_SCALE = 2.5
const DOUBLE_TAP_ZOOM = 1.8
const HORIZONTAL_VELOCITY_THRESHOLD = 500


export default function InteractiveImage({
  chapterImage,
  swapLeft,
  swapRight,
}: InteractiveImageProps) {
  
  const ORIGINAL_SCALE = MAX_WIDTH / chapterImage.width
  const scale = useSharedValue(1.0)
  const savedScale = useSharedValue(1.0)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const baseTranslateX = useSharedValue(0)
  const baseTranslateY = useSharedValue(0)

  useEffect(
    () => {
      const init = () => {
        scale.value = 1.0
        translateX.value = 0
        translateY.value = 0
        baseTranslateX.value = 0
        baseTranslateY.value = 0
      }
      init()
    },
    [chapterImage]
  )

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      'worklet';
    })
    .onUpdate((e) => {
      if (scale.value != 1.0) {        
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
      if (scale.value != 1.0 || Math.abs(e.velocityX) <= HORIZONTAL_VELOCITY_THRESHOLD) { return }
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
      if (scale.value != 1.0) {
        scale.value = withTiming(1.0)
        savedScale.value = 1.0
        baseTranslateX.value = withTiming(0)
        baseTranslateY.value = withTiming(0)
      } else {
        scale.value = withTiming(DOUBLE_TAP_ZOOM)
        savedScale.value = DOUBLE_TAP_ZOOM
      }
  });  

  const pinch = Gesture.Pinch()
    .onStart(() => {})
    .onUpdate((event) => {
      let nextScale = savedScale.value * event.scale      
      if (nextScale < MIN_SCALE) nextScale = MIN_SCALE
      if (nextScale > MAX_SCALE) nextScale = MAX_SCALE
      scale.value = nextScale
    })
    .onEnd(() => {
      savedScale.value = scale.value
      if (scale.value === MIN_SCALE) {
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
        { scale: ORIGINAL_SCALE * scale.value },
      ],
    };
  });

  const composedGesture = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinch, pan)
  );

  return (
    <GestureDetector gesture={composedGesture} >
      <Animated.View style={[animatedStyle, {width: chapterImage.width, height: chapterImage.height}]} >
        <Image 
          source={chapterImage.image_url} 
          style={styles.image}
          contentFit='contain'
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%', height: '100%'
  }
})