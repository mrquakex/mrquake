import React from 'react';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Ellipse, Path, Rect, G } from 'react-native-svg';

export const COLORS = {
  bg: '#060A1E', panel: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)',
  cyan: '#4FD8FF', violet: '#B46CFF', gold: '#FFC857', orange: '#FF8A4C', green: '#5BE39A', red: '#FF5C7A',
  text: '#EAF1FF', dim: '#8A97BD',
};

export function Planet({ size = 260 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 260 260">
      <Defs>
        <RadialGradient id="sph" cx="35%" cy="30%" r="80%">
          <Stop offset="0" stopColor="#8FEFFF" />
          <Stop offset="0.35" stopColor="#3C8DFF" />
          <Stop offset="0.75" stopColor="#3A2A9E" />
          <Stop offset="1" stopColor="#120B45" />
        </RadialGradient>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0.7" stopColor="#4FD8FF" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#4FD8FF" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#B46CFF" stopOpacity="0.1" />
          <Stop offset="0.5" stopColor="#FFC857" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#B46CFF" stopOpacity="0.1" />
        </LinearGradient>
        <RadialGradient id="shade" cx="30%" cy="28%" r="85%">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </RadialGradient>
      </Defs>
      <Circle cx="130" cy="130" r="128" fill="url(#glow)" />
      <G rotation="-18" origin="130, 130">
        <Ellipse cx="130" cy="130" rx="122" ry="30" fill="none" stroke="url(#ring)" strokeWidth="7" />
        <Ellipse cx="130" cy="130" rx="108" ry="25" fill="none" stroke="url(#ring)" strokeWidth="2" opacity="0.6" />
      </G>
      <Circle cx="130" cy="130" r="86" fill="url(#sph)" />
      <Path d="M70 110 q18 -26 44 -14 q14 8 6 22 q-10 14 -26 10 q-14 -2 -24 -18z" fill="#8CF5C0" opacity="0.5" />
      <Path d="M138 150 q22 -12 40 4 q10 14 -4 24 q-22 8 -36 -6 q-8 -12 0 -22z" fill="#8CF5C0" opacity="0.4" />
      <Path d="M112 70 q16 -6 30 4 q6 8 -6 12 q-18 2 -24 -16z" fill="#fff" opacity="0.3" />
      <Circle cx="130" cy="130" r="86" fill="url(#shade)" />
      <Circle cx="130" cy="130" r="86" fill="none" stroke="#9BEFFF" strokeWidth="1.5" opacity="0.5" />
      <G rotation="-18" origin="130, 130">
        <Path d="M8 130 A122 30 0 0 0 252 130" fill="none" stroke="url(#ring)" strokeWidth="7" />
        <Path d="M22 130 A108 25 0 0 0 238 130" fill="none" stroke="url(#ring)" strokeWidth="2" opacity="0.6" />
      </G>
    </Svg>
  );
}

export function Astronaut({ color = '#4FD8FF', size = 64, tool = 'none' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id={'v' + color} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1B2A6B" />
          <Stop offset="1" stopColor="#05081F" />
        </LinearGradient>
        <LinearGradient id={'b' + color} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#B9C6E6" />
        </LinearGradient>
      </Defs>
      <Rect x="14" y="26" width="10" height="20" rx="4" fill="#8693B8" />
      <Rect x="20" y="28" width="26" height="28" rx="9" fill={`url(#b${color})`} />
      <Rect x="26" y="40" width="14" height="8" rx="3" fill={color} />
      <Circle cx="33" cy="44" r="1.8" fill="#fff" />
      <Rect x="14" y="50" width="12" height="9" rx="4" fill="#DCE5FA" />
      <Rect x="40" y="50" width="12" height="9" rx="4" fill="#DCE5FA" />
      <Rect x="44" y="30" width="10" height="16" rx="5" fill="#EEF3FF" />
      <Rect x="44" y="40" width="10" height="5" rx="2.5" fill={color} />
      <Circle cx="33" cy="22" r="15" fill={`url(#b${color})`} />
      <Rect x="21" y="14" width="24" height="16" rx="8" fill={`url(#v${color})`} />
      <Path d="M24 18 q6 -5 12 -2" stroke="#9BEFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      <Circle cx="40" cy="24" r="1.4" fill="#9BEFFF" opacity="0.6" />
      <Circle cx="33" cy="22" r="15" fill="none" stroke={color} strokeWidth="2" opacity="0.9" />
      {tool === 'pick' && (<G><Path d="M52 24 L58 56" stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round" /><Path d="M46 24 q8 -8 16 0" stroke="#C9D3EA" strokeWidth="3.5" strokeLinecap="round" fill="none" /></G>)}
      {tool === 'wrench' && (<G><Path d="M54 26 L52 54" stroke="#C9D3EA" strokeWidth="3.5" strokeLinecap="round" /><Circle cx="54.5" cy="24" r="5" fill="none" stroke="#C9D3EA" strokeWidth="3" /></G>)}
      {tool === 'coin' && (<G><Circle cx="54" cy="30" r="6" fill="#FFC857" /><Circle cx="54" cy="30" r="3.5" fill="none" stroke="#B98A1E" strokeWidth="1.5" /></G>)}
    </Svg>
  );
}

export function BuildingIcon({ id, size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFB070" /><Stop offset="1" stopColor="#C4561A" /></LinearGradient>
        <LinearGradient id="r1" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#9BEFFF" /><Stop offset="1" stopColor="#2A7FD6" /></LinearGradient>
        <LinearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFE08A" /><Stop offset="1" stopColor="#D59A1A" /></LinearGradient>
        <RadialGradient id="g1" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#FFD27A" stopOpacity="0.9" /><Stop offset="1" stopColor="#FFD27A" stopOpacity="0" /></RadialGradient>
      </Defs>
      {id === 'mine' && (<G>
        <Path d="M10 56 L54 56 L46 42 L18 42Z" fill="#2B3566" />
        <Rect x="26" y="14" width="12" height="28" rx="3" fill="url(#m1)" />
        <Path d="M32 56 L26 42 L38 42Z" fill="#FFD27A" />
        <Circle cx="32" cy="20" r="14" fill="url(#g1)" />
        <Path d="M20 26 L32 8 L44 26Z" fill="#C9D3EA" />
        <Rect x="14" y="30" width="6" height="12" rx="2" fill="#8693B8" />
        <Rect x="44" y="30" width="6" height="12" rx="2" fill="#8693B8" />
      </G>)}
      {id === 'refinery' && (<G>
        <Rect x="8" y="30" width="20" height="26" rx="5" fill="url(#r1)" />
        <Rect x="34" y="22" width="22" height="34" rx="5" fill="url(#r1)" />
        <Rect x="12" y="34" width="12" height="3" rx="1.5" fill="#fff" opacity="0.6" />
        <Rect x="38" y="28" width="14" height="3" rx="1.5" fill="#fff" opacity="0.6" />
        <Path d="M28 44 L34 44" stroke="#FFC857" strokeWidth="4" />
        <Rect x="42" y="8" width="6" height="14" rx="2" fill="#8693B8" />
        <Circle cx="45" cy="6" r="5" fill="url(#g1)" />
        <Rect x="6" y="56" width="52" height="3" rx="1.5" fill="#2B3566" />
      </G>)}
      {id === 'hub' && (<G>
        <Path d="M8 52 A24 24 0 0 1 56 52Z" fill="url(#h1)" />
        <Path d="M16 48 A16 16 0 0 1 30 34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <Rect x="6" y="52" width="52" height="5" rx="2.5" fill="#2B3566" />
        <Rect x="30" y="12" width="3" height="16" fill="#C9D3EA" />
        <Circle cx="31.5" cy="11" r="3" fill="#FF5C7A" />
        <Rect x="24" y="42" width="16" height="10" rx="3" fill="#7A4B0E" />
      </G>)}
    </Svg>
  );
}

export function Comet({ size = 70 }) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 100 60">
      <Defs>
        <LinearGradient id="tail" x1="1" y1="0" x2="0" y2="0"><Stop offset="0" stopColor="#FFC857" stopOpacity="0.9" /><Stop offset="1" stopColor="#FFC857" stopOpacity="0" /></LinearGradient>
        <RadialGradient id="core" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#fff" /><Stop offset="1" stopColor="#FFC857" /></RadialGradient>
      </Defs>
      <Path d="M80 30 L0 12 L0 48Z" fill="url(#tail)" />
      <Circle cx="82" cy="30" r="14" fill="url(#core)" />
      <Circle cx="82" cy="30" r="20" fill="none" stroke="#FFC857" strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

export function Coin({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill="#FFC857" />
      <Circle cx="12" cy="12" r="7.5" fill="none" stroke="#B98A1E" strokeWidth="2" />
      <Path d="M9 12 h6" stroke="#B98A1E" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function DarkMatter({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs><RadialGradient id="dm" cx="40%" cy="35%" r="70%"><Stop offset="0" stopColor="#E6C8FF" /><Stop offset="1" stopColor="#6A2BD1" /></RadialGradient></Defs>
      <Path d="M12 1 L22 12 L12 23 L2 12Z" fill="url(#dm)" />
      <Path d="M12 1 L12 23 M2 12 L22 12" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
    </Svg>
  );
}
