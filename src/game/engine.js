// Nova Station - idle oyun motoru (saf fonksiyonlar)

export const BUILDINGS = [
  { id: 'mine', name: 'Plazma Madeni', desc: 'Gezegenden cevher çıkarır', base: 15, growth: 1.15, rate: 1, unit: 'cevher/sn' },
  { id: 'refinery', name: 'Rafineri', desc: 'Cevheri alaşıma dönüştürür', base: 60, growth: 1.17, rate: 2, unit: 'cevher/sn işler' },
  { id: 'hub', name: 'Ticaret Merkezi', desc: 'Alaşım satıp kredi kazanır', base: 240, growth: 1.18, rate: 2, unit: 'alaşım/sn satar' },
];

export const CREW = [
  { id: 'mine', name: 'Kaptan Rho', role: 'Maden Şefi', base: 100, color: '#FF8A4C', bonus: 'Maden +%25 / seviye' },
  { id: 'refinery', name: 'Dr. Vela', role: 'Baş Mühendis', base: 400, color: '#4FD8FF', bonus: 'Rafineri +%25 / seviye' },
  { id: 'hub', name: 'Zed', role: 'Tüccar', base: 1600, color: '#FFC857', bonus: 'Ticaret +%25 / seviye' },
];

export const SAVE_KEY = 'nova-station-v1';
const MAX_OFFLINE = 8 * 3600;

export const initial = () => ({
  v: 1,
  credits: 0, ore: 0, alloy: 0,
  run: 0, life: 0, dm: 0, warps: 0, taps: 0,
  counts: { mine: 0, refinery: 1, hub: 1 },
  crew: { mine: 0, refinery: 0, hub: 0 },
  boost: 0,
  last: Date.now(),
});

export const bld = (id) => BUILDINGS.find((b) => b.id === id);
export const crewDef = (id) => CREW.find((c) => c.id === id);

export const buildingCost = (s, id) => { const b = bld(id); return Math.ceil(b.base * Math.pow(b.growth, s.counts[id])); };
export const crewCost = (s, id) => Math.ceil(crewDef(id).base * Math.pow(2.6, s.crew[id]));
export const crewMult = (s, id) => 1 + 0.25 * s.crew[id];
export const globalMult = (s) => (1 + 0.1 * s.dm) * (s.boost > 0 ? 3 : 1);

export function rates(s) {
  const g = globalMult(s);
  const mine = s.counts.mine * bld('mine').rate * crewMult(s, 'mine');
  const refinery = s.counts.refinery * bld('refinery').rate * crewMult(s, 'refinery');
  const hub = s.counts.hub * bld('hub').rate * crewMult(s, 'hub');
  const flow = Math.min(mine, refinery, hub);
  let bottleneck = 'hub';
  if (mine <= refinery && mine <= hub) bottleneck = 'mine';
  else if (refinery <= hub) bottleneck = 'refinery';
  return { mine, refinery, hub, g, bottleneck, creditsPerSec: flow * g };
}

export const tapPower = (s) => (1 + 0.5 * s.counts.mine) * crewMult(s, 'mine') * globalMult(s);

export function step(s, dt) {
  const r = rates(s);
  const ore = s.ore + r.mine * dt;
  const refined = Math.min(ore, r.refinery * dt);
  const alloy = s.alloy + refined;
  const sold = Math.min(alloy, r.hub * dt);
  const earned = sold * r.g;
  return {
    ...s,
    ore: ore - refined,
    alloy: alloy - sold,
    credits: s.credits + earned,
    run: s.run + earned,
    life: s.life + earned,
    boost: Math.max(0, s.boost - dt),
  };
}

export const tap = (s) => ({ ...s, ore: s.ore + tapPower(s), taps: s.taps + 1 });

export function buyBuilding(s, id) {
  const c = buildingCost(s, id);
  if (s.credits < c) return s;
  return { ...s, credits: s.credits - c, counts: { ...s.counts, [id]: s.counts[id] + 1 } };
}

export function upgradeCrew(s, id) {
  const c = crewCost(s, id);
  if (s.credits < c) return s;
  return { ...s, credits: s.credits - c, crew: { ...s.crew, [id]: s.crew[id] + 1 } };
}

export const warpGain = (s) => Math.floor(Math.sqrt(s.run / 2000));

export function warp(s) {
  const gain = warpGain(s);
  if (gain < 1) return s;
  return { ...initial(), dm: s.dm + gain, warps: s.warps + 1, life: s.life, taps: s.taps };
}

export function catchUp(s, now = Date.now()) {
  const elapsed = Math.min(MAX_OFFLINE, Math.max(0, (now - s.last) / 1000));
  if (elapsed < 5) return { state: { ...s, last: now }, gained: 0, elapsed: 0 };
  let cur = { ...s, boost: 0 };
  const n = 240;
  for (let i = 0; i < n; i++) cur = step(cur, elapsed / n);
  return { state: { ...cur, last: now }, gained: cur.credits - s.credits, elapsed };
}

export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toString();
  const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
  let i = 0;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + u[i];
}

export function fmtTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
}
