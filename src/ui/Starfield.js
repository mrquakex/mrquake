import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function Layer({ seed, count, color, phase }) {
  const op = useRef(new Animated.Value(0.4)).current;
  const stars = useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: count }, () => ({ x: r() * W, y: r() * H, r: 0.5 + r() * 1.4 }));
  }, [seed, count]);
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 1800 + phase, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.3, duration: 1800 + phase, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [op, phase]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: op }]}>
      <Svg width={W} height={H}>
        {stars.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={color} />)}
      </Svg>
    </Animated.View>
  );
}

export default function Starfield() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#060A1E' }]} />
      <View style={{ position: 'absolute', top: -H * 0.1, left: -W * 0.3, width: W * 1.2, height: W * 1.2, borderRadius: W, backgroundColor: 'rgba(110,60,220,0.16)' }} />
      <View style={{ position: 'absolute', top: H * 0.25, right: -W * 0.4, width: W * 1.1, height: W * 1.1, borderRadius: W, backgroundColor: 'rgba(30,130,230,0.12)' }} />
      <Layer seed={11} count={50} color="#FFFFFF" phase={0} />
      <Layer seed={97} count={40} color="#9BEFFF" phase={900} />
      <Layer seed={523} count={25} color="#FFD9A0" phase={1600} />
    </View>
  );
}
