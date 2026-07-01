import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

interface BlobConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  fromScale: number;
  toScale: number;
}

const BLOBS: BlobConfig[] = [
  { x: -W * 0.2, y: -H * 0.08, size: W * 0.85, color: '#c7d2fe', duration: 6000, delay: 0,    fromScale: 0.9,  toScale: 1.15 },
  { x: W * 0.35, y: H * 0.42,  size: W * 0.70, color: '#a5b4fc', duration: 7500, delay: 700,  fromScale: 1.0,  toScale: 1.2  },
  { x: -W * 0.1, y: H * 0.55,  size: W * 0.60, color: '#e0e7ff', duration: 9000, delay: 1400, fromScale: 0.85, toScale: 1.1  },
  { x: W * 0.5,  y: -H * 0.05, size: W * 0.55, color: '#ddd6fe', duration: 5500, delay: 350,  fromScale: 1.05, toScale: 0.85 },
];

function Blob({ cfg }: { cfg: BlobConfig }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(cfg.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: cfg.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: cfg.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [cfg.fromScale, cfg.toScale] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.72, 0.5] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left:    cfg.x,
        top:     cfg.y,
        width:   cfg.size,
        height:  cfg.size,
        borderRadius: cfg.size / 2,
        backgroundColor: cfg.color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

interface EtherealBackgroundProps {
  children?: React.ReactNode;
  intensity?: number;
}

export default function EtherealBackground({ children, intensity = 0.20 }: EtherealBackgroundProps) {
  return (
    <View style={s.container}>
      {/* Fond blanc */}
      <View style={s.base} />

      {/* Blobs */}
      <View style={[s.blobLayer, { opacity: intensity }]}>
        {BLOBS.map((b, i) => <Blob key={i} cfg={b} />)}
      </View>

      {/* Voile */}
      <View style={s.veil} />

      {/* Contenu */}
      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#f8fafc' },
  base:      { ...StyleSheet.absoluteFill, backgroundColor: '#f8fafc' },
  blobLayer: { ...StyleSheet.absoluteFill },
  veil:      { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(248,250,252,0.50)' },
  content:   { flex: 1 },
});
