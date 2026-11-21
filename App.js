import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import Starfield from './src/ui/Starfield';
import { Planet, Astronaut, BuildingIcon, Comet, Coin, DarkMatter, COLORS as C } from './src/ui/art';
import * as G from './src/game/engine';

const TOOLS = { mine: 'pick', refinery: 'wrench', hub: 'coin' };
const buzz = (style) => { try { if (Platform.OS !== 'web') Haptics.impactAsync(style); } catch (e) {} };

function FloatText({ item, onDone }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(onDone);
  }, []);
  return (
    <Animated.Text pointerEvents="none" style={[styles.float, { left: item.x - 30, top: item.y - 20, opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) }, { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.7, 1.25, 1] }) }] }]}>
      {item.text}
    </Animated.Text>
  );
}

function CometSprite({ onCatch, onGone, width }) {
  const x = useRef(new Animated.Value(width + 80)).current;
  useEffect(() => {
    const a = Animated.timing(x, { toValue: -120, duration: 9000, easing: Easing.linear, useNativeDriver: true });
    a.start(({ finished }) => finished && onGone());
    return () => a.stop();
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', top: 14, transform: [{ translateX: x }] }}>
      <Pressable hitSlop={20} onPress={onCatch}><Comet size={90} /></Pressable>
    </Animated.View>
  );
}

function Stage({ s, onTap }) {
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [floats, setFloats] = useState([]);
  const idRef = useRef(0);
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [bob]);
  const press = (e) => {
    const { locationX = 130, locationY = 130 } = e.nativeEvent;
    const id = ++idRef.current;
    setFloats((f) => [...f.slice(-8), { id, x: locationX + 20, y: locationY + 20, text: '+' + G.fmt(G.tapPower(s)) }]);
    pulse.setValue(0.93);
    Animated.spring(pulse, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
    buzz(Haptics.ImpactFeedbackStyle?.Light);
    onTap();
  };
  const size = Math.min(280, Dimensions.get('window').width * 0.72);
  return (
    <Animated.View style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }) }] }}>
      <Pressable onPress={press} style={{ width: size + 40, height: size + 40, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}><Planet size={size} /></Animated.View>
      </Pressable>
      {floats.map((f) => <FloatText key={f.id} item={f} onDone={() => setFloats((l) => l.filter((x) => x.id !== f.id))} />)}
    </Animated.View>
  );
}

function Pipeline({ s }) {
  const r = G.rates(s);
  const nodes = [
    { id: 'mine', label: 'Cevher', val: s.ore, rate: r.mine },
    { id: 'refinery', label: 'Alaşım', val: s.alloy, rate: r.refinery },
    { id: 'hub', label: 'Kredi', val: s.credits, rate: r.hub },
  ];
  return (
    <View style={styles.pipe}>
      {nodes.map((n, i) => (
        <React.Fragment key={n.id}>
          <View style={[styles.node, r.bottleneck === n.id && { borderColor: C.orange }]}>
            <BuildingIcon id={n.id} size={30} />
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.nodeVal}>{G.fmt(n.val)}</Text>
              <Text style={styles.nodeSub}>{n.label} · {G.fmt(n.rate)}/sn</Text>
            </View>
            {r.bottleneck === n.id && <Text style={styles.tag}>DARBOĞAZ</Text>}
          </View>
          {i < 2 && <Text style={styles.arrow}>›</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

function Card({ icon, title, sub, level, cost, can, onPress, label }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>{icon}</View>
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text style={styles.cardTitle}>{title} <Text style={styles.cardLvl}>Sv.{level}</Text></Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <Pressable onPress={onPress} disabled={!can} style={({ pressed }) => [styles.buy, can ? styles.buyOn : styles.buyOff, pressed && { transform: [{ scale: 0.96 }] }]}>
        <Text style={styles.buyLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Coin size={14} /><Text style={styles.buyCost}> {G.fmt(cost)}</Text></View>
      </Pressable>
    </View>
  );
}

function Game() {
  const insets = useSafeAreaInsets();
  const [s, setS] = useState(null);
  const [tab, setTab] = useState('build');
  const [welcome, setWelcome] = useState(null);
  const [comet, setComet] = useState(false);
  const [toast, setToast] = useState(null);
  const sRef = useRef(null);
  sRef.current = s;
  const W = Dimensions.get('window').width;

  useEffect(() => {
    (async () => {
      let st = G.initial();
      try { const raw = await AsyncStorage.getItem(G.SAVE_KEY); if (raw) st = { ...G.initial(), ...JSON.parse(raw) }; } catch (e) {}
      const { state, gained, elapsed } = G.catchUp(st);
      setS(state);
      if (gained > 1) setWelcome({ gained, elapsed });
    })();
  }, []);

  const save = useCallback(async () => {
    if (!sRef.current) return;
    try { await AsyncStorage.setItem(G.SAVE_KEY, JSON.stringify({ ...sRef.current, last: Date.now() })); } catch (e) {}
  }, []);

  useEffect(() => {
    if (!s) return;
    let last = Date.now();
    const t = setInterval(() => { const n = Date.now(); const dt = Math.min(1, (n - last) / 1000); last = n; setS((c) => G.step(c, dt)); }, 100);
    const sv = setInterval(save, 5000);
    const sub = AppState.addEventListener('change', (st) => { if (st !== 'active') save(); else setS((c) => G.catchUp(c).state); });
    return () => { clearInterval(t); clearInterval(sv); sub.remove(); };
  }, [!!s]);

  useEffect(() => {
    if (!s) return;
    let to;
    const plan = (ms) => { to = setTimeout(() => { setComet(true); plan(45000 + Math.random() * 40000); }, ms); };
    plan(20000);
    return () => clearTimeout(to);
  }, [!!s]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  if (!s) return <View style={styles.root}><Starfield /></View>;
  const r = G.rates(s);
  const gain = G.warpGain(s);

  return (
    <View style={styles.root}>
      <Starfield />
      <StatusBar style="light" />
      <View style={[styles.hud, { paddingTop: insets.top + 8 }]}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><Coin size={26} /><Text style={styles.credits}> {G.fmt(s.credits)}</Text></View>
          <Text style={styles.perSec}>{G.fmt(r.creditsPerSec)} kredi/sn{s.boost > 0 ? `  ⚡ x3 (${Math.ceil(s.boost)} sn)` : ''}</Text>
        </View>
        <View style={styles.dmChip}><DarkMatter size={18} /><Text style={styles.dmText}> {s.dm}  ·  +%{s.dm * 10}</Text></View>
      </View>
      <Pipeline s={s} />
      <View style={styles.stage}>
        <Stage s={s} onTap={() => setS((c) => G.tap(c))} />
        {comet && <CometSprite width={W} onGone={() => setComet(false)} onCatch={() => { setComet(false); setS((c) => ({ ...c, boost: c.boost + 20 })); buzz(Haptics.ImpactFeedbackStyle?.Heavy); flash('☄️ Kuyruklu yıldız yakalandı! 20 sn boyunca x3 üretim'); }} />}
        <Text style={styles.hint}>Gezegene dokun → +{G.fmt(G.tapPower(s))} cevher</Text>
      </View>

      <View style={[styles.panel, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.tabs}>
          {[['build', 'Binalar'], ['crew', 'Mürettebat'], ['warp', 'Warp']].map(([k, l]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]}><Text style={[styles.tabText, tab === k && { color: '#fff' }]}>{l}{k === 'warp' && gain >= 1 ? ' ●' : ''}</Text></Pressable>
          ))}
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {tab === 'build' && G.BUILDINGS.map((b) => (
            <Card key={b.id} icon={<BuildingIcon id={b.id} size={52} />} title={b.name} level={s.counts[b.id]}
              sub={`${b.desc} · ${G.fmt(b.rate * G.crewMult(s, b.id))} ${b.unit}`} cost={G.buildingCost(s, b.id)}
              can={s.credits >= G.buildingCost(s, b.id)} label="Satın al"
              onPress={() => { buzz(Haptics.ImpactFeedbackStyle?.Medium); setS((c) => G.buyBuilding(c, b.id)); }} />
          ))}
          {tab === 'crew' && G.CREW.map((c) => (
            <Card key={c.id} icon={<Astronaut color={c.color} size={56} tool={TOOLS[c.id]} />} title={c.name} level={s.crew[c.id]}
              sub={`${c.role} · ${c.bonus} (şu an x${G.crewMult(s, c.id).toFixed(2)})`} cost={G.crewCost(s, c.id)}
              can={s.credits >= G.crewCost(s, c.id)} label="Eğit"
              onPress={() => { buzz(Haptics.ImpactFeedbackStyle?.Medium); setS((x) => G.upgradeCrew(x, c.id)); }} />
          ))}
          {tab === 'warp' && (
            <View style={styles.warpBox}>
              <DarkMatter size={54} />
              <Text style={styles.warpTitle}>Warp Atlaması</Text>
              <Text style={styles.warpText}>Üssü sıfırla, <Text style={{ color: C.violet }}>Karanlık Madde</Text> kazan. Her biri kalıcı +%10 üretim demek.</Text>
              <Text style={styles.warpText}>Bu turda kazanılan: {G.fmt(s.run)} kredi</Text>
              <Text style={styles.warpGain}>Kazanacağın: +{gain} Karanlık Madde</Text>
              <Pressable disabled={gain < 1} onPress={() => { buzz(Haptics.ImpactFeedbackStyle?.Heavy); setS((c) => G.warp(c)); flash('🌌 Warp tamamlandı!'); setTab('build'); }} style={[styles.warpBtn, gain < 1 && styles.buyOff]}>
                <Text style={styles.buyLabel}>{gain < 1 ? '2.000 kredi kazanınca açılır' : 'WARP ET'}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>

      {toast && <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>}
      {welcome && (
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.warpTitle}>Hoş geldin komutan!</Text>
            <Text style={styles.warpText}>Sen yokken ({G.fmtTime(welcome.elapsed)}) üssün çalıştı.</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}><Coin size={28} /><Text style={styles.credits}> +{G.fmt(welcome.gained)}</Text></View>
            <Pressable style={styles.warpBtn} onPress={() => setWelcome(null)}><Text style={styles.buyLabel}>Topla</Text></Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() { return <SafeAreaProvider><Game /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  hud: { paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  credits: { color: C.text, fontSize: 30, fontWeight: '800' },
  perSec: { color: C.dim, fontSize: 13, marginTop: 2 },
  dmChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(180,108,255,0.15)', borderColor: 'rgba(180,108,255,0.5)', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  dmText: { color: '#E6C8FF', fontWeight: '700', fontSize: 13 },
  pipe: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 8 },
  node: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.panel, borderColor: C.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 6, paddingVertical: 6, flexShrink: 1 },
  nodeVal: { color: C.text, fontWeight: '800', fontSize: 13 },
  nodeSub: { color: C.dim, fontSize: 9 },
  tag: { position: 'absolute', top: -8, right: 4, backgroundColor: C.orange, color: '#1a0c00', fontSize: 8, fontWeight: '900', paddingHorizontal: 4, borderRadius: 4, overflow: 'hidden' },
  arrow: { color: C.dim, fontSize: 22, marginHorizontal: 2 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hint: { position: 'absolute', bottom: 6, color: C.dim, fontSize: 12 },
  float: { position: 'absolute', color: '#fff', fontSize: 22, fontWeight: '900', textShadowColor: '#4FD8FF', textShadowRadius: 8 },
  panel: { height: '42%', backgroundColor: 'rgba(12,18,48,0.96)', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingTop: 10 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4, marginBottom: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 11 },
  tabOn: { backgroundColor: 'rgba(79,216,255,0.22)' },
  tabText: { color: C.dim, fontWeight: '700', fontSize: 13 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.panel, borderColor: C.border, borderWidth: 1, borderRadius: 18, padding: 10, marginBottom: 8 },
  cardIcon: { width: 58, height: 58, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: C.text, fontWeight: '800', fontSize: 14 },
  cardLvl: { color: C.cyan, fontSize: 12 },
  cardSub: { color: C.dim, fontSize: 11, marginTop: 2 },
  buy: { minWidth: 86, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  buyOn: { backgroundColor: '#2A7FD6' },
  buyOff: { backgroundColor: 'rgba(255,255,255,0.08)', opacity: 0.6 },
  buyLabel: { color: '#fff', fontWeight: '800', fontSize: 12 },
  buyCost: { color: '#fff', fontWeight: '700', fontSize: 12 },
  warpBox: { alignItems: 'center', paddingVertical: 8 },
  warpTitle: { color: C.text, fontSize: 20, fontWeight: '900', marginTop: 6 },
  warpText: { color: C.dim, textAlign: 'center', marginTop: 6, fontSize: 13, paddingHorizontal: 12 },
  warpGain: { color: '#E6C8FF', fontWeight: '800', marginTop: 8, fontSize: 15 },
  warpBtn: { backgroundColor: '#7A3FE0', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 28, marginTop: 12, alignItems: 'center' },
  toast: { position: 'absolute', top: '16%', alignSelf: 'center', backgroundColor: 'rgba(255,200,87,0.95)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, maxWidth: '88%' },
  toastText: { color: '#2a1a00', fontWeight: '800', textAlign: 'center' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  modal: { width: '82%', backgroundColor: '#10183F', borderRadius: 24, borderWidth: 1, borderColor: C.border, alignItems: 'center', padding: 22 },
});
