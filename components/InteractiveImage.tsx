import { Colors } from '@/constants/Colors';
import { getRelativeHeight, hp, wp } from '@/helpers/util';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native'; // Renomeado para evitar conflito
import {
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';


interface InteractiveImageProps {
  imageUri: string,
  imageWidth: number, // Largura original da imagem
  imageHeight: number, // Altura original da imagem
  containerWidth?: number,
  containerHeight?: number,
  minZoom?: number,
  maxZoom?: number
}

const InteractiveImage = ({
  imageUri,
  imageWidth: originalImageWidth, // Largura original da imagem
  imageHeight: originalImageHeight, // Altura original da imagem
  containerWidth = wp(100),
  containerHeight = hp(100),
  minZoom = 0.5,
  maxZoom = 5
}: InteractiveImageProps) => {

  // Calcula a escala inicial para a imagem caber no container (contain)  
  const getInitialState = (
    imgWidth: number,
    imgHeight: number,
    contWidth: number    
  ) => {
    let width = imgWidth
    let height = imgHeight
    if (imgWidth > contWidth) {
      width = contWidth
      height = getRelativeHeight(contWidth, imgWidth, imgHeight)
    }

    return {
      scale: 1,
      width,
      height
    };

  };

  const initialState = getInitialState(
    originalImageWidth,
    originalImageHeight,
    containerWidth
  );  
  
  // Ajusta os valores base para a escala inicial 'contain'
  // Valores base (acumulados)
  const baseScale = useSharedValue(initialState.scale);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  // Valores de transformação durante o gesto ativo
  const pinchScale = useSharedValue(1); // Escala do gesto de pinça atual
  const panTranslateX = useSharedValue(0); // Translação do gesto de pan atual
  const panTranslateY = useSharedValue(0);  
  
  const MIN_ZOOM_ADJUSTED = useRef(minZoom * initialState.scale);
  const MAX_ZOOM_ADJUSTED = useRef(maxZoom * initialState.scale);

  useEffect(() => {
    // Recalcula o estado inicial com base nas props atuais
    const newInitialState = getInitialState(
      originalImageWidth,
      originalImageHeight,
      containerWidth      
    );

    // Atualiza os limites de zoom
    MIN_ZOOM_ADJUSTED.current = minZoom * newInitialState.scale;
    MAX_ZOOM_ADJUSTED.current = maxZoom * newInitialState.scale;

    // Reseta os shared values para o estado inicial da nova imagem
    baseTranslateX.value = withTiming(0);
    baseTranslateY.value = withTiming(0);
    baseScale.value = withTiming(newInitialState.scale);

    // Reseta também os offsets
    panTranslateX.value = 0;
    panTranslateY.value = 0;
    pinchScale.value = 1;

  }, [imageUri]);

  const clamp = (value: number, min: number, max: number) => {
    'worklet'; // Indica que esta função pode rodar no thread de UI
    return Math.min(Math.max(value, min), max);
  };

 const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      // Não precisamos mais salvar event.focalX/Y em shared values para esta fórmula específica,
      // pois usaremos os valores de event.focalX/Y diretamente do onUpdate.
      // No entanto, se você tivesse outra lógica que precisasse do ponto focal inicial, poderia mantê-los.
      // focalX.value = event.focalX; // Pode ser removido se não usado em outro lugar
      // focalY.value = event.focalY; // Pode ser removido se não usado em outro lugar
    })
    .onUpdate((event) => {
      if (event.numberOfPointers < 2) return; // Ignora se não for pinch real (ajustado de event.numberOfPointers < 2 && pinchScale.value === 1)

      const proposedTotalAbsoluteScale = baseScale.value * event.scale;
      const newTotalAbsoluteScale = clamp(proposedTotalAbsoluteScale, MIN_ZOOM_ADJUSTED.current, MAX_ZOOM_ADJUSTED.current);
      
      // newPinchScale é o fator que, multiplicado por baseScale.value, resulta na nova escala absoluta clampada.
      // Se baseScale.value for 0, evite divisão. (Na sua lógica, baseScale.value começa em 1).
      const newPinchScale = baseScale.value !== 0 ? newTotalAbsoluteScale / baseScale.value : newTotalAbsoluteScale;

      const incrementalScaleRatio = (pinchScale.value === 0 || pinchScale.value === 1 && newPinchScale === 1) ? 1 : newPinchScale / pinchScale.value;

      if (incrementalScaleRatio !== 1 && isFinite(incrementalScaleRatio)) {
        baseTranslateX.value = event.focalX - (event.focalX - baseTranslateX.value) * incrementalScaleRatio;
        baseTranslateY.value = event.focalY - (event.focalY - baseTranslateY.value) * incrementalScaleRatio;
      }
      
      pinchScale.value = newPinchScale;
    })
    .onEnd(() => {
      baseScale.value *= pinchScale.value;
      pinchScale.value = 1;

      const finalClampedScale = clamp(baseScale.value, MIN_ZOOM_ADJUSTED.current, MAX_ZOOM_ADJUSTED.current);
      if (baseScale.value !== finalClampedScale) {
        baseScale.value = withTiming(finalClampedScale);
      }      
      
      // focalX.value e focalY.value podem ser resetados se não forem mais necessários
      // focalX.value = 0;
      // focalY.value = 0;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Só permite pan se estiver com zoom (ou se a imagem for maior que o container)
      // if (baseScale.value * pinchScale.value > initialScale || initialImageDisplayWidth * baseScale.value * pinchScale.value > containerWidth) {
        panTranslateX.value = event.translationX;
        panTranslateY.value = event.translationY;
      // }
    })
    .onEnd(() => {
      baseTranslateX.value += panTranslateX.value;
      baseTranslateY.value += panTranslateY.value;
      panTranslateX.value = 0; // Reseta para o próximo gesto
      panTranslateY.value = 0;      
    })
    .minDistance(10) // Evita ativar o pan com toques simples
    .activeOffsetX([-1000, 1000]) // Permite pan em qualquer direção horizontal
    .activeOffsetY([-1000, 1000]); // Permite pan em qualquer direção vertical


  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Anima para o estado inicial
      baseScale.value = withTiming(initialState.scale);
      baseTranslateX.value = withTiming(0);
      baseTranslateY.value = withTiming(0);
      pinchScale.value = withTiming(1); // Garante reset
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

  // Ordem dos gestos: doubleTap primeiro, depois simultaneous pan/pinch
  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );
  
  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        <Animated.View style={[
              styles.image,
              {
                width: initialState.width, // Usa a largura calculada para 'contain'
                height: initialState.height, // Usa a altura calculada para 'contain'
              },
              animatedStyle,
            ]} >
              <Image cachePolicy={'disk'} source={imageUri} style={{width: '100%', height: '100%'}} contentFit='contain' />
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
    // As dimensões são definidas dinamicamente para o modo 'contain' inicial
  },
});


export default InteractiveImage;