import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft,
  Zap, 
  Volume2, 
  VolumeX, 
  Fingerprint, 
  Brain, 
  Timer, 
  Info,
  ChevronRight,
  ChevronLeft,
  Waves,
  User,
  Settings,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
  HelpCircle,
  BookOpen,
  Heart,
  Sparkles,
  Activity,
  Eye,
  Shield,
  Music,
  Wind,
  Mic,
  Upload,
  X,
  Star,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BrandMark } from './components/BrandMark';
import { Bloom } from './components/Bloom';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getStoredValue(key: string, fallback = '') {
  if (typeof window === 'undefined') return fallback;

  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage.`, error);
    return fallback;
  }
}

function setStoredValue(key: string, value: string) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage.`, error);
  }
}

function hasMediaSessionSupport() {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

async function fireNativeImpact(intensity: number) {
  if (typeof window === 'undefined') return;

  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const style = intensity >= 0.72
      ? ImpactStyle.Heavy
      : intensity >= 0.42
        ? ImpactStyle.Medium
        : ImpactStyle.Light;
    await Haptics.impact({ style });
    await Haptics.vibrate({ duration: Math.round(12 + intensity * 28) });
  } catch {
    // Web browsers and desktops fall back to vibration/audio haptic simulation.
  }
}

function useStudio() {
  const [hasStudio, setHasStudio] = useState(() => getStoredValue('focusflow_studio_unlocked') === 'true');
  const [purchaseError, setPurchaseError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const apiKey = import.meta.env.VITE_RC_KEY;
      if (!apiKey) {
        setPurchaseError('Studio purchases are not configured yet.');
        return;
      }
      await Purchases.configure({ apiKey });
      const customerInfo = await Purchases.getCustomerInfo();
      const active = Boolean(customerInfo.customerInfo?.entitlements.active.studio);
      setHasStudio(active);
      if (active) setStoredValue('focusflow_studio_unlocked', 'true');
    } catch {
      setPurchaseError('Purchases are unavailable right now. Please try again later.');
      setHasStudio((current) => current);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const unlock = useCallback(async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const apiKey = import.meta.env.VITE_RC_KEY;
      if (!apiKey) {
        setPurchaseError('Studio purchases are not configured yet.');
        return;
      }
      await Purchases.configure({ apiKey });
      const offerings = await Purchases.getOfferings();
      const pack = offerings.current?.availablePackages[0];
      if (pack) {
        const result = await Purchases.purchasePackage({ aPackage: pack });
        const active = Boolean(result.customerInfo.entitlements.active.studio);
        setHasStudio(active);
        if (active) setStoredValue('focusflow_studio_unlocked', 'true');
        return;
      }
      setPurchaseError('Studio is not available for purchase yet.');
    } catch (error) {
      const purchaseError = error as { userCancelled?: boolean; code?: string; message?: string };
      if (
        purchaseError.userCancelled ||
        purchaseError.code === 'PurchaseCancelledError' ||
        purchaseError.message?.toLowerCase().includes('cancel')
      ) {
        setPurchaseError('');
        return;
      }
      setPurchaseError('Purchases are unavailable right now. Please try again later.');
    }
  }, []);

  return { hasStudio, unlock, restore: refresh, purchaseError };
}

// --- Types & Constants ---

interface Frequency {
  id: string;
  hz: number;
  label: string;
  description: string;
  color: string;
  secondaryColor?: string;
  chakra?: string;
}

const TUNING_STANDARD = 'A4 = 440Hz equal temperament';
const SCHUMANN_RESONANCE_HZ = 7.83;

// Commonly used modern Solfeggio/wellness tone set. These are intentional
// standalone tone frequencies, not equal-temperament note names.
const SOLFEGGIO_FREQUENCIES: Frequency[] = [
  { id: '174', hz: 174, label: 'Relief', description: 'Low grounding tone for rest and decompression', color: '#8C5B54', secondaryColor: '#3A2320', chakra: 'Root (Muladhara)' },
  { id: '285', hz: 285, label: 'Restore', description: 'Gentle restorative tone for body awareness', color: '#B0764A', secondaryColor: '#402A18', chakra: 'Root/Sacral' },
  { id: '396', hz: 396, label: 'Release', description: 'Grounding tone commonly used for fear-release intention', color: '#A65A4E', secondaryColor: '#38201C', chakra: 'Root (Muladhara)' },
  { id: '417', hz: 417, label: 'Shift', description: 'Transition tone commonly used for change intention', color: '#C68B5A', secondaryColor: '#45301C', chakra: 'Sacral (Svadhisthana)' },
  { id: '528', hz: 528, label: 'Focus', description: 'Bright tone commonly used for clarity intention', color: '#C59B54', secondaryColor: '#45361A', chakra: 'Solar Plexus (Manipura)' },
  { id: '639', hz: 639, label: 'Connect', description: 'Warm tone commonly used for connection intention', color: '#4F8F7A', secondaryColor: '#1E3A31', chakra: 'Heart (Anahata)' },
  { id: '741', hz: 741, label: 'Clear', description: 'Clear tone commonly used for expression intention', color: '#5E8AA6', secondaryColor: '#22364A', chakra: 'Throat (Vishuddha)' },
  { id: '852', hz: 852, label: 'Insight', description: 'High tone commonly used for insight intention', color: '#6B6FA6', secondaryColor: '#262845', chakra: 'Third Eye (Ajna)' },
  { id: '963', hz: 963, label: 'Stillness', description: 'Highest tone in the common set for spacious listening', color: '#8A6FA0', secondaryColor: '#322542', chakra: 'Crown (Sahasrara)' },
];

const REIKI_SYMBOLS = [
  { 
    id: 'cho-ku-rei', 
    name: 'Cho Ku Rei', 
    meaning: 'The Power Symbol', 
    purpose: 'Increasing power, protection, and focus.',
    description: 'Places the power of the universe here and now. Use to seal energy or protect a space.'
  },
  { 
    id: 'sei-he-ki', 
    name: 'Sei He Ki', 
    meaning: 'The Emotional Symbol', 
    purpose: 'Healing emotions, purifying, and balancing.',
    description: 'God and man become one. Use for mental and emotional balancing or clearing bad habits.'
  },
  { 
    id: 'hon-sha-ze-sho-nen', 
    name: 'Hon Sha Ze Sho Nen', 
    meaning: 'The Distance Symbol', 
    purpose: 'Healing across time and space.',
    description: 'No past, no present, no future. Use to send healing energy to people far away or to past/future events.'
  },
  { 
    id: 'dai-ko-myo', 
    name: 'Dai Ko Myo', 
    meaning: 'The Master Symbol', 
    purpose: 'Enlightenment and deep healing.',
    description: 'Great Shining Light. The primary symbol for Reiki Masters, used for soul healing and empowerment.'
  }
];

interface HapticEvent {
  at: number;
  duration: number;
  intensity: number;
  curve: 'attack' | 'swell' | 'decay' | 'flat';
}

interface HapticPattern {
  id: string;
  label: string;
  description: string;
  loopMs: number | null;
  events: HapticEvent[];
  breathSync: boolean;
  color: string;
}

const HAPTIC_PATTERNS: HapticPattern[] = [
  { id: 'relief', label: 'Relief touch', description: 'Long, slow, heavy settling pulses', loopMs: 7600, breathSync: true, color: '#8C5B54', events: [
    { at: 0, duration: 1200, intensity: 0.32, curve: 'decay' },
    { at: 3800, duration: 1500, intensity: 0.22, curve: 'decay' }
  ] },
  { id: 'release', label: 'Release touch', description: 'A palm-sized exhale that swells and lets go', loopMs: 6400, breathSync: true, color: '#A65A4E', events: [
    { at: 400, duration: 900, intensity: 0.34, curve: 'swell' },
    { at: 3600, duration: 1100, intensity: 0.24, curve: 'decay' }
  ] },
  { id: 'focus', label: 'Focus touch', description: 'A steady, quiet pulse without urgency', loopMs: 3000, breathSync: false, color: '#C59B54', events: [
    { at: 0, duration: 140, intensity: 0.22, curve: 'attack' },
    { at: 1500, duration: 140, intensity: 0.18, curve: 'attack' }
  ] },
  { id: 'connect', label: 'Connect touch', description: 'A warm double beat like a second heart', loopMs: 4200, breathSync: false, color: '#4F8F7A', events: [
    { at: 0, duration: 120, intensity: 0.24, curve: 'attack' },
    { at: 220, duration: 140, intensity: 0.18, curve: 'decay' },
    { at: 2300, duration: 120, intensity: 0.2, curve: 'attack' }
  ] },
  { id: 'clear', label: 'Clear touch', description: 'Short, bright, sparse pulses with space around them', loopMs: 5600, breathSync: false, color: '#5E8AA6', events: [
    { at: 0, duration: 90, intensity: 0.16, curve: 'attack' },
    { at: 3300, duration: 70, intensity: 0.12, curve: 'attack' }
  ] },
  { id: 'insight', label: 'Insight touch', description: 'Almost nothing, widely spaced and soft', loopMs: 9200, breathSync: false, color: '#6B6FA6', events: [
    { at: 0, duration: 70, intensity: 0.1, curve: 'flat' }
  ] },
];

const hapticIdForFrequency = (frequencyId: Frequency['id']): HapticPattern['id'] => {
  if (frequencyId === '174' || frequencyId === '285') return 'relief';
  if (frequencyId === '396' || frequencyId === '417') return 'release';
  if (frequencyId === '528') return 'focus';
  if (frequencyId === '639') return 'connect';
  if (frequencyId === '741') return 'clear';
  return 'insight';
};

const TAPPING_POINTS = [
  { id: 'karate', label: 'Karate Chop', instruction: 'Side of the hand' },
  { id: 'eyebrow', label: 'Eyebrow', instruction: 'Beginning of the eyebrow' },
  { id: 'side_eye', label: 'Side of Eye', instruction: 'On the bone at side of eye' },
  { id: 'under_eye', label: 'Under Eye', instruction: 'On the bone under the eye' },
  { id: 'under_nose', label: 'Under Nose', instruction: 'Between nose and upper lip' },
  { id: 'chin', label: 'Chin', instruction: 'Crease between lip and chin' },
  { id: 'collarbone', label: 'Collarbone', instruction: 'Just below the collarbone' },
  { id: 'under_arm', label: 'Under Arm', instruction: 'About 4 inches below armpit' },
  { id: 'top_head', label: 'Top of Head', instruction: 'Center of the crown' },
];

interface SonicChant {
  id: string;
  label: string;
  sound: string;
  instruction: string;
  benefit: string;
  category: 'vagus' | 'healing' | 'bija' | 'vowel';
  resonates?: string;
  referenceHz?: number;
}

const SONIC_CHANTS: SonicChant[] = [
  // Guide pitches are practice anchors only; these traditions do not prescribe one universal Hz value.
  // Vagus Nerve
  { id: 'voo', label: 'Low Exhale', sound: 'VOO', instruction: 'Inhale gently, then release a low, steady "VOOO" on a long exhale. Let the pitch sit where it feels comfortable.', benefit: 'Encourages slower breathing, longer exhalation, and body awareness.', category: 'vagus', resonates: 'Chest & Abdomen', referenceHz: 98 },
  { id: 'mom', label: 'Soft Hum', sound: 'MOM', instruction: 'Gently repeat "MOM-MOM-MOM" with an easy hum. Keep the jaw loose and the sound unforced.', benefit: 'Uses rhythmic humming as a simple, soothing vocal anchor.', category: 'vagus', resonates: 'Face & Throat', referenceHz: 130.81 },
  { id: 'err', label: 'Grounding Tone', sound: 'ERR', instruction: 'Produce a low, steady "ERRR" sound and keep the breath smooth rather than loud.', benefit: 'Offers a low-pitched focus point for grounding and steady breathing.', category: 'vagus', resonates: 'Lower Chest', referenceHz: 98 },
  { id: 'hum', label: 'Resonant Hum', sound: 'Humming', instruction: 'Close your lips and hum softly, noticing vibration around the lips, nose, and face.', benefit: 'Supports relaxed breathing and nasal/facial resonance without needing volume.', category: 'vagus', resonates: 'Face & Sinuses', referenceHz: 130.81 },
  { id: 'om', label: 'A-U-M Practice', sound: 'OM', instruction: 'Chant "A-U-M" slowly, moving from an open vowel into a closed-mouth hum.', benefit: 'A traditional meditation sound used for attention, breath pacing, and resonance.', category: 'vagus', resonates: 'Chest, Throat & Head', referenceHz: 136.1 },
  { id: 'mmm', label: 'Closed Hum', sound: 'MMM', instruction: 'Sustain a gentle "MMM" sound with lips closed and shoulders relaxed.', benefit: 'Gives the breath a quiet, steady tone for calming attention.', category: 'vagus', resonates: 'Face & Throat', referenceHz: 130.81 },
  { id: 'gargle', label: 'Throat Warmup', sound: 'Gargle', instruction: 'Gargle with water for a short, comfortable round. Stop if it feels irritating or strained.', benefit: 'A practical throat warmup; use gently and skip it when uncomfortable.', category: 'vagus', resonates: 'Throat' },
  
  // Six Healing Sounds
  { id: 'si', label: 'Six Sounds: Si', sound: 'SI (Sss)', instruction: 'Exhale with a controlled "SSSS" sound. Keep the tone soft enough that the breath stays even.', benefit: 'A Liu Zi Jue / Six Healing Sounds practice traditionally associated with the lungs.', category: 'healing', resonates: 'Chest', referenceHz: 220 },
  { id: 'chui', label: 'Six Sounds: Chui', sound: 'CHUI', instruction: 'Exhale with a soft "CHWAY" or "CHWEE" sound, like gently blowing through the lips.', benefit: 'A traditional Six Healing Sounds exhale associated with the kidneys.', category: 'healing', resonates: 'Lower Back & Belly', referenceHz: 196 },
  { id: 'xu', label: 'Six Sounds: Xu', sound: 'XU (Shu)', instruction: 'Make a gentle "SHOO" sound on the exhale. Let the ribs soften as the sound fades.', benefit: 'A traditional Six Healing Sounds exhale associated with the liver.', category: 'healing', resonates: 'Ribs & Side Body', referenceHz: 174.61 },
  { id: 'he', label: 'Six Sounds: He', sound: 'HE (Huh)', instruction: 'Exhale with a warm "HUH" or soft "HER" sound from an open throat.', benefit: 'A traditional Six Healing Sounds exhale associated with the heart.', category: 'healing', resonates: 'Chest', referenceHz: 220 },
  { id: 'hu', label: 'Six Sounds: Hu', sound: 'HU (Hoo)', instruction: 'Produce a rounded "HOO" sound, keeping the belly relaxed as you exhale.', benefit: 'A traditional Six Healing Sounds exhale associated with the spleen/stomach system.', category: 'healing', resonates: 'Upper Belly', referenceHz: 196 },
  { id: 'xi', label: 'Six Sounds: Xi', sound: 'XI (Shee)', instruction: 'Exhale with a light "SHEE" sound. Use a clear but relaxed pitch.', benefit: 'A traditional Six Healing Sounds exhale associated with whole-body regulation.', category: 'healing', resonates: 'Torso', referenceHz: 261.63 },

  // Bija Mantras
  { id: 'lam', label: 'Root Bija', sound: 'LAM', instruction: 'Chant "LAM" as "LA-MNG," ending with a comfortable nasal hum.', benefit: 'A traditional root-chakra bija used as a grounding meditation focus.', category: 'bija', resonates: 'Lower Body', referenceHz: 256 },
  { id: 'vam', label: 'Sacral Bija', sound: 'VAM', instruction: 'Chant "VAM" as "VA-MNG," keeping the vowel open and the hum easy.', benefit: 'A traditional sacral-chakra bija used for breath, attention, and resonance practice.', category: 'bija', resonates: 'Pelvic Area', referenceHz: 288 },
  { id: 'ram', label: 'Solar Bija', sound: 'RAM', instruction: 'Chant "RAM" as "RA-MNG," letting the sound stay bright but relaxed.', benefit: 'A traditional solar-plexus bija used as a focused meditation sound.', category: 'bija', resonates: 'Upper Belly', referenceHz: 320 },
  { id: 'yam', label: 'Heart Bija', sound: 'YAM', instruction: 'Chant "YAM" as "YA-MNG" with a soft, open vowel.', benefit: 'A traditional heart-chakra bija used for contemplative breath and sound practice.', category: 'bija', resonates: 'Chest', referenceHz: 341.3 },
  { id: 'ham', label: 'Throat Bija', sound: 'HAM', instruction: 'Chant "HAM" as "HA-MNG," keeping the throat open and unstrained.', benefit: 'A traditional throat-chakra bija used to focus attention on voice and resonance.', category: 'bija', resonates: 'Throat & Neck', referenceHz: 384 },

  // Vowel Resonances
  { id: 'eee', label: 'Bright Vowel', sound: 'EEE', instruction: 'Sustain a clear "EEEE" sound at a pitch that feels easy, not forced.', benefit: 'A bright vowel for noticing face and head resonance.', category: 'vowel', resonates: 'Face & Head', referenceHz: 480 },
  { id: 'aaa', label: 'Open Vowel', sound: 'AAA', instruction: 'Release a wide, open "AHHH" sound with a relaxed jaw.', benefit: 'An open vowel for practicing fuller breath and chest resonance.', category: 'vowel', resonates: 'Chest', referenceHz: 341.3 },
  { id: 'ooo', label: 'Rounded Vowel', sound: 'OOO', instruction: 'Sustain a rounded "OOOO" sound and let the lips shape the tone.', benefit: 'A rounded vowel for lower, steadier vocal resonance.', category: 'vowel', resonates: 'Mouth & Chest', referenceHz: 256 },
  { id: 'why', label: 'Vowel Glide', sound: 'WHY', instruction: 'Move slowly through "OOO" to "AHH" to "EEE," keeping the breath continuous.', benefit: 'A gentle vowel transition for exploring how mouth shape changes resonance.', category: 'vowel', resonates: 'Full Vocal Tract', referenceHz: 256 },
];

const HANDPAN_NOTES = [
  { id: 'ding', freq: 146.83, label: 'D3', position: 'center' },
  { id: 'n1', freq: 220.00, label: 'A3', position: 'top' },
  { id: 'n2', freq: 233.08, label: 'Bb3', position: 'top-right' },
  { id: 'n3', freq: 261.63, label: 'C4', position: 'right' },
  { id: 'n4', freq: 293.66, label: 'D4', position: 'bottom-right' },
  { id: 'n5', freq: 329.63, label: 'E4', position: 'bottom' },
  { id: 'n6', freq: 349.23, label: 'F4', position: 'bottom-left' },
  { id: 'n7', freq: 392.00, label: 'G4', position: 'left' },
  { id: 'n8', freq: 440.00, label: 'A4', position: 'top-left' },
];

const PRESET_LIBRARY = [
  { id: 'om-chant', label: 'Deep Om Chant', url: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bowl-gong-stroke-2187.mp3', category: 'Chant' },
  { id: 'singing-bowl', label: 'Tibetan Bowl', url: 'https://assets.mixkit.co/sfx/preview/mixkit-tibetan-singing-bowl-2188.mp3', category: 'Healing' },
  { id: 'zen-water', label: 'Zen Garden Flow', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3', category: 'Nature' },
  { id: 'brown-noise', label: 'Deep Brown Noise', url: 'https://assets.mixkit.co/sfx/preview/mixkit-heavy-rain-loop-2393.mp3', category: 'Focus' },
  { id: 'forest-birds', label: 'Forest Morning', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3', category: 'Nature' },
  { id: 'soft-rain', label: 'Rain on Leaves', url: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-on-leaves-loop-2440.mp3', category: 'Nature' },
  { id: 'white-noise', label: 'Pure White Noise', url: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-loop-2574.mp3', category: 'Focus' },
  { id: 'pink-noise', label: 'Steady Pink Noise', url: 'https://assets.mixkit.co/sfx/preview/mixkit-pink-noise-loop-2574.mp3', category: 'Focus' },
  { id: 'alpha-waves', label: 'Alpha Focus', url: 'https://assets.mixkit.co/sfx/preview/mixkit-ethereal-ambient-pad-2101.mp3', category: 'Brainwave' },
  { id: 'delta-sleep', label: 'Delta Deep Sleep', url: 'https://assets.mixkit.co/sfx/preview/mixkit-deep-meditation-atmosphere-2104.mp3', category: 'Brainwave' },
  { id: 'handpan-melodic', label: 'Hand Pan Melodic', url: 'https://assets.mixkit.co/sfx/preview/mixkit-hand-pan-melodic-strike-2194.mp3', category: 'Instrument' },
  { id: 'handpan-meditation', label: 'Hand Pan Zen', url: 'https://assets.mixkit.co/sfx/preview/mixkit-hand-pan-meditation-hit-2195.mp3', category: 'Instrument' },
];

interface UserProfile {
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  preferredFrequencyId: string | null;
  preferredHapticId: string | null;
  autoStartBreaks: boolean;
  showVisualizer: boolean;
  useSchumann: boolean;
  keepScreenOn: boolean;
}

type AppMode = 'home' | 'session' | 'garden' | 'you' | 'studio';
type StudioMode = 'chants' | 'handpan' | 'reiki' | 'tapping' | 'guide' | 'about';
type SessionPhase = 'idle' | 'settling' | 'running' | 'closing' | 'complete';
type SessionIntentionId = 'calm' | 'focus' | 'ground' | 'heal' | 'sleep';
type MoodId = 'anxious' | 'scattered' | 'tired' | 'tense' | 'blocked' | 'focused';
const STUDIO_MODES: StudioMode[] = ['chants', 'handpan', 'reiki', 'tapping', 'guide', 'about'];
const FREE_STUDIO_MODES: StudioMode[] = ['tapping', 'guide', 'about'];

interface SessionIntentionPreset {
  id: SessionIntentionId;
  label: string;
  prompt: string;
  recommendation: string;
  actionLabel: string;
  mode: StudioMode | AppMode;
  frequencyId?: Frequency['id'];
  icon: typeof Sparkles;
  iconClassName: string;
}

interface MoodSessionPreset {
  id: MoodId;
  label: string;
  needWord: string;
  feeling: string;
  confirmation: string;
  sessionName: string;
  summary: string;
  frequencyId: Frequency['id'];
  hapticId: HapticPattern['id'];
  chantId?: SonicChant['id'];
  minutes: number;
  useSchumann: boolean;
  healingMode: boolean;
}

interface Ritual {
  id: string;
  name: string;
  moodId: MoodId;
  frequencyId: Frequency['id'];
  hapticId: HapticPattern['id'];
  chantId?: SonicChant['id'];
  minutes: number;
  useSchumann: boolean;
  healingMode: boolean;
  createdAt: string;
}

interface GardenEntry {
  id: string;
  ritualName: string;
  moodId: MoodId;
  minutes: number;
  frequencyId: Frequency['id'];
  completedAt: string;
}

type GardenElementType = 'stone' | 'sandRipple' | 'waterLine' | 'lantern' | 'bamboo' | 'lotus';
type GardenBackdrop = 'sand' | 'moss' | 'water' | 'stone';
type GardenAmbient = 'wind' | 'water' | 'birds' | 'silence';
type SandTool = 'rake' | 'stone' | 'smooth';
type GardenToolCopy = {
  labels: Record<SandTool, string>;
  resetLabel: string;
  instructions: Record<SandTool, string>;
};

interface ElementPlacement {
  roomId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface GardenRoom {
  id: string;
  name: string;
  createdAt: string;
  backdrop: GardenBackdrop;
  ambientId: GardenAmbient;
}

const DEFAULT_GARDEN_ROOMS: GardenRoom[] = [
  { id: 'morning', name: 'Morning', createdAt: '2026-01-01T00:00:00.000Z', backdrop: 'sand', ambientId: 'wind' },
  { id: 'still', name: 'Still water', createdAt: '2026-01-01T00:00:00.000Z', backdrop: 'water', ambientId: 'water' },
  { id: 'moss', name: 'Moss', createdAt: '2026-01-01T00:00:00.000Z', backdrop: 'moss', ambientId: 'silence' },
];

const GARDEN_BACKDROPS: GardenBackdrop[] = ['sand', 'water', 'moss', 'stone'];
const GARDEN_AMBIENTS: GardenAmbient[] = ['wind', 'water', 'birds', 'silence'];

const GARDEN_BACKDROP_LABELS: Record<GardenBackdrop, string> = {
  sand: 'Warm sand',
  water: 'Still water',
  moss: 'Living moss',
  stone: 'Quiet stone',
};

const GARDEN_AMBIENT_LABELS: Record<GardenAmbient, string> = {
  wind: 'Soft wind',
  water: 'Ripples',
  birds: 'Canopy',
  silence: 'Silence',
};

const GARDEN_TOOL_COPY: Record<GardenBackdrop, GardenToolCopy> = {
  sand: {
    labels: { rake: 'Trace', stone: 'Set stone', smooth: 'Clear sand' },
    resetLabel: 'Clear all',
    instructions: {
      rake: 'Drag slowly through the sand to trace a pattern.',
      stone: 'Tap anywhere open to set a stone.',
      smooth: 'Brush over a line to clear the sand.',
    },
  },
  water: {
    labels: { rake: 'Ripple', stone: 'Anchor', smooth: 'Settle' },
    resetLabel: 'Still all',
    instructions: {
      rake: 'Drag across the water to send a quiet ripple.',
      stone: 'Tap open water to place an anchor stone.',
      smooth: 'Brush through ripples to settle the surface.',
    },
  },
  moss: {
    labels: { rake: 'Comb moss', stone: 'Place stone', smooth: 'Soften' },
    resetLabel: 'Soften all',
    instructions: {
      rake: 'Drag gently to comb the moss.',
      stone: 'Tap a clearing to place a stone.',
      smooth: 'Brush over the moss to soften the texture.',
    },
  },
  stone: {
    labels: { rake: 'Etch', stone: 'Place stone', smooth: 'Polish' },
    resetLabel: 'Polish all',
    instructions: {
      rake: 'Drag slowly to etch a quiet line.',
      stone: 'Tap an open place to arrange a stone.',
      smooth: 'Brush over marks to polish the surface.',
    },
  },
};

function normalizeGardenRooms(value: unknown): GardenRoom[] {
  const savedRooms = Array.isArray(value) ? value : [];
  return DEFAULT_GARDEN_ROOMS.map((defaultRoom) => {
    const savedRoom = savedRooms.find((room) => room && typeof room === 'object' && (room as GardenRoom).id === defaultRoom.id) as Partial<GardenRoom> | undefined;
    const savedBackdrop = GARDEN_BACKDROPS.includes(savedRoom?.backdrop as GardenBackdrop) ? savedRoom?.backdrop as GardenBackdrop : defaultRoom.backdrop;
    const savedAmbient = GARDEN_AMBIENTS.includes(savedRoom?.ambientId as GardenAmbient) ? savedRoom?.ambientId as GardenAmbient : defaultRoom.ambientId;
    return {
      ...defaultRoom,
      ...savedRoom,
      id: defaultRoom.id,
      name: savedRoom?.name || defaultRoom.name,
      backdrop: defaultRoom.id === 'moss' && savedBackdrop === 'stone' ? 'moss' : savedBackdrop,
      ambientId: savedAmbient,
    };
  });
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Focus User',
  focusMinutes: 25,
  breakMinutes: 5,
  preferredFrequencyId: '528',
  preferredHapticId: 'zen',
  autoStartBreaks: false,
  showVisualizer: true,
  useSchumann: false,
  keepScreenOn: false,
};

const SESSION_INTENTION_PRESETS: SessionIntentionPreset[] = [
  {
    id: 'calm',
    label: 'Calm',
    prompt: 'My body feels overloaded and I need to settle down.',
    recommendation: 'Best path: guided tapping to calm your nervous system first.',
    actionLabel: 'Start Calm Reset',
    mode: 'studio',
    icon: Heart,
    iconClassName: 'text-emerald-400'
  },
  {
    id: 'focus',
    label: 'Focus',
    prompt: 'I want to lock in and get useful work done.',
    recommendation: 'Best path: 528Hz focus tone with your work timer.',
    actionLabel: 'Start Focus Session',
    mode: 'session',
    frequencyId: '528',
    icon: Zap,
    iconClassName: 'text-app-accent'
  },
  {
    id: 'ground',
    label: 'Ground',
    prompt: 'I feel scattered and want to feel stable again.',
    recommendation: 'Best path: grounding frequencies with Schumann support.',
    actionLabel: 'Start Grounding Tone',
    mode: 'session',
    frequencyId: '396',
    icon: Activity,
    iconClassName: 'text-amber-500'
  },
  {
    id: 'heal',
    label: 'Heal',
    prompt: 'I want a restorative, inward session.',
    recommendation: 'Best path: healing frequency mode with a restorative tone.',
    actionLabel: 'Start Healing Tone',
    mode: 'session',
    frequencyId: '639',
    icon: Sparkles,
    iconClassName: 'text-pink-400'
  },
  {
    id: 'sleep',
    label: 'Sleep',
    prompt: 'I want to wind down and quiet my system.',
    recommendation: 'Best path: sonic chants for low-stimulation slowing down.',
    actionLabel: 'Open Sleep Sounds',
    mode: 'studio',
    icon: Wind,
    iconClassName: 'text-sky-400'
  }
];

const MOOD_SESSION_PRESETS: MoodSessionPreset[] = [
  {
    id: 'anxious',
    label: 'Anxious',
    needWord: 'Grounding',
    feeling: 'My body is loud and I need a soft landing.',
    confirmation: 'For when your body is loud and needs somewhere soft to land.',
    sessionName: 'Soft Landing Reset',
    summary: 'Low tone, breath haptics, and a short calm path.',
    frequencyId: '396',
    hapticId: 'release',
    chantId: 'voo',
    minutes: 7,
    useSchumann: true,
    healingMode: true
  },
  {
    id: 'scattered',
    label: 'Scattered',
    needWord: 'Focus',
    feeling: 'My attention is everywhere.',
    confirmation: 'For when your attention is everywhere and wants one clear place to gather.',
    sessionName: 'Gather Focus',
    summary: '528Hz, zen pulse, and a clean focus timer.',
    frequencyId: '528',
    hapticId: 'focus',
    chantId: 'hum',
    minutes: 15,
    useSchumann: false,
    healingMode: false
  },
  {
    id: 'tired',
    label: 'Tired',
    needWord: 'Lift',
    feeling: 'I need energy without getting wired.',
    confirmation: 'For when you need to rise without getting wired.',
    sessionName: 'Gentle Lift',
    summary: 'Bright tone, light pulse, and a restorative pace.',
    frequencyId: '741',
    hapticId: 'clear',
    chantId: 'eee',
    minutes: 10,
    useSchumann: false,
    healingMode: false
  },
  {
    id: 'tense',
    label: 'Tense',
    needWord: 'Release',
    feeling: 'My shoulders and jaw are holding too much.',
    confirmation: 'For when your shoulders and jaw are ready to let go.',
    sessionName: 'Release Tension',
    summary: 'Slow exhale guide, heartbeat haptic, and grounding tone.',
    frequencyId: '174',
    hapticId: 'relief',
    chantId: 'mmm',
    minutes: 8,
    useSchumann: true,
    healingMode: true
  },
  {
    id: 'blocked',
    label: 'Blocked',
    needWord: 'Clarity',
    feeling: 'I want to move, create, or start again.',
    confirmation: 'For when you want to cut through and begin again.',
    sessionName: 'Unblock Flow',
    summary: '417Hz, movement-friendly haptics, and an open vowel.',
    frequencyId: '417',
    hapticId: 'release',
    chantId: 'aaa',
    minutes: 12,
    useSchumann: false,
    healingMode: true
  },
  {
    id: 'focused',
    label: 'Ready',
    needWord: 'Depth',
    feeling: 'I feel ready and want to protect the flow.',
    confirmation: 'For when you are ready and want to protect the work beneath the noise.',
    sessionName: 'Deep Work Shield',
    summary: '852Hz clarity, minimal haptics, and a longer work block.',
    frequencyId: '852',
    hapticId: 'insight',
    chantId: 'om',
    minutes: 25,
    useSchumann: false,
    healingMode: false
  }
];

function moodColor(mood: MoodSessionPreset): string {
  return SOLFEGGIO_FREQUENCIES.find((frequency) => frequency.id === mood.frequencyId)?.color ?? '#4F8F7A';
}

// --- Components ---

function SacredGeometry({ 
  analyzer, 
  activeColor,
  tappingPointIndex = 0,
  isTappingMode = false
}: { 
  analyzer: React.RefObject<AnalyserNode | null>, 
  activeColor: string,
  tappingPointIndex?: number,
  isTappingMode?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const particlesRef = useRef<{ x: number, y: number, size: number, speed: number, angle: number }[]>([]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * 2000 - 1000,
          y: Math.random() * 2000 - 1000,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.1,
          angle: Math.random() * Math.PI * 2
        });
      }
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }
    });

    resizeObserver.observe(container);

    let animationFrameId: number;
    let dataArray = new Uint8Array(0);
    let time = 0;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      
      if (analyzer.current && dataArray.length !== analyzer.current.frequencyBinCount) {
        dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
      }

      time += 0.01;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let intensity = 0;
      let peakFreq = 0;
      if (analyzer.current) {
        analyzer.current.getByteFrequencyData(dataArray);
        intensity = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
        
        let maxVal = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxVal) {
            maxVal = dataArray[i];
            peakFreq = i / dataArray.length;
          }
        }
      }

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Meditative Breathing Cycle (Independent of audio)
      const breathing = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
      const baseRadius = Math.min(width, height) * (0.12 + breathing * 0.03);
      const radius = baseRadius + (intensity * (Math.min(width, height) * 0.15));
      
      rotationRef.current += 0.002 + (intensity * 0.04) + (peakFreq * 0.01);

      // Draw Particles (Stardust)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current * 0.2);
      ctx.fillStyle = activeColor;
      particlesRef.current.forEach(p => {
        p.angle += 0.001;
        const x = p.x + Math.cos(p.angle) * 50;
        const y = p.y + Math.sin(p.angle) * 50;
        ctx.globalAlpha = (0.1 + breathing * 0.2) * (1 - Math.sqrt(x*x + y*y) / 1000);
        ctx.beginPath();
        ctx.arc(x, y, p.size * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Draw Sacred Geometry
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      // Glow effect
      ctx.shadowBlur = (15 + intensity * 30) * window.devicePixelRatio;
      ctx.shadowColor = activeColor;
      
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = (1.5 + (intensity * 6)) * window.devicePixelRatio;
      ctx.globalAlpha = 0.15 + (intensity * 0.5) + (breathing * 0.1);

      const points: { x: number, y: number }[] = [];
      const drawCircle = (x: number, y: number, r: number, store = false) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        if (store) points.push({ x, y });
      };

      // Center circle
      drawCircle(0, 0, radius, true);

      // Flower of Life Layers
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        drawCircle(x, y, radius, true);
      }

      // Metatron's Cube Elements (Connecting lines)
      if (intensity > 0.05 || breathing > 0.5) {
        ctx.save();
        ctx.globalAlpha *= 0.4;
        ctx.lineWidth *= 0.5;
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // Outer Layer
      if (intensity > 0.1 || breathing > 0.7) {
        ctx.globalAlpha *= 0.6;
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI * 2) / 12;
          const x = Math.cos(angle) * radius * 1.732;
          const y = Math.sin(angle) * radius * 1.732;
          drawCircle(x, y, radius);
        }
      }

      // Tapping Point Indicator
      if (isTappingMode) {
        const tappingAngle = (tappingPointIndex * Math.PI * 2) / 9;
        const tx = Math.cos(tappingAngle) * radius * 1.5;
        const ty = Math.sin(tappingAngle) * radius * 1.5;
        
        ctx.save();
        ctx.globalAlpha = 0.4 + (intensity * 0.6);
        ctx.shadowBlur = (20 + intensity * 40) * window.devicePixelRatio;
        ctx.shadowColor = activeColor;
        ctx.fillStyle = activeColor;
        
        const pulseSize = (10 + Math.sin(time * 10) * 5 + intensity * 20) * window.devicePixelRatio;
        
        ctx.beginPath();
        ctx.arc(tx, ty, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring for tapping point
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2 * window.devicePixelRatio;
        ctx.beginPath();
        ctx.arc(tx, ty, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [analyzer, activeColor, tappingPointIndex, isTappingMode]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      <canvas 
        ref={canvasRef} 
        aria-hidden="true"
        className="w-full h-full opacity-60 mix-blend-screen"
      />
    </div>
  );
}

function BreathingGuide({ isPlaying }: { isPlaying: boolean }) {
  const [breathText, setBreathText] = useState('Inhale through nose');

  useEffect(() => {
    if (!isPlaying) return;
    setBreathText('Inhale through nose');
    const interval = setInterval(() => {
      setBreathText((prev) => (prev.startsWith('Inhale') ? 'Exhale slowly' : 'Inhale through nose'));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <AnimatePresence>
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.3, 0.8],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] rounded-full border-2 border-white/10"
          />
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.1, 0.5],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute w-[150px] h-[150px] sm:w-[350px] sm:h-[350px] rounded-full border border-white/5"
          />
          
          <motion.div 
            key={breathText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute text-center text-[10px] sm:text-sm font-mono uppercase tracking-[0.24em] sm:tracking-[0.42em] text-white mt-[180px] sm:mt-[300px]"
          >
            {breathText}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const studio = useStudio();
  const [activeFreq, setActiveFreq] = useState<Frequency | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [hapticsSupported, setHapticsSupported] = useState(true);
  const [useSimulatedHaptics, setUseSimulatedHaptics] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = getStoredValue('focusflow_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation to ensure we have a valid object
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.error('Failed to load profile from localStorage', e);
    }
    return DEFAULT_PROFILE;
  });

  const [mode, setMode] = useState<AppMode>('home');
  const [studioMode, setStudioMode] = useState<StudioMode>('chants');
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('idle');
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(0);
  const [completedSession, setCompletedSession] = useState<Ritual | null>(null);
  const [showStartHere, setShowStartHere] = useState(() => getStoredValue('focusflow_start_here_dismissed') !== 'true');
  const [selectedSessionIntention, setSelectedSessionIntention] = useState<SessionIntentionId>(() => {
    const storedIntention = getStoredValue('focusflow_session_intention', 'focus');
    return SESSION_INTENTION_PRESETS.some((preset) => preset.id === storedIntention)
      ? (storedIntention as SessionIntentionId)
      : 'focus';
  });
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId>('scattered');
  const [activeGeneratedSession, setActiveGeneratedSession] = useState<Ritual | null>(null);
  const [savedRituals, setSavedRituals] = useState<Ritual[]>(() => {
    try {
      const saved = getStoredValue('focusflow_rituals');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to load saved rituals.', error);
      return [];
    }
  });
  const [gardenEntries, setGardenEntries] = useState<GardenEntry[]>(() => {
    try {
      const saved = getStoredValue('focusflow_garden');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to load progress garden.', error);
      return [];
    }
  });
  const [gardenRooms, setGardenRooms] = useState<GardenRoom[]>(() => {
    try {
      const saved = getStoredValue('focusflow_garden_rooms');
      const parsed = saved ? JSON.parse(saved) : [];
      return normalizeGardenRooms(parsed);
    } catch (error) {
      console.warn('Unable to load garden rooms.', error);
      return DEFAULT_GARDEN_ROOMS;
    }
  });
  const [gardenPlacements, setGardenPlacements] = useState<Record<string, ElementPlacement | null>>(() => {
    try {
      const saved = getStoredValue('focusflow_garden_placements');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('Unable to load garden placements.', error);
      return {};
    }
  });
  const [isMicActive, setIsMicActive] = useState(false);
  const [isReferencePlaying, setIsReferencePlaying] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [activeHaptic, setActiveHaptic] = useState<HapticPattern | null>(null);
  const [isHealingMode, setIsHealingMode] = useState(false);
  const [isSchumannActive, setIsSchumannActive] = useState(userProfile.useSchumann);
  const [isVisualizerActive, setIsVisualizerActive] = useState(userProfile.showVisualizer);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [micPitch, setMicPitch] = useState<number | null>(null);
  const [tappingPointIndex, setTappingPointIndex] = useState(0);
  const [selectedChant, setSelectedChant] = useState<SonicChant | null>(null);
  const [audioVolume, setAudioVolume] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recorderChunks = useRef<Blob[]>([]);
  const recorderDestination = useRef<MediaStreamAudioDestinationNode | null>(null);

  const [activeReferenceId, setActiveReferenceId] = useState<string | null>(null);
  const [audioContextState, setAudioContextState] = useState<AudioContextState>('suspended');
  const studioWasUnlocked = useRef(studio.hasStudio);

  // Haptics Helper
  const triggerHaptic = (pattern: number | number[] = 50) => {
    const firstImpact = Array.isArray(pattern) ? pattern[0] : pattern;
    void fireNativeImpact(Math.min(1, Math.max(0.18, firstImpact / 100)));
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    if (!studioWasUnlocked.current && studio.hasStudio) {
      triggerHaptic(10);
    }
    studioWasUnlocked.current = studio.hasStudio;
  }, [studio.hasStudio]);

  const dismissStartHere = () => {
    setShowStartHere(false);
    setStoredValue('focusflow_start_here_dismissed', 'true');
  };

  const openModeFromStartHere = (nextMode: AppMode | StudioMode | 'profile') => {
    dismissStartHere();
    if (nextMode === 'profile') {
      setMode('you');
    } else if (nextMode === 'garden') {
      setMode('garden');
    } else if (STUDIO_MODES.includes(nextMode as StudioMode)) {
      setStudioMode(nextMode as StudioMode);
      setMode('studio');
    } else {
      setMode(nextMode as AppMode);
    }
    triggerHaptic(20);
  };

  useEffect(() => {
    setStoredValue('focusflow_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    setStoredValue('focusflow_session_intention', selectedSessionIntention);
  }, [selectedSessionIntention]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--session-wash',
      sessionPhase === 'running' && activeFreq ? `${activeFreq.color}20` : 'transparent'
    );
  }, [sessionPhase, activeFreq]);

  useEffect(() => {
    setStoredValue('focusflow_rituals', JSON.stringify(savedRituals.slice(0, 12)));
  }, [savedRituals]);

  useEffect(() => {
    setStoredValue('focusflow_garden', JSON.stringify(gardenEntries.slice(0, 60)));
  }, [gardenEntries]);

  useEffect(() => {
    setStoredValue('focusflow_garden_rooms', JSON.stringify(gardenRooms.slice(0, 3)));
  }, [gardenRooms]);

  useEffect(() => {
    setStoredValue('focusflow_garden_placements', JSON.stringify(gardenPlacements));
  }, [gardenPlacements]);
  
  useEffect(() => {
    if ((!isMicActive && !isAudioPlaying && activeReferenceId === null && !isPlaying) || !analyzer.current) {
      setAudioVolume(0);
      return;
    }
    
    let animationFrameId: number;
    let dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
    
    const updateVolume = () => {
      if (analyzer.current) {
        if (dataArray.length !== analyzer.current.frequencyBinCount) {
          dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
        }
        analyzer.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / (dataArray.length || 1);
        setAudioVolume(average / 255);

        // Pitch Detection (Basic)
        if (isMicActive) {
          let maxVal = 0;
          let maxIdx = -1;
          for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > maxVal) {
              maxVal = dataArray[i];
              maxIdx = i;
            }
          }
          if (maxVal > 50) { // Noise gate
            const nyquist = (audioCtx.current?.sampleRate || 44100) / 2;
            const freq = maxIdx * (nyquist / dataArray.length);
            setMicPitch(freq);
          } else {
            setMicPitch(null);
          }
        } else {
          setMicPitch(null);
        }
      }
      animationFrameId = requestAnimationFrame(updateVolume);
    };
    
    updateVolume();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMicActive, isAudioPlaying, isReferencePlaying, isPlaying]);

  // Audio Refs
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const oscillator2 = useRef<OscillatorNode | null>(null);
  const schumannOsc = useRef<OscillatorNode | null>(null);
  const schumannGain = useRef<GainNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const masterGainNode = useRef<GainNode | null>(null);
  const sonicGainNode = useRef<GainNode | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const analyzer = useRef<AnalyserNode | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const micSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const droneOsc = useRef<OscillatorNode | null>(null);
  const droneGain = useRef<GainNode | null>(null);
  const audioFileElement = useRef<HTMLAudioElement | null>(null);
  const audioFileSource = useRef<MediaElementAudioSourceNode | null>(null);
  const keepAlive = useRef<AudioBufferSourceNode | null>(null);
  const wakeLock = useRef<any>(null);

  const startKeepAlive = useCallback((ctx: AudioContext) => {
    if (keepAlive.current) return;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const source = ctx.createBufferSource();
    const keepAliveGain = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    keepAliveGain.gain.value = 0;
    source.connect(keepAliveGain).connect(ctx.destination);
    source.start();
    keepAlive.current = source;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator) || wakeLock.current) return;

    try {
      wakeLock.current = await (navigator as any).wakeLock.request('screen');
    } catch (err) {
      const message = err instanceof Error ? `${err.name}, ${err.message}` : 'Wake lock request failed.';
      console.warn(message);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLock.current) return;

    try {
      await wakeLock.current.release();
    } catch (err) {
      console.warn('Wake lock release failed.', err);
    } finally {
      wakeLock.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      triggerHaptic([20, 50]);
    }
  }, [triggerHaptic]);

  // Initialize Audio Context
  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('Web Audio API is not supported in this browser.');
        return null;
      }

      audioCtx.current = new AudioContextClass();
      
      audioCtx.current.onstatechange = () => {
        if (audioCtx.current) setAudioContextState(audioCtx.current.state);
      };
      setAudioContextState(audioCtx.current.state);
      
      // Master Gain
      masterGainNode.current = audioCtx.current.createGain();
      const initialGain = isMuted ? 0.0001 : Math.max(0.0001, volume);
      masterGainNode.current.gain.setValueAtTime(initialGain, audioCtx.current.currentTime);
      masterGainNode.current.connect(audioCtx.current.destination);

      reverbNode.current = audioCtx.current.createConvolver();
      const impulseLength = audioCtx.current.sampleRate * 2.2;
      const impulse = audioCtx.current.createBuffer(2, impulseLength, audioCtx.current.sampleRate);
      for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
          const decay = Math.pow(1 - i / impulseLength, 2.8);
          data[i] = (Math.random() * 2 - 1) * decay * 0.18;
        }
      }
      reverbNode.current.buffer = impulse;
      reverbNode.current.connect(masterGainNode.current);

      // Solfeggio Gain (for fading)
      gainNode.current = audioCtx.current.createGain();
      gainNode.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      
      // Connect Solfeggio chain directly so selected tones stay frequency-accurate.
      gainNode.current.connect(masterGainNode.current);
      gainNode.current.connect(reverbNode.current);

      // Sonic Vocalizations Gain
      sonicGainNode.current = audioCtx.current.createGain();
      sonicGainNode.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      sonicGainNode.current.connect(masterGainNode.current);

      // Schumann Resonance Gain
      schumannGain.current = audioCtx.current.createGain();
      schumannGain.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      schumannGain.current.connect(masterGainNode.current);

      // Analyzer for visuals
      analyzer.current = audioCtx.current.createAnalyser();
      analyzer.current.fftSize = 256;
      
      // Connect all to analyzer for visualization
      gainNode.current.connect(analyzer.current);
      sonicGainNode.current.connect(analyzer.current);
      startKeepAlive(audioCtx.current);
    }
    
    if (audioCtx.current?.state === 'suspended') {
      audioCtx.current.resume();
    }

    return audioCtx.current;
  }, [volume, isMuted, startKeepAlive]);

  const startRecording = useCallback(() => {
    const ctx = initAudio();
    if (!ctx || !masterGainNode.current || typeof MediaRecorder === 'undefined') return;
    
    if (!recorderDestination.current) {
      recorderDestination.current = ctx.createMediaStreamDestination();
      masterGainNode.current.connect(recorderDestination.current);
    }
    
    recorderChunks.current = [];
    const stream = recorderDestination.current.stream;
    
    // Fallback to standard mime types
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
    mediaRecorder.current = new MediaRecorder(stream, { mimeType });
    
    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recorderChunks.current.push(e.data);
      }
    };
    
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(recorderChunks.current, { type: mimeType });
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setIsRecording(false);
    };
    
    mediaRecorder.current.start();
    setIsRecording(true);
    triggerHaptic([50, 20]);
  }, [initAudio, recordedUrl, triggerHaptic]);

  const stopFrequency = useCallback(() => {
    const ctx = audioCtx.current;
    if (!ctx) {
      oscillator.current = null;
      oscillator2.current = null;
      schumannOsc.current = null;
      setIsPlaying(false);
      setIsReferencePlaying(false);
      setActiveReferenceId(null);
      return;
    }

    if (schumannOsc.current) {
      const now = ctx.currentTime;
      if (schumannGain.current) {
        schumannGain.current.gain.cancelScheduledValues(now);
        schumannGain.current.gain.setValueAtTime(schumannGain.current.gain.value, now);
        schumannGain.current.gain.setTargetAtTime(0.0001, now, 0.18);
      }
      const node = schumannOsc.current;
      setTimeout(() => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      }, 700);
      schumannOsc.current = null;
    }

    if (oscillator.current) {
      const now = ctx.currentTime;
      if (gainNode.current) {
        gainNode.current.gain.cancelScheduledValues(now);
        gainNode.current.gain.setValueAtTime(gainNode.current.gain.value, now);
        gainNode.current.gain.setTargetAtTime(0.0001, now, 0.08);
      }
      if (sonicGainNode.current) {
        sonicGainNode.current.gain.cancelScheduledValues(now);
        sonicGainNode.current.gain.setValueAtTime(sonicGainNode.current.gain.value, now);
        sonicGainNode.current.gain.setTargetAtTime(0.0001, now, 0.08);
      }
      
      const osc1 = oscillator.current;
      const osc2 = oscillator2.current;
      const subOsc = (osc1 as any).subOsc;
      const breathSource = (osc1 as any).breathSource;
      const lfo = (osc1 as any).lfo;
      const partial = (osc1 as any).partial;
      const air = (osc1 as any).air;
      const drift = (osc1 as any).drift;
      const formants = (osc1 as any).formants;
      
      setTimeout(() => {
        try {
          osc1.stop();
          osc1.disconnect();
          if (osc2) {
            osc2.stop();
            osc2.disconnect();
          }
          if (subOsc) {
            subOsc.stop();
            subOsc.disconnect();
          }
          if (breathSource) {
            breathSource.stop();
            breathSource.disconnect();
          }
          if (lfo) {
            lfo.stop();
            lfo.disconnect();
          }
          if (partial) {
            partial.stop();
            partial.disconnect();
          }
          if (air) {
            air.stop();
            air.disconnect();
          }
          if (drift) {
            drift.stop();
            drift.disconnect();
          }
          if (formants) {
            formants.forEach((f: any) => {
              try { f.filter.disconnect(); f.gain.disconnect(); } catch (e) {}
            });
          }
        } catch (e) {}
      }, 700);
      
      oscillator.current = null;
      oscillator2.current = null;
    }

    if (hasMediaSessionSupport()) {
      navigator.mediaSession.playbackState = 'paused';
    }

    void releaseWakeLock();
    setIsPlaying(false);
    setIsReferencePlaying(false);
    setActiveReferenceId(null);
  }, [releaseWakeLock]);

  const playFrequency = useCallback((freq: Frequency, options?: { healingMode?: boolean; schumannActive?: boolean }) => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (oscillator.current) {
      stopFrequency();
    }

    const now = ctx.currentTime;
    const healingEnabled = options?.healingMode ?? isHealingMode;
    const schumannEnabled = options?.schumannActive ?? isSchumannActive;

    // Update Media Session
    if (hasMediaSessionSupport() && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${freq.label} (${freq.hz}Hz)`,
        artist: 'Focus Flow',
        album: 'Solfeggio Frequencies',
        artwork: [
          { src: new URL('icon-512.png', window.location.href).href, sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.playbackState = 'playing';
    }

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    const partial = ctx.createOscillator();
    partial.type = 'sine';
    const partialGain = ctx.createGain();
    const air = ctx.createBufferSource();
    const airGain = ctx.createGain();
    const airFilter = ctx.createBiquadFilter();
    const drift = ctx.createOscillator();
    const driftGain = ctx.createGain();

    partial.frequency.setValueAtTime(freq.hz * 2, now);
    partialGain.gain.setValueAtTime(0.0001, now);
    partialGain.gain.exponentialRampToValueAtTime(0.07, now + 1.2);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < noise.length; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.98 * last + 0.02 * white;
      noise[i] = last;
    }
    air.buffer = noiseBuffer;
    air.loop = true;
    airFilter.type = 'lowpass';
    airFilter.frequency.setValueAtTime(1800, now);
    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.exponentialRampToValueAtTime(0.012, now + 2);

    drift.type = 'sine';
    drift.frequency.setValueAtTime(1 / 30, now);
    driftGain.gain.setValueAtTime(4, now);
    drift.connect(driftGain);
    driftGain.connect(osc1.detune);
    driftGain.connect(osc2.detune);

    if (healingEnabled) {
      // Center a 6Hz binaural offset around the selected carrier frequency.
      // Headphones are recommended; the displayed Hz remains the carrier center.
      osc1.frequency.setValueAtTime(freq.hz - 3, now);
      osc2.frequency.setValueAtTime(freq.hz + 3, now);

      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      osc1.connect(g1);
      osc2.connect(g2);

      if ('createStereoPanner' in ctx) {
        const panner1 = ctx.createStereoPanner();
        const panner2 = ctx.createStereoPanner();
        panner1.pan.setValueAtTime(-1, now);
        panner2.pan.setValueAtTime(1, now);
        g1.connect(panner1).connect(gainNode.current!);
        g2.connect(panner2).connect(gainNode.current!);
      } else {
        g1.connect(gainNode.current!);
        g2.connect(gainNode.current!);
      }
      oscillator2.current = osc2;
      osc2.start();
    } else {
      osc1.frequency.setValueAtTime(freq.hz, now);
      osc2.frequency.setValueAtTime(freq.hz, now);
      osc2.detune.setValueAtTime(3, now);
      osc1.connect(gainNode.current!);
      osc2.connect(gainNode.current!);
      oscillator2.current = osc2;
      osc2.start();
    }

    partial.connect(partialGain).connect(gainNode.current!);
    air.connect(airFilter).connect(airGain).connect(gainNode.current!);
    gainNode.current!.gain.cancelScheduledValues(now);
    gainNode.current!.gain.setValueAtTime(0.0001, now);
    gainNode.current!.gain.setTargetAtTime(0.42, now, 1.4);
    
    // Schumann resonance anchor. 7.83Hz is the common rounded reference value.
    if (schumannEnabled) {
      const sOsc = ctx.createOscillator();
      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(SCHUMANN_RESONANCE_HZ, now);
      sOsc.connect(schumannGain.current!);
      sOsc.start();
      schumannOsc.current = sOsc;
      schumannGain.current!.gain.cancelScheduledValues(now);
      schumannGain.current!.gain.setValueAtTime(0.0001, now);
      schumannGain.current!.gain.exponentialRampToValueAtTime(0.045, now + 2);
    }

    osc1.start();
    partial.start();
    air.start();
    drift.start();
    oscillator.current = osc1;
    (oscillator.current as any).partial = partial;
    (oscillator.current as any).air = air;
    (oscillator.current as any).drift = drift;
    setActiveFreq(freq);
    setIsPlaying(true);
    void requestWakeLock();
  }, [initAudio, stopFrequency, isHealingMode, isSchumannActive, requestWakeLock]);

  const strikeBell = useCallback((fundamental: number) => {
    const ctx = initAudio();
    const out = reverbNode.current ?? masterGainNode.current;
    if (!ctx || !out) return;

    const partials = [
      { ratio: 1.00, gain: 1.00, decay: 4.0 },
      { ratio: 2.00, gain: 0.60, decay: 3.0 },
      { ratio: 2.76, gain: 0.40, decay: 2.0 },
      { ratio: 5.40, gain: 0.25, decay: 1.2 },
      { ratio: 8.93, gain: 0.15, decay: 0.6 },
    ];
    const now = ctx.currentTime;

    partials.forEach((partial) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * partial.ratio, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(partial.gain * 0.12, now + 0.018);
      gain.gain.setTargetAtTime(0.0001, now + 0.08, partial.decay / 5);
      osc.connect(gain).connect(out);
      osc.start(now);
      osc.stop(now + partial.decay + 0.2);
    });
  }, [initAudio]);

  const launchSessionIntention = useCallback((intentionId: SessionIntentionId) => {
    const preset = SESSION_INTENTION_PRESETS.find((entry) => entry.id === intentionId);
    if (!preset) return;

    setSelectedSessionIntention(intentionId);
    dismissStartHere();

    if (preset.frequencyId) {
      const targetFrequency = SOLFEGGIO_FREQUENCIES.find((frequency) => frequency.id === preset.frequencyId);
      setMode('session');
      setSessionPhase('settling');
      setCompletedSession(null);
      setSessionRemainingSeconds(Math.max(30, userProfile.focusMinutes * 60));
      if (targetFrequency) {
        const hapticId = userProfile.preferredHapticId ?? hapticIdForFrequency(targetFrequency.id);
        setActiveGeneratedSession({
          id: `intent-${Date.now()}`,
          name: preset.actionLabel.replace(/^Start\s+/i, ''),
          moodId: selectedMoodId,
          frequencyId: targetFrequency.id,
          hapticId,
          minutes: userProfile.focusMinutes,
          useSchumann: isSchumannActive,
          healingMode: isHealingMode,
          createdAt: new Date().toISOString()
        });
        playFrequency(targetFrequency);
        const haptic = HAPTIC_PATTERNS.find((entry) => entry.id === hapticId);
        if (haptic) playHaptic(haptic);
      }
      triggerHaptic([30, 20, 30]);
      window.setTimeout(() => {
        setSessionPhase((phase) => phase === 'settling' ? 'running' : phase);
      }, 18000);
      return;
    }

    if (preset.mode === 'garden') {
      setMode('garden');
    } else if (STUDIO_MODES.includes(preset.mode as StudioMode)) {
      setStudioMode(preset.mode as StudioMode);
      setMode('studio');
    } else {
      setMode(preset.mode as AppMode);
    }
    triggerHaptic(20);
  }, [dismissStartHere, isHealingMode, isSchumannActive, playFrequency, selectedMoodId, userProfile.focusMinutes, userProfile.preferredHapticId]);

  useEffect(() => {
    if (masterGainNode.current && audioCtx.current) {
      const now = audioCtx.current.currentTime;
      const targetGain = isMuted ? 0.0001 : Math.max(0.0001, volume);
      masterGainNode.current.gain.cancelScheduledValues(now);
      masterGainNode.current.gain.setTargetAtTime(targetGain, now, 0.06);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && activeFreq) {
      playFrequency(activeFreq);
    }
  }, [isPlaying, activeFreq, playFrequency, isHealingMode, isSchumannActive]);

  // Media Session Handlers
  useEffect(() => {
    if (hasMediaSessionSupport()) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          if (activeFreq) playFrequency(activeFreq);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          stopFrequency();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          stopFrequency();
        });
      } catch (error) {
        console.warn('Media Session action handlers are not fully supported in this browser.', error);
      }
    }
  }, [activeFreq, playFrequency, stopFrequency]);

  // Wake Lock and resume logic
  useEffect(() => {
    if (isPlaying) {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }
  }, [isPlaying, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !isPlaying) return;

      void audioCtx.current?.resume();
      void requestWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, requestWakeLock]);

  useEffect(() => () => {
    void releaseWakeLock();
  }, [releaseWakeLock]);

  // Haptics Helper

  // Haptic Looper
  const hapticInterval = useRef<NodeJS.Timeout | null>(null);
  const hapticTimers = useRef<NodeJS.Timeout[]>([]);

  const stopHaptic = useCallback(() => {
    if (hapticInterval.current) {
      clearInterval(hapticInterval.current);
      hapticInterval.current = null;
    }
    hapticTimers.current.forEach((timer) => clearTimeout(timer));
    hapticTimers.current = [];
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    setActiveHaptic(null);
  }, []);

  const playHaptic = useCallback((haptic: HapticPattern) => {
    stopHaptic();
    setActiveHaptic(haptic);

    const runScore = () => {
      const vibrationPattern = haptic.events
        .slice()
        .sort((a, b) => a.at - b.at)
        .flatMap((event, index, events) => {
          const previousEnd = index === 0 ? 0 : events[index - 1].at + events[index - 1].duration;
          return [Math.max(0, event.at - previousEnd), Math.max(1, event.duration)];
        });

      if ('vibrate' in navigator) {
        navigator.vibrate(vibrationPattern);
      }

      haptic.events.forEach((event) => {
        const timer = setTimeout(() => {
          void fireNativeImpact(event.intensity);
        }, event.at);
        hapticTimers.current.push(timer);
      });

      if (useSimulatedHaptics || !('vibrate' in navigator)) {
        const ctx = initAudio();
        if (!ctx) return;

        haptic.events.forEach((event) => {
          const now = ctx.currentTime + event.at / 1000;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const duration = Math.max(0.04, event.duration / 1000);
          const peak = 0.012 + event.intensity * 0.055;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(40 + event.intensity * 40, now);
          gain.gain.setValueAtTime(0.0001, now);
          if (event.curve === 'swell') {
            gain.gain.exponentialRampToValueAtTime(peak, now + duration * 0.65);
          } else {
            gain.gain.exponentialRampToValueAtTime(peak, now + Math.min(0.08, duration * 0.25));
          }
          gain.gain.setTargetAtTime(0.0001, now + duration * 0.7, 0.08);

          osc.connect(gain).connect(masterGainNode.current ?? ctx.destination);
          osc.start(now);
          osc.stop(now + duration + 0.25);
        });
      }
    };
    
    const run = () => {
      runScore();
    };

    run();
    if (haptic.loopMs) hapticInterval.current = setInterval(run, haptic.loopMs);
  }, [stopHaptic, useSimulatedHaptics, initAudio]);

  useEffect(() => {
    return () => {
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      hapticTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const playReferenceTone = useCallback((chant: SonicChant) => {
    if (!chant.referenceHz) return;
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const isSameChant = activeReferenceId === chant.id;

    if (activeReferenceId || oscillator.current) {
      stopFrequency();
      if (isSameChant) return; // Toggle off if same
    }

    // Set as selected chant so user sees what they are hearing
    setSelectedChant(chant);

    const now = ctx.currentTime;
    const freq = chant.referenceHz;

    // --- Vocal Synthesis Model ---
    
    // 1. Source: Multiple detuned oscillators for a thick, human-like fundamental
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    
    osc1.type = 'triangle';
    osc2.type = 'sine';
    subOsc.type = 'sine';
    
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq, now);
    subOsc.frequency.setValueAtTime(freq, now);
    
    osc1.detune.setValueAtTime(-8, now);
    osc2.detune.setValueAtTime(8, now);
    
    // 2. Breath Noise: Adds realism through air-flow simulation
    const noiseBufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const breathSource = ctx.createBufferSource();
    breathSource.buffer = noiseBuffer;
    breathSource.loop = true;
    
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.018, now);
    
    // 3. Formant Filters: Simulating the vocal tract resonances
    // Vowel Formant frequencies (F1, F2, F3, F4)
    let f1Hz = 500, f2Hz = 1500, f3Hz = 2500, f4Hz = 3500;
    
    const sound = chant.sound.toUpperCase();
    if (sound.includes('AAA') || sound.includes('AH') || sound.includes('LAM') || sound.includes('RAM') || sound.includes('YAM')) { 
      f1Hz = 730; f2Hz = 1090; f3Hz = 2440; f4Hz = 3400; 
    }
    else if (sound.includes('EEE') || sound.includes('EE') || sound.includes('XI') || sound.includes('SI')) { 
      f1Hz = 270; f2Hz = 2290; f3Hz = 3010; f4Hz = 3500; 
    }
    else if (sound.includes('OOO') || sound.includes('OO') || sound.includes('VOO') || sound.includes('HU') || sound.includes('CHUI')) { 
      f1Hz = 300; f2Hz = 870; f3Hz = 2240; f4Hz = 3300; 
    }
    else if (sound.includes('OM') || sound.includes('VAM')) { 
      f1Hz = 570; f2Hz = 840; f3Hz = 2410; f4Hz = 3500; 
    }
    else if (sound.includes('HE')) { 
      f1Hz = 530; f2Hz = 1840; f3Hz = 2480; f4Hz = 3400; 
    }
    else if (sound.includes('MMM') || sound.includes('HUM') || sound.includes('HAM')) { 
      f1Hz = 250; f2Hz = 600; f3Hz = 2200; f4Hz = 3400; 
    }

    const createFormant = (freq: number, q: number, gain: number) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(q, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, now);
      filter.connect(g);
      return { filter, gain: g };
    };

    const formants = [
      createFormant(f1Hz, 15, 1.0),
      createFormant(f2Hz, 12, 0.6),
      createFormant(f3Hz, 10, 0.3),
      createFormant(f4Hz, 8, 0.1)
    ];

    // Special handling for "WHY" (Dynamic vowel transition)
    if (sound === 'WHY') {
      const transition = (f: BiquadFilterNode, target: number, time: number) => {
        f.frequency.exponentialRampToValueAtTime(target, now + time);
      };
      // OOO -> AAA -> EEE
      formants.forEach((form, i) => {
        const targets = [
          [300, 730, 270, 300], // F1
          [870, 1090, 2290, 870], // F2
          [2240, 2440, 3010, 2240], // F3
          [3300, 3400, 3500, 3300]  // F4
        ][i];
        transition(form.filter, targets[1], 2);
        transition(form.filter, targets[2], 4);
        transition(form.filter, targets[3], 6);
      });
    }

    // 4. Vibrato (LFO)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.2, now); // Slightly faster for more emotion
    lfoGain.gain.setValueAtTime(freq * 0.012, now); // 1.2% depth
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    lfoGain.connect(subOsc.frequency);
    lfo.start();

    // 5. Connections
    const sourceMix = ctx.createGain();
    sourceMix.gain.setValueAtTime(0.32, now);
    
    osc1.connect(sourceMix);
    osc2.connect(sourceMix);
    subOsc.connect(sourceMix);
    breathSource.connect(breathGain);
    breathGain.connect(sourceMix);

    const vocalMix = ctx.createGain();
    vocalMix.gain.setValueAtTime(0, now);
    vocalMix.gain.linearRampToValueAtTime(0.42, now + 0.6);

    formants.forEach(f => {
      sourceMix.connect(f.filter);
      f.gain.connect(vocalMix);
    });

    // Final Polish: Gentle Compression and Lowpass
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(30, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.25, now);

    const finalFilter = ctx.createBiquadFilter();
    finalFilter.type = 'lowpass';
    finalFilter.frequency.setValueAtTime(3600, now);

    vocalMix.connect(compressor);
    compressor.connect(finalFilter);
    finalFilter.connect(analyzer.current!);

    if (sonicGainNode.current) {
      finalFilter.connect(sonicGainNode.current);
      sonicGainNode.current.gain.cancelScheduledValues(now);
      sonicGainNode.current.gain.setValueAtTime(0.0001, now);
      sonicGainNode.current.gain.exponentialRampToValueAtTime(0.35, now + 0.7);
    }

    osc1.start();
    osc2.start();
    subOsc.start();
    breathSource.start();

    // Store references for stopping
    oscillator.current = osc1;
    oscillator2.current = osc2;
    (oscillator.current as any).subOsc = subOsc;
    (oscillator.current as any).breathSource = breathSource;
    (oscillator.current as any).lfo = lfo;
    (oscillator.current as any).formants = formants;

    setIsReferencePlaying(true);
    setActiveReferenceId(chant.id);
    triggerHaptic([20, 40]);
  }, [activeReferenceId, initAudio, stopFrequency]);

  useEffect(() => {
    return () => {
      if (uploadedAudioUrl && uploadedAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [uploadedAudioUrl]);

  useEffect(() => {
    return () => {
      if (recordedUrl && recordedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const handleAudioUpload = useCallback((file: File | string) => {
    initAudio();
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    setUploadedAudioUrl(url);
    setIsAudioLoading(true);
    
    // Ensure context is running
    if (audioCtx.current?.state === 'suspended') {
      audioCtx.current.resume();
    }

    let audio = audioFileElement.current;
    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      // Try with anonymous first for visualizer support
      audio.crossOrigin = "anonymous";
      audioFileElement.current = audio;
      
      const setupSource = () => {
        if (!audioCtx.current || !analyzer.current) return;
        try {
          const source = audioCtx.current.createMediaElementSource(audio!);
          source.connect(analyzer.current);
          if (sonicGainNode.current) {
            source.connect(sonicGainNode.current);
            sonicGainNode.current.gain.setValueAtTime(0.8, audioCtx.current.currentTime);
          } else {
            source.connect(audioCtx.current.destination);
          }
          audioFileSource.current = source;
        } catch (e) {
          console.error("Error creating media source:", e);
        }
      };

      setupSource();
      
      audio.onplay = () => {
        setIsAudioPlaying(true);
        setIsAudioLoading(false);
      };
      audio.onpause = () => setIsAudioPlaying(false);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onerror = () => {
        console.warn("Audio loading error, retrying without CORS...");
        if (audio!.crossOrigin === "anonymous") {
          audio!.crossOrigin = null;
          audio!.load();
          audio!.play().catch(e => console.error("Retry play failed:", e));
        } else {
          setIsAudioLoading(false);
        }
      };
    }

    audio.src = url;
    audio.load();
    
    // Ensure gain is up and context is running
    if (sonicGainNode.current && audioCtx.current) {
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }
      sonicGainNode.current.gain.setTargetAtTime(0.8, audioCtx.current.currentTime, 0.1);
    }
    
    // Reset volume to ensure it's audible
    audio.volume = 1.0;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsAudioLoading(false);
        // Double check context state
        if (audioCtx.current?.state === 'suspended') {
          audioCtx.current.resume();
        }
      }).catch(error => {
        console.error("Auto-play failed:", error);
        setIsAudioLoading(false);
      });
    }
  }, [initAudio]);

  const toggleAudioPlayback = useCallback(() => {
    if (!audioFileElement.current) return;
    
    if (isAudioPlaying) {
      audioFileElement.current.pause();
    } else {
      if (audioCtx.current?.state === 'suspended') {
        audioCtx.current.resume();
      }
      audioFileElement.current.play();
    }
  }, [isAudioPlaying]);

  const removeUploadedAudio = useCallback(() => {
    if (audioFileElement.current) {
      audioFileElement.current.pause();
      audioFileElement.current.src = "";
    }
    setUploadedAudioUrl(null);
    setIsAudioPlaying(false);
  }, []);

  const toggleMic = useCallback(async () => {
    try {
      const ctx = initAudio();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (isMicActive) {
        // STOP MIC
        if (micStream.current) {
          try {
            micStream.current.getTracks().forEach(track => track.stop());
          } catch (e) {
            console.error("Error stopping mic tracks:", e);
          }
          micStream.current = null;
        }
        if (micSource.current) {
          try {
            micSource.current.disconnect();
          } catch (e) {
            console.error("Error disconnecting mic source:", e);
          }
          micSource.current = null;
        }
        setIsMicActive(false);
        
        // Reconnect analyzer to gainNode if it was disconnected
        if (analyzer.current && gainNode.current) {
          try {
            gainNode.current.connect(analyzer.current);
          } catch (e) {
            console.error("Error reconnecting analyzer:", e);
          }
        }
      } else {
        // START MIC
        try {
          if (!navigator.mediaDevices?.getUserMedia) {
            console.error('Microphone input is not supported in this browser.');
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream.current = stream;
          micSource.current = ctx.createMediaStreamSource(stream);
          
          if (analyzer.current) {
            // Disconnect gainNode from analyzer to only show mic input
            if (gainNode.current) {
              try { gainNode.current.disconnect(analyzer.current); } catch(e) {}
            }
            micSource.current.connect(analyzer.current);
          }
          
          setIsMicActive(true);
          triggerHaptic([20, 40]);
        } catch (err) {
          console.error("Microphone access denied:", err);
          // Use a more subtle way to inform the user if possible, but for now just log
        }
      }
    } catch (err) {
      console.error("Toggle mic error:", err);
    }
  }, [isMicActive, initAudio, triggerHaptic]);

  useEffect(() => {
    if (isDroneActive && selectedChant?.referenceHz && droneOsc.current && audioCtx.current) {
      droneOsc.current.frequency.exponentialRampToValueAtTime(selectedChant.referenceHz / 2, audioCtx.current.currentTime + 1.5);
    }
  }, [selectedChant, isDroneActive]);

  const toggleDrone = useCallback(() => {
    const ctx = initAudio();
    if (!ctx || !masterGainNode.current) return;

    if (isDroneActive) {
      if (droneGain.current) {
        droneGain.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
        setTimeout(() => {
          if (droneOsc.current) {
            droneOsc.current.stop();
            droneOsc.current = null;
          }
        }, 1600);
      }
      setIsDroneActive(false);
    } else {
      const freq = selectedChant?.referenceHz || 136.1; // Default to 'Om' freq
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'triangle'; // Rich but soft
      osc.frequency.setValueAtTime(freq / 2, ctx.currentTime);
      
      // Sub-harmonic for depth
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq / 4, ctx.currentTime);
      
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 2);
      
      osc.connect(g);
      osc2.connect(g);
      g.connect(masterGainNode.current);
      
      osc.start();
      osc2.start();
      
      droneOsc.current = osc;
      droneGain.current = g;
      setIsDroneActive(true);
      triggerHaptic([30, 10]);
    }
  }, [isDroneActive, selectedChant, initAudio]);

  const applyRitual = useCallback((ritual: Ritual) => {
    const frequency = SOLFEGGIO_FREQUENCIES.find((entry) => entry.id === ritual.frequencyId) ?? SOLFEGGIO_FREQUENCIES[0];
    const haptic = HAPTIC_PATTERNS.find((entry) => entry.id === ritual.hapticId);
    const chant = ritual.chantId ? SONIC_CHANTS.find((entry) => entry.id === ritual.chantId) : null;

    setMode('session');
    setSessionPhase('settling');
    setSessionRemainingSeconds(Math.max(30, ritual.minutes * 60));
    setCompletedSession(null);
    setSelectedMoodId(ritual.moodId);
    setUserProfile((profile) => ({
      ...profile,
      focusMinutes: ritual.minutes,
      preferredFrequencyId: ritual.frequencyId,
      preferredHapticId: ritual.hapticId,
      useSchumann: ritual.useSchumann,
      showVisualizer: true
    }));
    setIsHealingMode(ritual.healingMode);
    setIsSchumannActive(ritual.useSchumann);
    setIsVisualizerActive(true);
    setSelectedChant(chant ?? null);
    setActiveGeneratedSession(ritual);
    playFrequency(frequency, { healingMode: ritual.healingMode, schumannActive: ritual.useSchumann });
    if (haptic) playHaptic(haptic);
    triggerHaptic([20, 40, 20]);
    window.setTimeout(() => {
      setSessionPhase((phase) => phase === 'settling' ? 'running' : phase);
    }, 18000);
  }, [playFrequency, playHaptic, triggerHaptic]);

  const launchMoodSession = useCallback((moodId: MoodId) => {
    const preset = MOOD_SESSION_PRESETS.find((entry) => entry.id === moodId) ?? MOOD_SESSION_PRESETS[0];
    const ritual: Ritual = {
      id: `session-${Date.now()}`,
      name: preset.sessionName,
      moodId: preset.id,
      frequencyId: preset.frequencyId,
      hapticId: preset.hapticId,
      chantId: preset.chantId,
      minutes: preset.minutes,
      useSchumann: preset.useSchumann,
      healingMode: preset.healingMode,
      createdAt: new Date().toISOString()
    };

    applyRitual(ritual);
  }, [applyRitual]);

  const openHomeNeed = useCallback((moodId: MoodId, options?: { schumann?: boolean; depth?: boolean; visuals?: boolean }) => {
    setSelectedMoodId(moodId);
    if (options?.schumann !== undefined) setIsSchumannActive(options.schumann);
    if (options?.depth !== undefined) setIsHealingMode(options.depth);
    if (options?.visuals !== undefined) setIsVisualizerActive(options.visuals);
    setMode('home');
    triggerHaptic(20);
  }, [triggerHaptic]);

  const enterZenMode = useCallback(() => {
    dismissStartHere();
    setIsZenMode(true);
    if (mode !== 'session') {
      launchMoodSession(selectedMoodId);
    } else {
      triggerHaptic([20, 30]);
    }
  }, [dismissStartHere, launchMoodSession, mode, selectedMoodId, triggerHaptic]);

  const completeGardenSession = useCallback(() => {
    if (sessionPhase === 'closing' || sessionPhase === 'complete') return;

    const preset = MOOD_SESSION_PRESETS.find((entry) => entry.id === selectedMoodId) ?? MOOD_SESSION_PRESETS[0];
    const session: Ritual = activeGeneratedSession ?? {
      id: `session-${Date.now()}`,
      name: preset.sessionName,
      moodId: preset.id,
      frequencyId: preset.frequencyId,
      hapticId: preset.hapticId,
      chantId: preset.chantId,
      minutes: preset.minutes,
      useSchumann: preset.useSchumann,
      healingMode: preset.healingMode,
      createdAt: new Date().toISOString()
    };

    setSessionPhase('closing');
    setSessionRemainingSeconds(0);
    setCompletedSession(session);
    stopFrequency();
    stopHaptic();
    strikeBell(SOLFEGGIO_FREQUENCIES.find((entry) => entry.id === session.frequencyId)?.hz ?? 528);
    window.setTimeout(() => setSessionPhase('complete'), 4200);
    triggerHaptic([60, 30, 60]);
  }, [activeGeneratedSession, selectedMoodId, sessionPhase, stopFrequency, stopHaptic, strikeBell, triggerHaptic]);

  useEffect(() => {
    if (mode !== 'session' || sessionPhase !== 'running' || sessionRemainingSeconds <= 0) return;

    const id = window.setInterval(() => {
      setSessionRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [mode, sessionPhase, sessionRemainingSeconds]);

  useEffect(() => {
    if (mode === 'session' && sessionPhase === 'running' && sessionRemainingSeconds === 0) {
      completeGardenSession();
    }
  }, [completeGardenSession, mode, sessionPhase, sessionRemainingSeconds]);

  const plantCompletedSession = useCallback(() => {
    const session = completedSession ?? activeGeneratedSession;
    if (!session) return;

    const entry: GardenEntry = {
      id: `garden-${Date.now()}`,
      ritualName: session.name,
      moodId: session.moodId,
      minutes: session.minutes,
      frequencyId: session.frequencyId,
      completedAt: new Date().toISOString()
    };

    setGardenEntries((current) => [entry, ...current].slice(0, 60));
    setActiveGeneratedSession(null);
    setCompletedSession(null);
    setSessionPhase('idle');
    setSessionRemainingSeconds(0);
    setMode('garden');
  }, [activeGeneratedSession, completedSession]);

  const stopAll = useCallback(() => {
    stopFrequency();
    stopHaptic();
    setSessionPhase('idle');
    setSessionRemainingSeconds(0);
    if (isMicActive) {
      toggleMic();
    }
    if (isAudioPlaying) {
      toggleAudioPlayback();
    }
    if (isDroneActive) {
      toggleDrone();
    }
    triggerHaptic(10);
  }, [stopFrequency, stopHaptic, isMicActive, isAudioPlaying, isDroneActive, toggleMic, toggleAudioPlayback, toggleDrone]);

  const stopSession = useCallback(() => {
    stopAll();
    setActiveGeneratedSession(null);
    setCompletedSession(null);
    setIsZenMode(false);
    setMode('home');
  }, [stopAll]);

  const playHandPanNote = useCallback((freq: number) => {
    initAudio();
    if (!audioCtx.current || !analyzer.current || !masterGainNode.current) return;
    
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }

    const now = audioCtx.current.currentTime;
    
    // Primary Tone (Fundamental)
    const osc = audioCtx.current.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    const noteGain = audioCtx.current.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.32, now + 0.018);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    
    // Harmonic Overtones (The "Shimmer")
    const harmonic1 = audioCtx.current.createOscillator();
    harmonic1.type = 'sine';
    harmonic1.frequency.setValueAtTime(freq * 2, now);
    const h1Gain = audioCtx.current.createGain();
    h1Gain.gain.setValueAtTime(0, now);
    h1Gain.gain.linearRampToValueAtTime(0.1, now + 0.018);
    h1Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    const harmonic2 = audioCtx.current.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(freq * 3, now);
    const h2Gain = audioCtx.current.createGain();
    h2Gain.gain.setValueAtTime(0, now);
    h2Gain.gain.linearRampToValueAtTime(0.05, now + 0.024);
    h2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    // Initial Strike (Transient)
    const bufferSize = audioCtx.current.sampleRate * 0.02;
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = audioCtx.current.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = audioCtx.current.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(freq * 4, now);
    
    const noiseGain = audioCtx.current.createGain();
    noiseGain.gain.setValueAtTime(0.026, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    // Resonance Body Simulation
    const resonator = audioCtx.current.createBiquadFilter();
    resonator.type = 'peaking';
    resonator.frequency.setValueAtTime(freq * 1.6, now); // Metallic resonance
    resonator.gain.setValueAtTime(8, now);
    resonator.Q.setValueAtTime(4, now);

    osc.connect(noteGain);
    harmonic1.connect(h1Gain);
    harmonic2.connect(h2Gain);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    
    noteGain.connect(resonator);
    h1Gain.connect(resonator);
    h2Gain.connect(resonator);
    noiseGain.connect(resonator);
    
    resonator.connect(masterGainNode.current);
    resonator.connect(analyzer.current);
    
    osc.start(now);
    harmonic1.start(now);
    harmonic2.start(now);
    noise.start(now);
    
    osc.stop(now + 3.1);
    harmonic1.stop(now + 3.1);
    harmonic2.stop(now + 3.1);
    noise.stop(now + 0.05);

    window.setTimeout(() => {
      [osc, harmonic1, harmonic2, noise, noteGain, h1Gain, h2Gain, noiseFilter, noiseGain, resonator].forEach((node) => {
        try {
          node.disconnect();
        } catch {
          // Already disconnected or ended.
        }
      });
    }, 3400);
  }, [initAudio]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto overflow-x-hidden relative">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 zen-atmosphere" />
        <div className="absolute inset-0 ambient-grid opacity-45" />
      </div>

      {/* Main Container */}
      <main className={cn(
        "glass premium-shell rounded-[36px] overflow-hidden flex flex-row transition-all duration-700 relative",
        (isZenMode || mode === 'session') ? "w-screen h-screen rounded-none fixed inset-0 z-50" : "w-full max-w-7xl h-[95vh] sm:h-[90vh] md:h-[820px] max-h-[960px]"
      )}>
        
        {/* Sidebar Navigation */}
        {mode !== 'session' && (
        <nav className={cn(
          "w-[86px] sm:w-20 bg-black/35 border-r border-white/10 flex flex-col items-center justify-start gap-2 sm:gap-4 p-2 sm:p-4 transition-all duration-500 overflow-y-auto overflow-x-visible no-scrollbar shrink-0",
          isZenMode && "opacity-0 pointer-events-none -translate-x-20"
        )}>
          <div className="w-11 h-11 rounded-2xl bg-black/45 border border-app-gold/25 flex items-center justify-center mb-1 shrink-0">
            <BrandMark size={30} tone="gold" />
          </div>
          <NavButton 
            active={mode === 'home'} 
            onClick={() => setMode('home')} 
            icon={<Sparkles size={24} />} 
            label="Home" 
          />
          <NavButton 
            active={mode === 'garden'} 
            onClick={() => setMode('garden')} 
            icon={<BrandMark tone="sage" />} 
            label="Garden" 
          />
          <NavButton 
            active={mode === 'studio'} 
            onClick={() => {
              setStudioMode('chants');
              setMode('studio');
            }} 
            icon={<LayoutGrid size={24} />} 
            label="Studio" 
          />
          <NavButton 
            active={mode === 'you'} 
            onClick={() => setMode('you')} 
            icon={<User size={24} />} 
            label="You" 
          />
          
           <div className="flex flex-col items-center mt-auto pb-2 sm:pb-4 gap-3 sm:gap-4">
             {(isPlaying || isMicActive || isAudioPlaying || isReferencePlaying || activeHaptic) && (
                <button 
                  onClick={stopAll}
                  className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all border border-red-500/20 group relative"
                  title="Stop All Audio"
                >
                  <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="absolute left-full ml-4 px-2 py-1 bg-black text-[10px] font-mono uppercase tracking-widest text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">Stop All</span>
                </button>
             )}
          </div>
        </nav>
        )}

        {/* Content Area */}
  <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          
          {/* Immersive Background */}
          <AnimatePresence>
            {mode !== 'session' && ((activeFreq && isPlaying) || isMicActive || isAudioPlaying || isReferencePlaying) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${(activeFreq?.color || '#00ff9d')}15 0%, transparent 70%)`
                }}
              >
                {isVisualizerActive && (
                  <SacredGeometry 
                    analyzer={analyzer} 
                    activeColor={activeFreq?.color || '#00ff9d'} 
                    tappingPointIndex={tappingPointIndex}
                    isTappingMode={mode === 'studio' && studioMode === 'tapping'}
                  />
                )}
                <BreathingGuide isPlaying={isPlaying} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          {mode !== 'session' && (
          <header className={cn(
            "p-4 sm:p-6 border-b border-white/5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between transition-all duration-500 z-10",
            isZenMode && "opacity-0 pointer-events-none -translate-y-20"
          )}>
            <div className="hidden sm:flex items-center gap-3">
              <BrandMark size={34} tone="gold" />
              <div>
                <h1 className="text-xl sm:text-2xl font-serif italic tracking-[0.04em]">Focus Flow</h1>
                <p className="text-[8px] sm:text-xs text-app-muted font-mono uppercase tracking-widest">Private Zen Escape</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end overflow-visible pb-1 sm:pb-0">
              <button 
                onClick={(event) => {
                  event.currentTarget.blur();
                  dismissStartHere();
                  setStudioMode('guide');
                  setMode('studio');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-app-muted transition-all shrink-0 hover:bg-white/10 hover:text-app-accent"
              >
                <BookOpen size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Guide</span>
              </button>
              <button 
                onClick={() => {
                  launchMoodSession(selectedMoodId);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0",
                  isPlaying
                    ? "bg-app-accent text-black border-app-accent"
                    : "bg-app-accent/10 border-app-accent/30 text-app-accent hover:bg-app-accent/20"
                )}
              >
                <Zap size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Begin</span>
              </button>
              <button 
                onClick={enterZenMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shrink-0"
              >
                <Maximize2 size={14} className="text-app-accent" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Zen</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Visuals</span>
                <button 
                  onClick={() => setIsVisualizerActive(!isVisualizerActive)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    isVisualizerActive ? "bg-emerald-500" : "bg-white/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                    isVisualizerActive ? "left-4.5" : "left-0.5"
                  )} />
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Earth Hum</span>
                <button 
                  onClick={() => setIsSchumannActive(!isSchumannActive)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    isSchumannActive ? "bg-amber-500" : "bg-white/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                    isSchumannActive ? "left-4.5" : "left-0.5"
                  )} />
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Depth</span>
                <button 
                  onClick={() => setIsHealingMode(!isHealingMode)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    isHealingMode ? "bg-app-accent" : "bg-white/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                    isHealingMode ? "left-4.5" : "left-0.5"
                  )} />
                </button>
              </div>
              {(isPlaying || activeHaptic || isReferencePlaying) && (
                <button 
                  onClick={stopAll}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                >
                  <RotateCcw size={12} /> Stop All
                </button>
              )}
              {audioContextState === 'suspended' && audioCtx.current && (
                <button 
                  onClick={() => {
                    audioCtx.current?.resume();
                    triggerHaptic(50);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-black text-[10px] font-mono uppercase tracking-widest font-bold animate-pulse"
                >
                  <Volume2 size={12} /> Resume Audio
                </button>
              )}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 sm:w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-app-accent"
              />
            </div>
          </header>
          )}

          {/* Zen Mode Exit Button */}
          {isZenMode && mode !== 'session' && (
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsZenMode(false)}
              className="absolute top-8 right-8 z-[60] p-4 rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-white hover:bg-black/60 transition-all group"
            >
              <Minimize2 size={24} />
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Exit Zen Mode</span>
            </motion.button>
          )}

          {/* Zen Mode Overlays */}
          {isZenMode && (
            <div className="absolute inset-0 z-[55] flex flex-col items-center justify-center pointer-events-none">
              <AnimatePresence>
                {mode === 'studio' && studioMode === 'chants' && selectedChant && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center gap-6 text-center max-w-lg px-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-app-accent text-black flex items-center justify-center text-4xl font-mono font-bold shadow-[0_0_50px_rgba(0,255,157,0.3)]">
                      {selectedChant.sound}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-4xl font-serif italic text-white">{selectedChant.label}</h2>
                      <p className="text-lg text-white/60 leading-relaxed">{selectedChant.instruction}</p>
                    </div>
                    {(isMicActive || isReferencePlaying) && (
                      <div className="flex flex-col items-center gap-2 mt-4">
                        <div className="flex items-center gap-2 text-app-accent animate-pulse">
                          {isMicActive ? <Mic size={20} /> : <Volume2 size={20} />}
                          <span className="text-xs font-mono uppercase tracking-widest">
                            {isMicActive ? "Recording..." : "Reference Playing"}
                          </span>
                        </div>
                        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-app-accent"
                            animate={{ width: `${audioVolume * 100}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Dynamic Content */}
          <div className={cn(
            "flex-1 overflow-y-auto p-6 custom-scrollbar transition-all duration-500",
            mode === 'session' && "overflow-hidden p-0",
            isZenMode && mode !== 'session' && "opacity-0 pointer-events-none"
          )}>
            <AnimatePresence mode="wait">
              {mode === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <HomeView
                    selectedMoodId={selectedMoodId}
                    onSelectMood={setSelectedMoodId}
                    onBegin={launchMoodSession}
                    onFeelIt={() => launchMoodSession(selectedMoodId)}
                    lastEntry={gardenEntries[0] ?? null}
                    onAgain={(entry) => {
                      const mood = MOOD_SESSION_PRESETS.find((preset) => preset.id === entry.moodId) ?? MOOD_SESSION_PRESETS[0];
                      launchMoodSession(mood.id);
                    }}
                    onPractice={() => {
                      setStudioMode('chants');
                      setMode('studio');
                    }}
                  />
                </motion.div>
              )}

              {mode === 'session' && (
                <motion.div
                  key="session"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-full"
                >
                  <SessionView
                    analyzer={analyzer}
                    activeFreq={activeFreq}
                    isPlaying={isPlaying}
                    isManualZen={isZenMode}
                    session={activeGeneratedSession}
                    sessionPhase={sessionPhase}
                    remainingSeconds={sessionRemainingSeconds}
                    onStop={stopSession}
                    onPlant={plantCompletedSession}
                    onExitZen={() => setIsZenMode(false)}
                    triggerHaptic={triggerHaptic}
                  />
                </motion.div>
              )}

              {mode === 'garden' && (
                <motion.div
                  key="garden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="min-h-full"
                >
                  <RitualGardenStudioView
                    entries={gardenEntries}
                    rooms={gardenRooms}
                    onRoomsChange={setGardenRooms}
                    placements={gardenPlacements}
                    onPlacementsChange={setGardenPlacements}
                    onReplay={(entry) => launchMoodSession(entry.moodId)}
                    triggerHaptic={triggerHaptic}
                  />
                </motion.div>
              )}

              {mode === 'you' && (
                <motion.div
                  key="you"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="min-h-full"
                >
                  <YouView
                    profile={userProfile}
                    onUpdate={setUserProfile}
                    sessionCount={gardenEntries.length}
                    hasStudio={studio.hasStudio}
                    onOpenStudio={() => {
                      setStudioMode('chants');
                      setMode('studio');
                    }}
                  />
                </motion.div>
              )}

              {mode === 'studio' && (
                <motion.div
                  key="studio"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="min-h-full"
                >
                  <StudioView
                    studioMode={studioMode}
                    onSelectStudioMode={setStudioMode}
                    hasStudio={studio.hasStudio}
                    onUnlock={studio.unlock}
                    onRestore={studio.restore}
                    purchaseError={studio.purchaseError}
                    studioContent={{
                      chants: (
                        <SonicChantView
                          triggerHaptic={triggerHaptic}
                          isMicActive={isMicActive}
                          toggleMic={toggleMic}
                          analyzer={analyzer}
                          uploadedAudioUrl={uploadedAudioUrl}
                          isAudioPlaying={isAudioPlaying}
                          onUpload={handleAudioUpload}
                          onTogglePlayback={toggleAudioPlayback}
                          onRemove={removeUploadedAudio}
                          isReferencePlaying={isReferencePlaying}
                          activeReferenceId={activeReferenceId}
                          onPlayReference={playReferenceTone}
                          isAudioLoading={isAudioLoading}
                          selectedChant={selectedChant}
                          setSelectedChant={setSelectedChant}
                          audioVolume={audioVolume}
                          setIsZenMode={setIsZenMode}
                          isDroneActive={isDroneActive}
                          toggleDrone={toggleDrone}
                          micPitch={micPitch}
                        />
                      ),
                      handpan: (
                        <HandPanView
                          playNote={playHandPanNote}
                          triggerHaptic={triggerHaptic}
                          isRecording={isRecording}
                          recordedUrl={recordedUrl}
                          onStartRecording={startRecording}
                          onStopRecording={stopRecording}
                          onDiscardRecording={() => {
                            if (recordedUrl) URL.revokeObjectURL(recordedUrl);
                            setRecordedUrl(null);
                          }}
                        />
                      ),
                      reiki: <ReikiView />,
                      tapping: (
                        <TappingView
                          triggerHaptic={triggerHaptic}
                          currentIndex={tappingPointIndex}
                          onIndexChange={setTappingPointIndex}
                        />
                      ),
                      guide: <GuideView onStartQuickSession={() => launchMoodSession(selectedMoodId)} onOpenMode={openModeFromStartHere} onOpenNeed={openHomeNeed} />,
                      about: <AboutView />
                    }}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer Status */}
          {mode !== 'session' && (
          <footer className={cn(
            "p-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-app-muted transition-all duration-500",
            isZenMode && "opacity-0 pointer-events-none translate-y-20"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", (isPlaying || activeHaptic) ? "bg-app-accent animate-pulse" : "bg-white/20")} />
              {isPlaying ? `${activeFreq?.hz}Hz playing` : activeHaptic ? activeHaptic.label : ''}
            </div>
          </footer>
          )}
        </div>
      </main>

      {/* Info Tooltip */}
      {mode !== 'session' && (
      <div className={cn(
        "mt-8 max-w-3xl text-app-muted text-xs flex items-start gap-2 opacity-55 hover:opacity-100 transition-all duration-500",
        isZenMode && "opacity-0 pointer-events-none"
      )}>
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>Focus Flow is a tool for rest and attention. It is not medical advice and it does not treat, diagnose, or cure anything. If you have a seizure disorder, a pacemaker, or a hearing condition, check with a clinician first. If anything here makes you feel unwell, stop.</span>
      </div>
      )}
    </div>
  );
}

// --- Sub-Components ---

function SessionView({
  analyzer,
  activeFreq,
  isPlaying,
  isManualZen,
  session,
  sessionPhase,
  remainingSeconds,
  onStop,
  onPlant,
  onExitZen,
  triggerHaptic
}: {
  analyzer: React.RefObject<AnalyserNode | null>;
  activeFreq: Frequency | null;
  isPlaying: boolean;
  isManualZen: boolean;
  session: Ritual | null;
  sessionPhase: SessionPhase;
  remainingSeconds: number;
  onStop: () => void;
  onPlant: () => void;
  onExitZen: () => void;
  triggerHaptic: (p?: number | number[]) => void;
}) {
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const wasInZen = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const totalSeconds = Math.max(1, (session?.minutes ?? 1) * 60);
  const progress = sessionPhase === 'complete' ? 1 : Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds));
  const radius = 148;
  const circumference = 2 * Math.PI * radius;
  const isSessionZen = sessionPhase !== 'complete' && (isManualZen || (sessionPhase === 'running' && now - lastInteraction >= 10000));
  const controlsVisible = !isSessionZen;
  const frequencyColor = activeFreq?.color ?? '#4F8F7A';

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSessionZen && !wasInZen.current) {
      triggerHaptic(10);
    }
    wasInZen.current = isSessionZen;
  }, [isSessionZen, triggerHaptic]);

  const showControls = () => {
    if (isSessionZen) {
      onExitZen();
    }
    setLastInteraction(Date.now());
    setNow(Date.now());
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <section
      className="relative h-full min-h-screen overflow-hidden bg-[#141C19]"
      onPointerDown={showControls}
      onPointerMove={showControls}
      onKeyDown={showControls}
      tabIndex={-1}
    >
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: isSessionZen ? 0.82 : 0.7,
          transitionDuration: shouldReduceMotion ? '0ms' : '600ms',
          background: `radial-gradient(circle at 50% 42%, ${frequencyColor}${isSessionZen ? '2e' : '24'} 0%, transparent 54%), linear-gradient(180deg, #17231f 0%, #101613 100%)`
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: isSessionZen ? 1.07 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
          className="relative w-[min(78vw,540px)] aspect-square"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 360 360" aria-hidden="true">
            <circle cx="180" cy="180" r={radius} fill="none" stroke="rgba(232,239,235,0.08)" strokeWidth="2" />
            <circle
              cx="180"
              cy="180"
              r={radius}
              fill="none"
              stroke={sessionPhase === 'complete' ? '#C59B54' : frequencyColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <SacredGeometry
              analyzer={analyzer}
              activeColor={frequencyColor}
              tappingPointIndex={0}
              isTappingMode={false}
            />
            <BreathingGuide isPlaying={isPlaying && sessionPhase !== 'complete'} />
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : controlsVisible ? 0.3 : 0.6 }}
        className={cn(
          "relative z-10 flex h-full min-h-screen flex-col items-center justify-end px-6 pb-12 text-center",
          !controlsVisible && "pointer-events-none"
        )}
      >
        {sessionPhase !== 'complete' && (
          <button
            onClick={onStop}
            className="absolute left-4 top-5 sm:left-8 sm:top-8 flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-4 py-2 text-white/72 backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
            <span className="text-[10px] font-mono uppercase tracking-widest">Back</span>
          </button>
        )}
        <div className="mb-8 max-w-md">
          <h1 className="text-3xl sm:text-5xl font-serif italic leading-tight">
            {sessionPhase === 'complete' ? 'Bloom ready.' : session?.name ?? activeFreq?.label ?? 'Session'}
          </h1>
          <p className="mt-3 text-sm text-app-muted">
            {sessionPhase === 'settling'
              ? 'Begin with an exhale.'
              : sessionPhase === 'closing'
                ? 'Listen for the bell.'
                : sessionPhase === 'complete'
                  ? 'You finished the session.'
                  : formatTime(remainingSeconds)}
          </p>
        </div>

        {sessionPhase === 'complete' ? (
          <button
            onClick={onPlant}
            className="rounded-full bg-app-gold px-7 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-black premium-button"
          >
            Plant bloom
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition-colors hover:bg-white/14"
            aria-label="Stop session"
          >
            <span className="h-4 w-4 rounded-[3px] bg-current" />
          </button>
        )}
      </motion.div>
    </section>
  );
}

function HomeView({
  selectedMoodId,
  onSelectMood,
  onBegin,
  onFeelIt,
  lastEntry,
  onAgain,
  onPractice
}: {
  selectedMoodId: MoodId;
  onSelectMood: (moodId: MoodId) => void;
  onBegin: (moodId: MoodId) => void;
  onFeelIt: () => void;
  lastEntry: GardenEntry | null;
  onAgain: (entry: GardenEntry) => void;
  onPractice: () => void;
}) {
  const selectedMood = MOOD_SESSION_PRESETS.find((mood) => mood.id === selectedMoodId) ?? MOOD_SESSION_PRESETS[0];
  const haptic = HAPTIC_PATTERNS.find((score) => score.id === selectedMood.hapticId);
  const frequency = SOLFEGGIO_FREQUENCIES.find((entry) => entry.id === selectedMood.frequencyId);
  const chant = selectedMood.chantId ? SONIC_CHANTS.find((entry) => entry.id === selectedMood.chantId) : null;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="max-w-3xl mx-auto py-8 sm:py-14">
      <div className="text-center mb-8">
        <h2 className="text-4xl sm:text-6xl font-serif italic leading-none">What do you need?</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {MOOD_SESSION_PRESETS.map((mood) => {
          const color = moodColor(mood);
          const selected = mood.id === selectedMoodId;
          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood.id)}
              className={cn(
                "min-h-[88px] rounded-2xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-app-accent",
                selected ? "text-white shadow-2xl" : "bg-white/[0.03] border-white/10 text-app-text hover:bg-white/[0.06]"
              )}
              style={{
                borderColor: selected ? color : undefined,
                background: selected ? `linear-gradient(135deg, ${color}, ${color}66)` : undefined
              }}
            >
              <span className="text-base font-medium">{mood.needWord}</span>
            </button>
          );
        })}
      </div>

      <div className="zen-choice-card rounded-[32px] p-6 sm:p-8 mb-5">
        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          <div>
            <h3 className="text-3xl font-serif italic text-white">{selectedMood.sessionName}</h3>
            <p className="text-sm text-white/62 mt-3 max-w-sm mx-auto leading-relaxed">{selectedMood.confirmation}</p>
            <p className="text-sm text-white/52 mt-2">{selectedMood.minutes} minutes, {haptic?.description.toLowerCase() ?? 'a steady pulse'}</p>
          </div>
          <button
            onClick={() => onBegin(selectedMood.id)}
            className="px-7 py-3 rounded-full bg-app-accent text-black font-mono text-[10px] uppercase tracking-widest font-bold premium-button"
          >
            Begin
          </button>
          <button
            onClick={() => setShowDetails((current) => !current)}
            className="text-xs text-app-muted underline-offset-4 hover:text-white hover:underline"
          >
            Details
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid w-full grid-cols-3 gap-2 overflow-hidden text-left"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[10px] text-white/46">Tone</p>
                  <p className="mt-1 text-sm">{frequency?.hz}Hz</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[10px] text-white/46">Pulse</p>
                  <p className="mt-1 truncate text-sm">{haptic?.label}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-[10px] text-white/46">Guide</p>
                  <p className="mt-1 text-sm">{chant?.sound ?? 'Silent'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={onFeelIt} className="rounded-2xl border border-app-accent/30 bg-app-accent/10 p-4 text-left hover:bg-app-accent/15 transition-colors">
          <p className="text-[10px] font-mono uppercase tracking-widest text-app-accent mb-2">Thirty seconds</p>
          <h3 className="text-xl font-serif italic">Feel it</h3>
        </button>
        {lastEntry ? (
          <button onClick={() => onAgain(lastEntry)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.06] transition-colors">
            <p className="text-[10px] font-mono uppercase tracking-widest text-app-muted mb-2">Again</p>
            <h3 className="text-xl font-serif italic">{lastEntry.ritualName}</h3>
          </button>
        ) : (
          <button onClick={onPractice} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.06] transition-colors">
            <p className="text-[10px] font-mono uppercase tracking-widest text-app-muted mb-2">Or</p>
            <h3 className="text-xl font-serif italic">Choose your own tones</h3>
          </button>
        )}
      </div>
    </section>
  );
}

function GardenView({ entries, onBegin }: { entries: GardenEntry[]; onBegin: () => void }) {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const mostMood = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.moodId] = (counts[entry.moodId] ?? 0) + 1;
    return counts;
  }, {});
  const mostMoodId = Object.entries(mostMood).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodId | undefined;
  const mostMoodLabel = MOOD_SESSION_PRESETS.find((mood) => mood.id === mostMoodId)?.label ?? 'None yet';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const visibleEntries = entries.slice(0, 60);

  if (entries.length === 0) {
    return (
      <section className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <BrandMark size={44} tone="gold" className="mx-auto mb-5" />
          <h2 className="text-3xl font-serif italic">Your garden is empty.</h2>
          <p className="text-sm text-app-muted mt-3 mb-6">Every session you finish plants something here.</p>
          <button onClick={onBegin} className="px-7 py-3 rounded-full bg-app-accent text-black font-mono text-[10px] uppercase tracking-widest font-bold">Begin</button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto py-6">
      <div className="mb-5">
        <h2 className="text-4xl font-serif italic">Garden</h2>
      </div>
      <div
        className="premium-card relative min-h-[420px] overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_50%_38%,#233129_0%,#121a17_70%)] p-4 sm:min-h-[560px] sm:p-6"
        role="img"
        aria-label="Your session garden"
      >
        {visibleEntries.map((entry, index) => {
          const seed = Array.from(entry.id).reduce((sum, char) => sum + char.charCodeAt(0), 2166136261);
          const depth = Math.max(0.28, 1 - index / Math.max(visibleEntries.length, 12));
          const x = 8 + Math.abs(seed * 37) % 84;
          const y = 12 + Math.abs(seed * 53) % 72;
          const size = Math.round((74 + Math.sqrt(Math.min(entry.minutes, 30) / 30) * 78) * (0.72 + depth * 0.28));
          const justPlanted = index === 0 && Date.now() - new Date(entry.completedAt).getTime() < 12000;

          return (
            <div
              key={entry.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                zIndex: Math.round(depth * 100),
              }}
            >
              <Bloom entry={entry} size={size} depth={depth} opening={justPlanted} />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-app-muted mt-4 text-center">
        {entries.length} sessions · {hours ? `${hours} hours ` : ''}{minutes} minutes · most often, {mostMoodLabel}
      </p>
    </section>
  );
}

function YouView({
  profile,
  onUpdate,
  sessionCount,
  hasStudio,
  onOpenStudio
}: {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  sessionCount: number;
  hasStudio: boolean;
  onOpenStudio: () => void;
}) {
  const studioRevealed = sessionCount >= 3 || hasStudio;

  return (
    <section className="max-w-3xl mx-auto py-8 space-y-5">
      <ProfileView profile={profile} onUpdate={onUpdate} triggerHaptic={() => {}} />
      {studioRevealed && (
        <button onClick={onOpenStudio} className="w-full premium-card rounded-[28px] p-5 text-left">
          <p className="relative z-10 text-[10px] font-mono uppercase tracking-widest text-app-muted mb-2">Studio</p>
          <h3 className="relative z-10 text-2xl font-serif italic">A quieter room</h3>
        </button>
      )}
    </section>
  );
}

function StudioUnlockCard({ hasStudio, onUnlock, onRestore }: { hasStudio: boolean; onUnlock: () => void; onRestore: () => void }) {
  if (hasStudio) return null;

  return (
    <div className="relative z-20 mx-auto w-full max-w-md rounded-[32px] border border-app-gold/20 bg-[#111815]/95 p-6 text-center shadow-[0_32px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <h3 className="text-3xl font-serif italic leading-tight">No subscription. Not now, not later.</h3>
      <p className="mt-2 text-lg font-serif italic text-white/82">You buy it once and it is yours.</p>

      <div className="mt-6 space-y-2 text-sm text-app-muted">
        <p>Arrange your garden into rooms</p>
        <p>Chants and pitch-guided voice</p>
        <p>Handpan and reiki practices</p>
        <p>Custom rituals you build yourself</p>
      </div>

      <p className="mt-7 text-3xl font-serif italic text-app-gold">$19.99</p>

      <button
        onClick={onUnlock}
        className="mt-5 w-full rounded-full bg-app-gold px-7 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-black premium-button"
      >
        Unlock Studio
      </button>
      <button
        onClick={onRestore}
        className="mt-4 text-[11px] text-app-muted underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        Restore purchases
      </button>
    </div>
  );
}

function StudioView({
  studioMode,
  onSelectStudioMode,
  hasStudio,
  onUnlock,
  onRestore,
  purchaseError,
  studioContent
}: {
  studioMode: StudioMode;
  onSelectStudioMode: (mode: StudioMode) => void;
  hasStudio: boolean;
  onUnlock: () => void;
  onRestore: () => void;
  purchaseError: string;
  studioContent: Record<StudioMode, React.ReactNode>;
}) {
  const modes: Array<{ id: StudioMode; label: string }> = [
    { id: 'chants', label: 'Chants' },
    { id: 'handpan', label: 'Handpan' },
    { id: 'reiki', label: 'Reiki' },
    { id: 'tapping', label: 'Tapping' },
    { id: 'guide', label: 'Guide' },
    { id: 'about', label: 'About' }
  ];
  const studioLocked = !hasStudio && !FREE_STUDIO_MODES.includes(studioMode);

  return (
    <section className="relative min-h-full flex flex-col gap-5 pb-20">
      <div className="flex flex-wrap gap-2 shrink-0">
        {modes.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectStudioMode(item.id)}
            className={cn("px-4 py-2 rounded-full border text-xs", studioMode === item.id ? "bg-app-accent text-black border-app-accent" : "border-white/10 text-app-muted")}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 transition-all duration-500",
          studioLocked && "pointer-events-none select-none opacity-38 blur-[1px]"
        )}
        aria-hidden={studioLocked}
      >
        {studioContent[studioMode]}
      </div>
      {studioLocked && (
        <div className="absolute inset-x-0 top-16 z-10 flex justify-center px-2 sm:px-4">
          <div className="absolute inset-x-0 top-0 h-[calc(100vh-180px)] bg-[#0c1411]/35 backdrop-blur-[2px]" />
          <StudioUnlockCard hasStudio={hasStudio} onUnlock={onUnlock} onRestore={onRestore} />
          <div className="absolute top-full mt-3 w-full max-w-md text-center">
          {purchaseError && (
            <p className="text-xs text-app-gold/80 leading-relaxed">{purchaseError}</p>
          )}
          </div>
        </div>
      )}
    </section>
  );
}

const GARDEN_TONE_COLORS: Record<string, [string, string]> = {
  '174': ['#8C5B54', '#3A2320'],
  '285': ['#B0764A', '#402A18'],
  '396': ['#A65A4E', '#38201C'],
  '417': ['#C68B5A', '#45301C'],
  '528': ['#C59B54', '#45361A'],
  '639': ['#4F8F7A', '#1E3A31'],
  '741': ['#5E8AA6', '#22364A'],
  '852': ['#6B6FA6', '#262845'],
  '963': ['#8A6FA0', '#322542'],
};

function gardenHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function elementTypeForMood(moodId: MoodId): GardenElementType {
  const map: Record<MoodId, GardenElementType> = {
    anxious: 'stone',
    tense: 'sandRipple',
    blocked: 'waterLine',
    scattered: 'lantern',
    tired: 'bamboo',
    focused: 'lotus',
  };
  return map[moodId] ?? 'stone';
}

function GardenElementArt({ entry, size = 96 }: { entry: GardenEntry; size?: number }) {
  const type = elementTypeForMood(entry.moodId);
  const seed = gardenHash(entry.id);
  const [light, deep] = GARDEN_TONE_COLORS[entry.frequencyId] ?? GARDEN_TONE_COLORS['528'];
  const grown = 0.78 + 0.28 * Math.sqrt(Math.min(entry.minutes, 30) / 30);

  if (type === 'lotus') {
    return <Bloom entry={entry} size={size} depth={1} />;
  }

  if (type === 'stone') {
    const points = Array.from({ length: 7 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 7;
      const jitter = 0.72 + ((seed >> (i * 2)) % 20) / 100;
      const x = size / 2 + Math.cos(angle) * size * 0.34 * jitter * grown;
      const y = size / 2 + Math.sin(angle) * size * 0.27 * jitter * grown;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <polygon points={points} fill={deep} opacity="0.92" />
        <polygon points={points} fill={`url(#stone-${entry.id})`} opacity="0.85" />
        <defs>
          <linearGradient id={`stone-${entry.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={light} stopOpacity="0.62" />
            <stop offset="100%" stopColor={deep} stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (type === 'sandRipple') {
    const arcs = 3 + (seed % 3);
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {Array.from({ length: arcs }, (_, i) => {
          const r = size * (0.18 + i * 0.1) * grown;
          return (
            <path
              key={i}
              d={`M ${(size / 2 - r).toFixed(1)} ${(size / 2 + i * 3).toFixed(1)} Q ${size / 2} ${(size / 2 - r * 0.46).toFixed(1)} ${(size / 2 + r).toFixed(1)} ${(size / 2 + i * 3).toFixed(1)}`}
              fill="none"
              stroke={light}
              strokeWidth="2"
              opacity={0.28 + i * 0.08}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  if (type === 'waterLine') {
    const amp = 8 + (seed % 9);
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <path
          d={`M ${size * 0.08} ${size * 0.58} C ${size * 0.26} ${size * 0.58 - amp}, ${size * 0.36} ${size * 0.58 + amp}, ${size * 0.52} ${size * 0.58} S ${size * 0.78} ${size * 0.58 - amp}, ${size * 0.92} ${size * 0.58}`}
          fill="none"
          stroke={light}
          strokeWidth="3"
          opacity="0.78"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'lantern') {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <path d={`M ${size * 0.34} ${size * 0.2} H ${size * 0.66} L ${size * 0.72} ${size * 0.72} H ${size * 0.28} Z`} fill={deep} />
        <rect x={size * 0.38} y={size * 0.34} width={size * 0.24} height={size * 0.28} rx="6" fill="#F0C36A" opacity="0.9" />
        <circle cx={size / 2} cy={size * 0.48} r={size * 0.22} fill="#F0C36A" opacity="0.16" />
        <path d={`M ${size * 0.37} ${size * 0.18} Q ${size / 2} ${size * 0.08} ${size * 0.63} ${size * 0.18}`} fill="none" stroke={light} strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {Array.from({ length: 3 + (seed % 4) }, (_, i) => {
        const x = size * (0.28 + i * 0.12);
        const h = size * (0.42 + ((seed >> i) % 22) / 100) * grown;
        return (
          <g key={i}>
            <path d={`M ${x} ${size * 0.82} V ${(size * 0.82 - h).toFixed(1)}`} stroke={light} strokeWidth="5" strokeLinecap="round" />
            {[0.28, 0.48, 0.68].map((t) => (
              <path key={t} d={`M ${x - 5} ${(size * 0.82 - h * t).toFixed(1)} H ${x + 5}`} stroke={deep} strokeWidth="2" opacity="0.7" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

type SandRock = { x: number; y: number; r: number; seed: number };

function InteractiveSandGarden({
  triggerHaptic,
  activeRoom,
  entries,
  placements,
  onPlacementsChange,
  onReplay,
}: {
  triggerHaptic: (p?: number | number[]) => void;
  activeRoom: GardenRoom;
  entries: GardenEntry[];
  placements: Record<string, ElementPlacement | null>;
  onPlacementsChange: React.Dispatch<React.SetStateAction<Record<string, ElementPlacement | null>>>;
  onReplay: (entry: GardenEntry) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rocksRef = useRef<SandRock[]>([]);
  const historyRef = useRef<Array<{ image: ImageData; rocks: SandRock[] }>>([]);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<SandTool>('rake');
  const [canUndo, setCanUndo] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number; visible: boolean; blocked: boolean }>({ x: 0, y: 0, visible: false, blocked: false });
  const roomEntries = entries.filter((entry) => placements[entry.id]?.roomId === activeRoom.id);
  const trayEntries = entries.filter((entry) => !placements[entry.id]);
  const toolCopy = GARDEN_TOOL_COPY[activeRoom.backdrop];

  const getContext = () => canvasRef.current?.getContext('2d') ?? null;

  const drawSand = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#e8d8b2';
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * .22, h * .08, 0, w * .22, h * .08, Math.max(w, h) * .82);
    glow.addColorStop(0, 'rgba(255,248,218,.48)');
    glow.addColorStop(1, 'rgba(168,137,79,.08)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < Math.floor(w * h / 115); i += 1) {
      const x = (Math.sin(i * 91.7) * .5 + .5) * w;
      const y = (Math.sin(i * 47.3 + 2) * .5 + .5) * h;
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.09)' : 'rgba(99,72,30,.07)';
      ctx.fillRect(x, y, 1, 1);
    }
    rocksRef.current = [];
    historyRef.current = [];
    setCanUndo(false);
    const saved = getStoredValue(`focusflow_sand_${activeRoom.id}`);
    if (saved) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, w, h);
      image.src = saved;
    }
  }, [activeRoom.id]);

  useEffect(() => {
    drawSand();
    const observer = new ResizeObserver(drawSand);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [drawSand]);

  const pos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const nearRock = (x: number, y: number, pad = 0) => rocksRef.current.some((rock) => Math.hypot(x - rock.x, y - rock.y) < rock.r + 25 + pad);

  const remember = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    historyRef.current.push({
      image: ctx.getImageData(0, 0, canvas.width, canvas.height),
      rocks: rocksRef.current.map((rock) => ({ ...rock })),
    });
    if (historyRef.current.length > 16) historyRef.current.shift();
    setCanUndo(true);
  };

  const drawPrimaryLine = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = getContext();
    if (!ctx) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    if (distance < .5) return;
    const nx = -dy / distance;
    const ny = dx / distance;
    ctx.lineCap = 'round';
    if (activeRoom.backdrop === 'water') {
      for (let i = 0; i < 3; i += 1) {
        const offset = (i - 1) * 7;
        const wave = Math.sin((a.x + b.x + i * 41) * 0.015) * 5;
        const x0 = a.x + nx * offset;
        const y0 = a.y + ny * offset;
        const x1 = b.x + nx * offset;
        const y1 = b.y + ny * offset;
        if (nearRock(x0, y0) || nearRock(x1, y1)) continue;
        ctx.strokeStyle = i === 1 ? 'rgba(227,247,244,.48)' : 'rgba(86,146,158,.28)';
        ctx.lineWidth = i === 1 ? 1.8 : 1.1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo((x0 + x1) / 2 + nx * wave, (y0 + y1) / 2 + ny * wave, x1, y1);
        ctx.stroke();
      }
      return;
    }

    const dark = activeRoom.backdrop === 'moss'
      ? 'rgba(24,54,31,.34)'
      : activeRoom.backdrop === 'stone'
        ? 'rgba(48,52,49,.32)'
        : 'rgba(91,66,28,.29)';
    const light = activeRoom.backdrop === 'moss'
      ? 'rgba(164,184,112,.32)'
      : activeRoom.backdrop === 'stone'
        ? 'rgba(224,226,218,.24)'
        : 'rgba(255,250,226,.58)';
    const count = activeRoom.backdrop === 'stone' ? 3 : 6;
    for (let i = 0; i < 6; i += 1) {
      if (i >= count) continue;
      const offset = (i - (count - 1) / 2) * (activeRoom.backdrop === 'stone' ? 6.5 : 4.3);
      const x0 = a.x + nx * offset;
      const y0 = a.y + ny * offset;
      const x1 = b.x + nx * offset;
      const y1 = b.y + ny * offset;
      if (nearRock(x0, y0) || nearRock(x1, y1)) continue;
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0 + .8, y0 + .8); ctx.lineTo(x1 + .8, y1 + .8); ctx.stroke();
      ctx.strokeStyle = light;
      ctx.beginPath(); ctx.moveTo(x0 - .8, y0 - .8); ctx.lineTo(x1 - .8, y1 - .8); ctx.stroke();
    }
  };

  const smoothAt = (x: number, y: number) => {
    if (nearRock(x, y, -8)) return;
    const ctx = getContext();
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(x, y, 1, x, y, 34);
    const fill = activeRoom.backdrop === 'water'
      ? 'rgba(172,210,208,.5)'
      : activeRoom.backdrop === 'moss'
        ? 'rgba(69,99,58,.58)'
        : activeRoom.backdrop === 'stone'
          ? 'rgba(120,124,116,.4)'
          : 'rgba(232,216,178,.96)';
    const fade = activeRoom.backdrop === 'water'
      ? 'rgba(172,210,208,0)'
      : activeRoom.backdrop === 'moss'
        ? 'rgba(69,99,58,0)'
        : activeRoom.backdrop === 'stone'
          ? 'rgba(120,124,116,0)'
          : 'rgba(232,216,178,0)';
    gradient.addColorStop(0, fill);
    gradient.addColorStop(1, fade);
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill();
  };

  const placeRock = (x: number, y: number) => {
    if (nearRock(x, y, 9)) return false;
    const ctx = getContext();
    if (!ctx) return false;
    const seed = Math.random() * Math.PI * 2;
    const r = 15 + Math.random() * 8;
    rocksRef.current.push({ x, y, r, seed });
    ctx.save();
    ctx.translate(x, y);
    for (let ring = 3; ring >= 1; ring -= 1) {
      ctx.beginPath(); ctx.ellipse(0, 2, r + ring * 9, (r + ring * 9) * .76, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(91,66,28,${.08 + ring * .035})`; ctx.lineWidth = 1.2; ctx.stroke();
    }
    ctx.shadowColor = 'rgba(44,30,12,.38)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 5;
    ctx.beginPath();
    for (let i = 0; i <= 9; i += 1) {
      const angle = i / 9 * Math.PI * 2;
      const rr = r * (.86 + Math.sin(seed + i * 2.4) * .09);
      const px = Math.cos(angle) * rr;
      const py = Math.sin(angle) * rr * .82;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const stone = ctx.createLinearGradient(-r, -r, r, r);
    stone.addColorStop(0, '#b7b0a0'); stone.addColorStop(.45, '#817c72'); stone.addColorStop(1, '#514e49');
    ctx.fillStyle = stone; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.ellipse(-r * .28, -r * .3, r * .25, r * .12, -.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.24)'; ctx.fill();
    ctx.restore();
    return true;
  };

  const undo = () => {
    const ctx = getContext();
    const previous = historyRef.current.pop();
    if (!ctx || !previous) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(previous.image, 0, 0); ctx.restore();
    rocksRef.current = previous.rocks;
    setCanUndo(historyRef.current.length > 0);
  };

  const chooseTool = (next: SandTool) => {
    setTool(next);
    triggerHaptic(10);
  };

  const saveSand = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try { setStoredValue(`focusflow_sand_${activeRoom.id}`, canvas.toDataURL('image/jpeg', .78)); } catch { /* device storage is optional */ }
  };

  const placeEntry = (entryId: string, clientX: number, clientY: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(.93, Math.max(.07, (clientX - rect.left) / rect.width));
    const y = Math.min(.9, Math.max(.1, (clientY - rect.top) / rect.height));
    const seed = gardenHash(`${entryId}-${activeRoom.id}`);
    onPlacementsChange((current) => ({
      ...current,
      [entryId]: { roomId: activeRoom.id, x, y, rotation: (seed % 17) - 8, scale: current[entryId]?.scale ?? 1 },
    }));
    triggerHaptic(20);
  };

  const toolButton = (id: SandTool, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => chooseTool(id)}
      aria-pressed={tool === id}
      className={cn('sand-tool', tool === id && 'is-active')}
    >
      {icon}<span>{label}</span>
    </button>
  );

  return (
    <section aria-labelledby="play-garden-title" className="sand-garden-shell">
      <div className="sand-garden-heading">
        <div>
          <p className="sand-eyebrow">{activeRoom.name} garden</p>
          <h2 id="play-garden-title">Your practice, growing</h2>
          <p>Every completed session leaves something meaningful behind.</p>
        </div>
        <span className="sand-free-badge"><Sparkles size={12} /> Free for everyone</span>
      </div>

      <div className="sand-toolbar" role="toolbar" aria-label="Garden tools">
        <div className="sand-tool-group">
          {toolButton('rake', toolCopy.labels.rake, <Waves size={17} />)}
          {toolButton('stone', toolCopy.labels.stone, <span className="sand-stone-icon" aria-hidden="true" />)}
          {toolButton('smooth', toolCopy.labels.smooth, <span className="sand-smooth-icon" aria-hidden="true" />)}
        </div>
        <div className="sand-tool-group sand-actions">
          <button type="button" className="sand-icon-button" disabled={!canUndo} onClick={undo} aria-label="Undo last change" title="Undo"><ArrowLeft size={17} /></button>
          <button type="button" className="sand-reset" onClick={() => { setStoredValue(`focusflow_sand_${activeRoom.id}`, ''); drawSand(); triggerHaptic(18); }}><RotateCcw size={15} /> {toolCopy.resetLabel}</button>
        </div>
      </div>

      <div className="sand-wood-frame">
        <div
          ref={wrapRef}
          className={cn('sand-canvas-wrap', `room-${activeRoom.id}`, `ground-${activeRoom.backdrop}`, `air-${activeRoom.ambientId}`)}
          onPointerLeave={() => setCursor((current) => ({ ...current, visible: false }))}
          onPointerMove={(event) => { if (dragId) placeEntry(dragId, event.clientX, event.clientY); }}
          onPointerUp={(event) => { if (dragId) { placeEntry(dragId, event.clientX, event.clientY); setDragId(null); } }}
        >
          <canvas
            ref={canvasRef}
            aria-label="Interactive sand garden. Select a tool above, then drag or tap in the sand."
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              const point = pos(event);
              remember();
              if (tool === 'stone') {
                if (placeRock(point.x, point.y)) triggerHaptic(22);
                else historyRef.current.pop();
                setCanUndo(historyRef.current.length > 0);
                return;
              }
              drawingRef.current = true;
              lastRef.current = point;
              if (tool === 'smooth') smoothAt(point.x, point.y);
            }}
            onPointerMove={(event) => {
              const point = pos(event);
              setCursor({ ...point, visible: event.pointerType === 'mouse', blocked: tool === 'stone' && nearRock(point.x, point.y, 9) });
              if (!drawingRef.current || !lastRef.current) return;
              if (tool === 'rake') drawPrimaryLine(lastRef.current, point); else smoothAt(point.x, point.y);
              lastRef.current = point;
            }}
            onPointerUp={() => { drawingRef.current = false; lastRef.current = null; saveSand(); triggerHaptic(8); }}
            onPointerCancel={() => { drawingRef.current = false; lastRef.current = null; }}
          />
          <div className="sand-ground-wash" aria-hidden="true" />
          <div className="sand-room-atmosphere" aria-hidden="true">
            <i className="sand-atmosphere-light" />
            <i className="sand-atmosphere-ripple ripple-one" />
            <i className="sand-atmosphere-ripple ripple-two" />
            <i className="sand-atmosphere-ripple ripple-three" />
            <i className="sand-atmosphere-ripple ripple-four" />
            <i className="sand-atmosphere-leaf leaf-one" />
            <i className="sand-atmosphere-leaf leaf-two" />
            <i className="sand-atmosphere-leaf leaf-three" />
          </div>
          {roomEntries.map((entry) => {
            const placement = placements[entry.id];
            if (!placement) return null;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onReplay(entry)}
                onPointerDown={(event) => { event.stopPropagation(); setDragId(entry.id); }}
                className="sand-earned-element"
                style={{ left: `${placement.x * 100}%`, top: `${placement.y * 100}%`, transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})` }}
                title={`${entry.ritualName} — tap to repeat this session`}
              >
                <GardenElementArt entry={entry} size={96} />
              </button>
            );
          })}
          <div
            aria-hidden="true"
            className={cn('sand-cursor', `is-${tool}`, cursor.blocked && 'is-blocked')}
            style={{ left: cursor.x, top: cursor.y, opacity: cursor.visible ? 1 : 0 }}
          />
          <div className="sand-vignette" aria-hidden="true" />
        </div>
      </div>
      <div className="sand-growth-tray">
        <div className="sand-tray-heading">
          <div><span>Your growth tray</span><strong>{trayEntries.length}</strong></div>
          <p>Complete a session to grow a new element, then place it in your garden.</p>
        </div>
        <div className="sand-tray-items">
          {trayEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onPointerDown={() => setDragId(entry.id)}
              onClick={() => {
                const rect = wrapRef.current?.getBoundingClientRect();
                if (rect) placeEntry(entry.id, rect.left + rect.width * .5, rect.top + rect.height * .55);
              }}
              className="sand-tray-item"
            >
              <GardenElementArt entry={entry} size={62} />
              <span>{MOOD_SESSION_PRESETS.find((mood) => mood.id === entry.moodId)?.needWord ?? 'Practice'}</span>
              <small>{entry.minutes} min</small>
            </button>
          ))}
          {trayEntries.length === 0 && (
            <div className="sand-empty-tray"><Sparkles size={18} /><span>Your next completed session will grow here.</span></div>
          )}
        </div>
      </div>
      <p className="sand-instruction">
        {toolCopy.instructions[tool]}
      </p>
    </section>
  );
}

function RitualGardenStudioView({
  entries,
  rooms,
  onRoomsChange,
  placements,
  onPlacementsChange,
  onReplay,
  triggerHaptic,
}: {
  entries: GardenEntry[];
  rooms: GardenRoom[];
  onRoomsChange: (rooms: GardenRoom[]) => void;
  placements: Record<string, ElementPlacement | null>;
  onPlacementsChange: React.Dispatch<React.SetStateAction<Record<string, ElementPlacement | null>>>;
  onReplay: (entry: GardenEntry) => void;
  triggerHaptic: (p?: number | number[]) => void;
}) {
  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id ?? DEFAULT_GARDEN_ROOMS[0].id);
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? rooms[0] ?? DEFAULT_GARDEN_ROOMS[0];

  const cycleRoomBackdrop = () => {
    onRoomsChange(rooms.map((room) => room.id === activeRoom.id
      ? { ...room, backdrop: GARDEN_BACKDROPS[(GARDEN_BACKDROPS.indexOf(room.backdrop) + 1) % GARDEN_BACKDROPS.length] }
      : room));
  };

  const cycleRoomAmbient = () => {
    onRoomsChange(rooms.map((room) => room.id === activeRoom.id
      ? { ...room, ambientId: GARDEN_AMBIENTS[(GARDEN_AMBIENTS.indexOf(room.ambientId) + 1) % GARDEN_AMBIENTS.length] }
      : room));
  };

  return (
    <div className="min-h-full flex flex-col gap-4 pb-20">
      <div className="garden-room-switcher">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoomId(room.id)}
            className={cn("rounded-full border px-4 py-2 text-[10px] font-mono uppercase tracking-widest", activeRoom.id === room.id ? "border-app-gold bg-app-gold text-black" : "border-white/10 text-app-muted")}
          >
            {room.name || 'Untitled'}
          </button>
        ))}
        <button onClick={cycleRoomBackdrop} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-app-muted">Ground: {GARDEN_BACKDROP_LABELS[activeRoom.backdrop]}</button>
        <button onClick={cycleRoomAmbient} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-app-muted">Air: {GARDEN_AMBIENT_LABELS[activeRoom.ambientId]}</button>
      </div>
      <InteractiveSandGarden
        triggerHaptic={triggerHaptic}
        activeRoom={activeRoom}
        entries={entries}
        placements={placements}
        onPlacementsChange={onPlacementsChange}
        onReplay={onReplay}
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      className={cn(
        "zen-nav-button flex flex-col items-center gap-1.5 transition-all duration-300 group w-full cursor-pointer outline-none py-1",
        active ? "text-app-accent" : "text-app-muted hover:text-white"
      )}
    >
      <div className={cn(
        "p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all",
        active ? "bg-app-accent/10 shadow-[0_0_20px_rgba(0,255,157,0.1)] scale-105 sm:scale-110" : "bg-transparent group-hover:bg-white/5"
      )}>
        {React.cloneElement(icon as React.ReactElement, { size: 20, className: "sm:w-6 sm:h-6 w-5 h-5 transition-transform group-active:scale-90" } as any)}
      </div>
      <span className={cn(
        "text-[8px] sm:text-[10px] leading-tight text-center font-mono uppercase tracking-tight font-medium transition-opacity whitespace-normal max-w-[72px] sm:max-w-none px-1",
        active ? "opacity-100" : "opacity-60"
      )}>{label}</span>
    </button>
  );
}

function FrequencyCard({ freq, isActive, isPreferred, onSetPreferred, onClick }: { 
  freq: Frequency, 
  isActive: boolean, 
  isPreferred: boolean,
  onSetPreferred: () => void,
  onClick: () => void 
}) {
  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 border group relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50",
        isActive 
          ? "border-app-accent/30 shadow-[0_0_30px_rgba(0,255,157,0.05)]" 
          : "bg-white/[0.02] border-white/5 hover:border-white/20"
      )}
      style={{
        backgroundColor: isActive ? `${freq.secondaryColor}40` : undefined
      }}
    >
      {isActive && (
        <motion.div 
          layoutId="active-glow-freq"
          className="absolute inset-0 bg-gradient-to-br from-app-accent/10 to-transparent pointer-events-none"
        />
      )}
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-mono font-medium tracking-tighter" style={{ color: isActive ? 'var(--color-app-accent)' : freq.color }}>
              {freq.hz}
              <span className="text-[10px] sm:text-xs ml-1 opacity-50">Hz</span>
            </span>
            {isPreferred && (
              <div className="px-1.5 py-0.5 rounded-md bg-app-accent/20 border border-app-accent/30 flex items-center gap-1">
                <CheckCircle2 size={8} className="text-app-accent" />
                <span className="text-[6px] font-mono uppercase tracking-widest text-app-accent">Preferred</span>
              </div>
            )}
          </div>
          {freq.chakra && (
            <span className="text-[8px] font-mono uppercase tracking-widest opacity-40 mt-0.5">{freq.chakra}</span>
          )}
          {isActive && (
            <div className="flex items-center gap-1 mt-1">
              <Zap size={8} className="text-app-accent" />
              <span className="text-[7px] font-mono uppercase tracking-widest text-app-accent/80">Calibrated</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPreferred && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSetPreferred();
              }}
              className="p-1.5 rounded-lg bg-white/5 text-app-muted hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Set as Preferred"
            >
              <Save size={12} />
            </button>
          )}
          {isActive ? (
            <div className="flex items-center gap-1 h-4">
              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-app-accent rounded-full" />
              <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1 bg-app-accent rounded-full" />
              <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 bg-app-accent rounded-full" />
            </div>
          ) : (
            <Play size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      <h3 className="font-serif italic text-base sm:text-lg mb-0.5 sm:mb-1">{freq.label}</h3>
      <p className="text-[10px] sm:text-xs text-app-muted leading-tight">{freq.description}</p>
    </div>
  );
}

function HapticCard({ haptic, isActive, isPreferred, onSetPreferred, onClick }: { 
  haptic: HapticPattern, 
  isActive: boolean, 
  isPreferred: boolean,
  onSetPreferred: () => void,
  onClick: () => void 
}) {
  const totalDuration = (haptic.loopMs ?? Math.max(...haptic.events.map((event) => event.at + event.duration), 1000)) / 1000;
  const times = haptic.events.flatMap((event) => [event.at / (haptic.loopMs ?? 1000), (event.at + event.duration) / (haptic.loopMs ?? 1000)]).filter((time) => time <= 1);
  const values = haptic.events.flatMap(() => [1, 0]);

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "p-6 rounded-2xl text-left transition-all duration-500 border group relative overflow-hidden flex flex-col justify-between h-44 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-app-accent/50",
        isActive 
          ? "bg-app-accent/10 border-app-accent/50 shadow-[0_0_40px_rgba(0,255,157,0.1)]" 
          : "bg-white/[0.02] border-white/5 hover:border-white/20"
      )}
    >
      {isActive && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: values,
            }}
            transition={{ 
              duration: totalDuration, 
              times: times, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-app-accent/5 pointer-events-none"
          />
          <motion.div 
            layoutId="active-glow-haptic"
            className="absolute inset-0 bg-gradient-to-br from-app-accent/20 to-transparent pointer-events-none"
          />
        </>
      )}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5" style={{ color: haptic.color }}>
            <Waves size={20} />
          </div>
          {isPreferred && (
            <div className="px-1.5 py-0.5 rounded-md bg-app-accent/20 border border-app-accent/30 flex items-center gap-1">
              <CheckCircle2 size={8} className="text-app-accent" />
              <span className="text-[6px] font-mono uppercase tracking-widest text-app-accent">Preferred</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPreferred && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSetPreferred();
              }}
              className="p-1.5 rounded-lg bg-white/5 text-app-muted hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Set as Preferred"
            >
              <Save size={12} />
            </button>
          )}
          {isActive ? (
            <div className="flex gap-1.5 items-end h-6">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    height: values.map(v => v === 1 ? (8 + i * 4) : 4),
                    opacity: values
                  }} 
                  transition={{ 
                    duration: totalDuration, 
                    times: times, 
                    repeat: Infinity,
                    ease: "linear"
                  }} 
                  className="w-1.5 bg-app-accent rounded-full" 
                />
              ))}
            </div>
          ) : (
            <Play size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="font-serif italic text-xl mb-1">{haptic.label}</h3>
        <p className="text-xs text-app-muted leading-tight mb-4">{haptic.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-app-accent/40 uppercase tracking-widest">
            {isActive ? 'Pattern Active' : 'Ready'}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if ('vibrate' in navigator) {
                const pattern = haptic.events.flatMap((event, index, events) => {
                  const previousEnd = index === 0 ? 0 : events[index - 1].at + events[index - 1].duration;
                  return [Math.max(0, event.at - previousEnd), event.duration];
                });
                navigator.vibrate(pattern);
              }
            }}
            className="text-[10px] font-mono uppercase tracking-widest text-app-accent/60 hover:text-app-accent transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md"
          >
            <Fingerprint size={10} /> Test
          </button>
        </div>
      </div>
    </div>
  );
}

function TappingView({ 
  triggerHaptic, 
  currentIndex, 
  onIndexChange 
}: { 
  triggerHaptic: (p?: number | number[]) => void,
  currentIndex: number,
  onIndexChange: (index: number) => void
}) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const currentPoint = TAPPING_POINTS[currentIndex];

  const AFFIRMATIONS = [
    "I release all stress and tension.",
    "I am safe and grounded.",
    "I choose to let go of what no longer serves me.",
    "I am open to healing and peace.",
    "I trust the process of life.",
    "I am worthy of love and happiness.",
    "I am becoming the best version of myself.",
    "I am calm, centered, and focused.",
    "I am at peace with my past and present."
  ];

  const next = useCallback(() => {
    onIndexChange((currentIndex + 1) % TAPPING_POINTS.length);
    triggerHaptic(40);
    setProgress(0);
  }, [triggerHaptic, currentIndex, onIndexChange]);

  const prev = useCallback(() => {
    onIndexChange((currentIndex - 1 + TAPPING_POINTS.length) % TAPPING_POINTS.length);
    triggerHaptic(40);
    setProgress(0);
  }, [triggerHaptic, currentIndex, onIndexChange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            next();
            return 0;
          }
          return prev + 1;
        });
      }, 70); // ~7 seconds per point
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, next]);

  return (
    <div className="min-h-full flex flex-col items-center justify-start sm:justify-center gap-4 sm:gap-8 px-1 pb-24 sm:pb-12 select-none">
      <div className="text-center max-w-sm px-4">
        <h2 className="text-xl sm:text-3xl font-serif italic mb-1 sm:mb-2">Guided Tapping</h2>
        <p className="text-[10px] sm:text-sm text-app-muted">Tap gently on the indicated point while repeating the affirmation below.</p>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-md px-4">
        <button onClick={prev} className="absolute left-2 sm:left-0 p-2 sm:p-4 text-app-muted hover:text-white transition-colors z-10">
          <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
        </button>

        <div className="flex flex-col items-center">
          <div className="relative">
            <motion.div 
              key={currentPoint.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-40 h-40 sm:w-56 sm:h-56 rounded-full border-2 border-app-accent/20 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 rounded-full border border-app-accent/40 tapping-pulse" />
              <Fingerprint size={48} className="sm:w-16 sm:h-16 text-app-accent opacity-80" />
              
              {/* Progress Ring */}
              {isAutoPlaying && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle 
                    cx="80" cy="80" r="78" 
                    fill="none" stroke="currentColor" 
                    strokeWidth="2" className="text-app-accent/20 sm:hidden" 
                  />
                  <circle 
                    cx="112" cy="112" r="110" 
                    fill="none" stroke="currentColor" 
                    strokeWidth="2" className="text-app-accent/20 hidden sm:block" 
                  />
                  <motion.circle 
                    cx="80" cy="80" r="78" 
                    fill="none" stroke="currentColor" 
                    strokeWidth="3" 
                    className="text-app-accent sm:hidden"
                    strokeDasharray={2 * Math.PI * 78}
                    animate={{ strokeDashoffset: (2 * Math.PI * 78) * (1 - progress / 100) }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                  <motion.circle 
                    cx="112" cy="112" r="110" 
                    fill="none" stroke="currentColor" 
                    strokeWidth="3" 
                    className="text-app-accent hidden sm:block"
                    strokeDasharray={2 * Math.PI * 110}
                    animate={{ strokeDashoffset: (2 * Math.PI * 110) * (1 - progress / 100) }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </svg>
              )}
            </motion.div>

            {/* Label moved outside overflow-hidden */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-app-accent text-black text-[8px] sm:text-[10px] font-mono px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase font-bold shadow-lg z-20 whitespace-nowrap">
              {currentPoint.label}
            </div>
          </div>
          
          <div className="mt-4 sm:mt-8 text-center min-h-[80px] sm:min-h-[100px] flex flex-col items-center">
            <p className="text-sm sm:text-lg font-medium max-w-[200px] sm:max-w-xs leading-tight">{currentPoint.instruction}</p>
            <motion.p 
              key={`affirmation-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-app-accent italic mt-2 sm:mt-4 text-xs sm:text-sm font-serif"
            >
              "{AFFIRMATIONS[currentIndex]}"
            </motion.p>
            <p className="text-[8px] sm:text-[10px] text-app-muted mt-2 sm:mt-4 font-mono uppercase tracking-widest">Point {currentIndex + 1} of {TAPPING_POINTS.length}</p>
          </div>
        </div>

        <button onClick={next} className="absolute right-2 sm:right-0 p-2 sm:p-4 text-app-muted hover:text-white transition-colors z-10">
          <ChevronRight size={24} className="sm:w-8 sm:h-8" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 sm:gap-6 shrink-0">
        <div className="flex gap-1.5 sm:gap-2">
          {TAPPING_POINTS.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300",
                i === currentIndex ? "bg-app-accent w-3 sm:w-4" : "bg-white/10"
              )} 
            />
          ))}
        </div>

        <button 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={cn(
            "flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-2 sm:py-3 rounded-full font-mono uppercase tracking-widest text-[8px] sm:text-[10px] transition-all",
            isAutoPlaying ? "bg-white/10 text-white" : "bg-app-accent text-black font-bold"
          )}
        >
          {isAutoPlaying ? <><Pause size={12} /> Stop Session</> : <><Play size={12} /> Start Guided Session</>}
        </button>
      </div>
    </div>
  );
}

function FocusTimerView({ triggerHaptic, profile, onUpdateProfile }: { 
  triggerHaptic: (p?: number | number[]) => void,
  profile: UserProfile,
  onUpdateProfile: (p: UserProfile) => void
}) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(profile.focusMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentDuration = mode === 'focus' ? profile.focusMinutes * 60 : profile.breakMinutes * 60;

  const toggle = () => {
    setIsActive(!isActive);
    triggerHaptic(60);
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(currentDuration);
    triggerHaptic([30, 30, 30]);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? profile.focusMinutes * 60 : profile.breakMinutes * 60);
    triggerHaptic(40);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            triggerHaptic([500, 200, 500]);
            return 0;
          }
          if (prev % 60 === 0) {
            triggerHaptic(20);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, triggerHaptic]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(currentDuration);
    }
  }, [profile.focusMinutes, profile.breakMinutes, mode, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8 py-4">
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-serif italic mb-1 sm:mb-2">
          {mode === 'focus' ? 'Deep Focus' : 'Short Break'}
        </h2>
        <p className="text-[10px] sm:text-sm text-app-muted">
          {mode === 'focus' 
            ? 'A gentle nudge every minute to keep you on track.' 
            : 'Rest your mind. You deserve it.'}
        </p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
        <button 
          onClick={() => switchMode('focus')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[8px] sm:text-[10px] font-mono uppercase tracking-widest transition-all",
            mode === 'focus' ? "bg-app-accent text-black font-bold" : "text-app-muted hover:text-white"
          )}
        >
          Focus
        </button>
        <button 
          onClick={() => switchMode('break')}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[8px] sm:text-[10px] font-mono uppercase tracking-widest transition-all",
            mode === 'break' ? "bg-amber-500 text-black font-bold" : "text-app-muted hover:text-white"
          )}
        >
          Break
        </button>
      </div>

      {!isActive && (
        <div className="flex gap-4 sm:gap-8 items-center animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-app-muted">Focus (min)</span>
            <input 
              type="number" 
              value={profile.focusMinutes}
              onChange={(e) => onUpdateProfile({ ...profile, focusMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-12 sm:w-16 bg-white/5 border border-white/10 rounded-lg px-1 sm:px-2 py-1 text-center font-mono text-xs sm:text-sm focus:outline-none focus:border-app-accent/50"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-app-muted">Break (min)</span>
            <input 
              type="number" 
              value={profile.breakMinutes}
              onChange={(e) => onUpdateProfile({ ...profile, breakMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-12 sm:w-16 bg-white/5 border border-white/10 rounded-lg px-1 sm:px-2 py-1 text-center font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      )}

      <div className="relative w-32 h-32 sm:w-64 sm:h-64 flex items-center justify-center">
        <svg viewBox="0 0 256 256" className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="128" cy="128" r="120" 
            fill="none" stroke="currentColor" 
            strokeWidth="4" className="text-white/5" 
          />
          <motion.circle 
            cx="128" cy="128" r="120" 
            fill="none" stroke="currentColor" 
            strokeWidth="4" 
            className={mode === 'focus' ? "text-app-accent" : "text-amber-500"}
            strokeDasharray={2 * Math.PI * 120}
            animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - timeLeft / currentDuration) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="text-2xl sm:text-6xl font-mono font-light tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggle}
          className={cn(
            "flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-mono uppercase tracking-widest text-[8px] sm:text-xs transition-all",
            isActive 
              ? "bg-white/10 text-white" 
              : mode === 'focus' ? "bg-app-accent text-black font-bold" : "bg-amber-500 text-black font-bold"
          )}
        >
          {isActive ? <><Pause size={14} className="sm:w-4 sm:h-4" /> Pause</> : <><Play size={14} className="sm:w-4 sm:h-4" /> Start {mode === 'focus' ? 'Focus' : 'Break'}</>}
        </button>
        <button 
          onClick={reset}
          className="p-3 sm:p-4 rounded-2xl bg-white/5 text-app-muted hover:text-white transition-colors"
        >
          <RotateCcw size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

function SonicChantView({ 
  triggerHaptic, 
  isMicActive, 
  toggleMic,
  analyzer,
  uploadedAudioUrl,
  isAudioPlaying,
  onUpload,
  onTogglePlayback,
  onRemove,
  isReferencePlaying,
  activeReferenceId,
  onPlayReference,
  isAudioLoading,
  selectedChant,
  setSelectedChant,
  audioVolume,
  setIsZenMode,
  isDroneActive,
  toggleDrone,
  micPitch
}: { 
  triggerHaptic: (p?: number | number[]) => void,
  isMicActive: boolean,
  toggleMic: () => void,
  analyzer: React.RefObject<AnalyserNode | null>,
  uploadedAudioUrl: string | null,
  isAudioPlaying: boolean,
  onUpload: (file: File | string) => void,
  onTogglePlayback: () => void,
  onRemove: () => void,
  isReferencePlaying: boolean,
  activeReferenceId: string | null,
  onPlayReference: (chant: SonicChant) => void,
  isAudioLoading: boolean,
  selectedChant: SonicChant | null,
  setSelectedChant: (chant: SonicChant | null) => void,
  audioVolume: number,
  setIsZenMode: (val: boolean) => void,
  isDroneActive: boolean,
  toggleDrone: () => void,
  micPitch: number | null
}) {
  const [activeCategory, setActiveCategory] = useState<SonicChant['category']>('vagus');
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredChants = SONIC_CHANTS.filter(c => c.category === activeCategory);

  const categories: { id: SonicChant['category'], label: string, icon: React.ReactNode }[] = [
    { id: 'vagus', label: 'Breath & Hum', icon: <Zap size={14} /> },
    { id: 'healing', label: 'Six Sounds', icon: <Sparkles size={14} /> },
    { id: 'bija', label: 'Bija Mantras', icon: <Wind size={14} /> },
    { id: 'vowel', label: 'Vowel Resonance', icon: <Mic size={14} /> },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-12">
      {/* Pitch Guide / Stats */}
      {isMicActive && selectedChant && selectedChant.referenceHz && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-app-accent/5 border border-app-accent/10 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Vocal Resonance Guide</span>
              <span className="text-xl font-serif italic text-white">{selectedChant.label} Guide: {selectedChant.referenceHz}Hz</span>
            </div>
            {micPitch && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-accent">Detected Pitch</span>
                <span className="text-xl font-mono text-app-accent font-bold">{Math.round(micPitch)}Hz</span>
              </div>
            )}
          </div>

          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 bg-app-accent/20 border-x border-app-accent/40 rounded-full transition-all duration-300"
              style={{ 
                left: `${(selectedChant.referenceHz / 1000) * 100 - 5}%`,
                width: '10%'
              }}
            />
            {micPitch && (
              <motion.div 
                className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_white] z-10"
                animate={{ left: `${Math.min(100, (micPitch / 1000) * 100)}%` }}
              />
            )}
          </div>
          
          <p className="text-[10px] text-center text-app-muted font-mono uppercase tracking-widest">
            {micPitch 
              ? (Math.abs(micPitch - selectedChant.referenceHz) < 10 
                 ? "Close to guide pitch" 
                 : "Move gently toward the guide zone")
              : "Detecting Voice..."}
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-serif italic">Sonic Vocalizations</h2>
          <p className="text-xs sm:text-sm text-app-muted">Use your own voice or pre-recorded sounds for breath pacing, humming, and resonance practice.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={toggleMic}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-xs uppercase tracking-widest transition-all shadow-lg",
              isMicActive 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:scale-105"
            )}
          >
            {isMicActive ? <VolumeX size={18} /> : <Mic size={18} />}
            {isMicActive ? "Stop Recording" : "Start Recording"}
          </button>

          <div className="flex items-center gap-2">
            {!uploadedAudioUrl ? (
              <>
                <button
                  onClick={toggleDrone}
                  disabled={isMicActive}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-2xl border font-mono text-xs uppercase tracking-widest transition-all",
                    isDroneActive 
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                      : "bg-white/5 text-app-muted border-white/10 hover:bg-white/10"
                  )}
                  title="Atmospheric Drone Anchor"
                >
                  <Waves size={18} />
                  Drone
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isMicActive}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 text-white border border-white/10 font-mono text-xs uppercase tracking-widest transition-all hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10"
                >
                  <Upload size={18} />
                  Upload
                </button>
                
                <button
                  onClick={() => setShowLibrary(!showLibrary)}
                  disabled={isMicActive}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-2xl border font-mono text-xs uppercase tracking-widest transition-all",
                    showLibrary 
                      ? "bg-app-accent text-black border-app-accent" 
                      : "bg-white/5 text-app-muted border-white/10 hover:bg-white/10"
                  )}
                >
                  <BookOpen size={18} />
                  Presets
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                <button
                  onClick={onTogglePlayback}
                  disabled={isAudioLoading}
                  className={cn(
                    "w-10 h-10 rounded-xl bg-app-accent text-black flex items-center justify-center transition-transform hover:scale-105",
                    isAudioLoading && "animate-pulse opacity-50"
                  )}
                >
                  {isAudioLoading ? <RotateCcw size={18} className="animate-spin" /> : (isAudioPlaying ? <Pause size={18} /> : <Play size={18} />)}
                </button>
                <div className="px-3 flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-accent">
                    {isAudioLoading ? "Loading Audio..." : "Audio File Active"}
                  </span>
                  <span className="text-[9px] text-app-muted truncate max-w-[100px]">
                    {isAudioLoading ? "Please wait" : "Looping Enabled"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowLibrary(!showLibrary)}
                    className="w-10 h-10 rounded-xl bg-white/5 text-app-muted flex items-center justify-center transition-colors hover:bg-white/10"
                    title="Open Library"
                  >
                    <BookOpen size={18} />
                  </button>
                  <button
                    onClick={onRemove}
                    className="w-10 h-10 rounded-xl bg-white/5 text-app-muted flex items-center justify-center transition-colors hover:bg-red-500/20 hover:text-red-400"
                    title="Remove Audio"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-app-accent" />
                  <span className="text-xs font-mono uppercase tracking-widest">Sonic Preset Library</span>
                </div>
                <button 
                  onClick={() => setShowLibrary(false)}
                  className="text-app-muted hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESET_LIBRARY.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onUpload(preset.url);
                      setShowLibrary(false);
                      triggerHaptic(20);
                    }}
                    className="flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-app-accent/40 hover:bg-white/10 transition-all group text-left"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-2 rounded-xl bg-app-accent/10 text-app-accent group-hover:bg-app-accent group-hover:text-black transition-colors">
                        <Music size={16} />
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-tighter px-2 py-0.5 rounded-full bg-white/5 text-app-muted">
                        {preset.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-medium truncate">{preset.label}</span>
                      <ChevronRight size={14} className="text-app-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-[10px] text-app-muted italic text-center">
                Presets are high-quality loops designed to harmonize with the Sacred Geometry visualizer.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(isMicActive || isAudioPlaying) && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Resonance Intensity</span>
            <span className="text-[10px] font-mono text-app-accent">{Math.round(audioVolume * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-app-accent"
              animate={{ width: `${audioVolume * 100}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />
          </div>
          <p className="text-[10px] text-app-accent/60 italic">The sacred geometry visualizer is responding to the {isMicActive ? 'microphone' : 'audio file'}.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSelectedChant(null);
              triggerHaptic(20);
            }}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-mono uppercase tracking-widest transition-all border shrink-0",
              activeCategory === cat.id 
                ? "bg-app-accent text-black border-app-accent font-bold" 
                : "bg-white/5 text-app-muted border-white/5 hover:border-white/20"
            )}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredChants.map(chant => (
          <div
            key={chant.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedChant(chant);
              triggerHaptic(40);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedChant(chant);
                triggerHaptic(40);
              }
            }}
            className={cn(
              "p-4 rounded-2xl text-left transition-all duration-300 border group relative overflow-hidden cursor-pointer",
              selectedChant?.id === chant.id 
                ? "bg-white/10 border-app-accent/30 shadow-lg" 
                : "bg-white/[0.02] border-white/5 hover:border-white/20"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-app-accent">{chant.sound}</span>
                {chant.referenceHz && (
                  <span className="text-[10px] font-mono text-app-accent/40">{chant.referenceHz}Hz guide</span>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChant(chant);
                    if (uploadedAudioUrl) {
                      if (!isAudioPlaying) onTogglePlayback();
                    }
                    setIsZenMode(true);
                    triggerHaptic([20, 40]);
                  }}
                  className="p-1.5 rounded-lg bg-app-accent/10 text-app-accent hover:bg-app-accent hover:text-black transition-all"
                  title={uploadedAudioUrl ? "Quick Start Practice" : "Open Practice"}
                >
                  <Play size={12} fill="currentColor" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayReference(chant);
                    triggerHaptic(20);
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    activeReferenceId === chant.id
                      ? "bg-app-accent text-black"
                      : "bg-white/5 text-app-muted hover:bg-white/10 hover:text-white"
                  )}
                  title="Play Guide Tone"
                >
                  <Music size={12} />
                </button>
              </div>
            </div>
            <h3 className="font-serif italic text-lg mb-1">{chant.label}</h3>
            <p className="text-[10px] text-app-muted leading-tight line-clamp-2">{chant.benefit}</p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedChant ? (
          <motion.div
            key={selectedChant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-6 rounded-[32px] bg-app-accent/5 border border-app-accent/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Mic size={120} className="text-app-accent" />
            </div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-app-accent text-black flex items-center justify-center text-xl font-mono font-bold">
                  {selectedChant.sound}
                </div>
                <div>
                  <h3 className="text-xl font-serif italic">{selectedChant.label}</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-app-accent/60">Active Practice</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">How to Practice</span>
                  <p className="text-sm leading-relaxed">{selectedChant.instruction}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Resonance Area</span>
                  <div className="flex items-center gap-2 text-app-accent">
                    <Activity size={14} />
                    <span className="text-sm font-medium">{selectedChant.resonates}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted block mb-2">Practice Note</span>
                  <p className="text-xs italic text-white/80 leading-relaxed">{selectedChant.benefit}</p>
                </div>
                
                <div className="flex gap-2">
                  {selectedChant.referenceHz && (
                    <button
                      onClick={() => onPlayReference(selectedChant)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all border shrink-0",
                        isReferencePlaying 
                          ? "bg-app-accent text-black border-app-accent animate-pulse" 
                          : "bg-white/5 text-app-muted border-white/10 hover:border-app-accent/50 hover:text-app-accent"
                      )}
                    >
                      {isReferencePlaying ? <Pause size={14} /> : <Volume2 size={14} />}
                      {isReferencePlaying ? "Stop Guide" : "Play Guide"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (uploadedAudioUrl) {
                        if (!isAudioPlaying) onTogglePlayback();
                      }
                      setIsZenMode(true);
                      triggerHaptic([20, 40]);
                    }}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-app-accent text-black font-mono text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,255,157,0.4)] shrink-0"
                    title="Enter Full Screen Practice"
                  >
                    <Play size={16} fill="currentColor" />
                    {uploadedAudioUrl ? "Start Practice" : "Open Practice"}
                  </button>
                </div>
              </div>

              {!uploadedAudioUrl && !isMicActive && (
                <p className="text-[10px] font-mono uppercase tracking-widest text-app-muted">
                  Microphone stays off until you tap Start Recording above.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-8 rounded-[32px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-app-muted">
              <Mic size={24} />
            </div>
            <div>
              <p className="text-sm font-serif italic text-white/60">Select a vocalization from the grid above</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-app-muted mt-1">to begin your resonance practice</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuideView({
  onStartQuickSession,
  onOpenMode,
  onOpenNeed
}: {
  onStartQuickSession: () => void;
  onOpenMode: (mode: AppMode | StudioMode | 'profile') => void;
  onOpenNeed: (moodId: MoodId, options?: { schumann?: boolean; depth?: boolean; visuals?: boolean }) => void;
}) {
  const guideTopics: Array<{
    title: string;
    description: string;
    icon: typeof Sparkles;
    iconClassName: string;
    action: () => void;
    cta: string;
  }> = [
    {
      title: 'Solfeggio Frequencies',
      description: `A commonly used modern wellness tone set: 174, 285, 396, 417, 528, 639, 741, 852, and 963Hz. These are intentional listening tones, not ${TUNING_STANDARD} note names or medical treatments.`,
      icon: Sparkles,
      iconClassName: 'text-app-accent',
      action: () => onOpenNeed('scattered'),
      cta: 'Choose Focus'
    },
    {
      title: 'Earth Hum',
      description: `Earth Hum adds a quiet ${SCHUMANN_RESONANCE_HZ}Hz grounding layer underneath the selected tone. Use it when you want the session to feel lower, steadier, and more physically anchored.`,
      icon: Activity,
      iconClassName: 'text-amber-500',
      action: () => onOpenNeed('anxious', { schumann: true }),
      cta: 'Choose Grounding'
    },
    {
      title: 'Depth Mode',
      description: 'Depth adds a gentle binaural spread by offsetting the left and right carriers around the selected tone. Use headphones for the clearest effect; the displayed Hz remains the center tone.',
      icon: Brain,
      iconClassName: 'text-blue-400',
      action: () => onOpenNeed('focused', { depth: true }),
      cta: 'Choose Depth'
    },
    {
      title: 'EFT Tapping',
      description: 'Emotional Freedom Technique involves tapping on specific meridian points while focusing on a stressor. This physical stimulation sends signals to the amygdala (the brain\'s fear center) to reduce the "fight or flight" response.',
      icon: Fingerprint,
      iconClassName: 'text-emerald-400',
      action: () => onOpenMode('tapping'),
      cta: 'Open Tapping'
    },
    {
      title: 'Sacred Visuals',
      description: 'Visuals turns on the moving geometry that responds to the sound. Turn it off when you want a quieter screen and only want tone, pulse, and breath.',
      icon: Eye,
      iconClassName: 'text-purple-400',
      action: () => onOpenNeed('scattered', { visuals: true }),
      cta: 'Choose Focus'
    },
    {
      title: 'Zen Mode',
      description: 'Zen is the quiet state. During a running session the controls drift away after ten seconds without touch. Choosing Zen manually skips the wait and goes quiet immediately.',
      icon: Maximize2,
      iconClassName: 'text-white',
      action: () => onOpenNeed('focused'),
      cta: 'Choose Depth'
    },
    {
      title: 'Haptic Feedback',
      description: 'On mobile devices, haptics provide physical pulses to guide breathing or grounding. On desktop, low-frequency audio pulses simulate the pattern as a rhythmic practice anchor.',
      icon: Zap,
      iconClassName: 'text-app-accent',
      action: () => onOpenNeed('tense'),
      cta: 'Choose Release'
    },
    {
      title: 'Sonic Vocalizations',
      description: 'Using your own voice can support slow breathing, attention, and felt vibration. Sounds like "VOO," humming, bija mantras, and vowel tones are offered as guided resonance practices rather than fixed medical treatments.',
      icon: Mic,
      iconClassName: 'text-app-accent',
      action: () => onOpenMode('chants'),
      cta: 'Open Vocal Practice'
    }
  ];

  const headerControls = [
    {
      label: 'Guide',
      icon: BookOpen,
      iconClassName: 'text-app-muted',
      description: 'Opens this explanation page when you want to understand what a control does.'
    },
    {
      label: 'Begin',
      icon: Zap,
      iconClassName: 'text-app-accent',
      description: 'Starts the current chosen session quickly with its tone, pulse, timer, and visualizer.'
    },
    {
      label: 'Zen',
      icon: Maximize2,
      iconClassName: 'text-white',
      description: 'Moves straight into the quiet session view. If you do nothing, the app enters this state automatically ten seconds after the session is running.'
    },
    {
      label: 'Visuals',
      icon: Eye,
      iconClassName: 'text-purple-400',
      description: 'Shows or hides the moving geometry. Sound and haptics continue either way.'
    },
    {
      label: 'Earth Hum',
      icon: Activity,
      iconClassName: 'text-amber-500',
      description: `Adds the ${SCHUMANN_RESONANCE_HZ}Hz low grounding layer beneath your session tone.`
    },
    {
      label: 'Depth',
      icon: Brain,
      iconClassName: 'text-blue-400',
      description: 'Adds the headphone-friendly binaural spread for a wider, deeper listening field.'
    },
    {
      label: 'Volume',
      icon: Volume2,
      iconClassName: 'text-white',
      description: 'Controls the listening level for the generated tones and sound layers.'
    },
    {
      label: 'Stop All',
      icon: RotateCcw,
      iconClassName: 'text-red-400',
      description: 'Stops anything currently active, including tones, haptics, uploaded audio, drone, or microphone input.'
    }
  ];

  return (
    <div className="min-h-full flex flex-col gap-8 pr-1 sm:pr-2 pb-28 sm:pb-16">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-serif italic mb-1">The Focus Flow Guide</h2>
        <p className="text-sm text-app-muted">Understanding the science and purpose behind your neural harmony tools.</p>
      </div>

      <section className="p-6 rounded-[32px] bg-gradient-to-br from-app-accent/10 to-white/5 border border-app-accent/15 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-app-accent">
          <BookOpen size={16} />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Choose Your First Step</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic">You do not need every tool</h3>
          <p className="text-sm text-app-muted leading-relaxed max-w-2xl">
            Most people only need one starting point. Pick the outcome you want first, then expand into the other sections once the app feels familiar.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={onStartQuickSession}
            className="text-left p-4 rounded-2xl bg-black/30 border border-app-accent/20 hover:bg-black/40 transition-colors"
          >
            <Zap size={16} className="text-app-accent mb-3" />
            <h4 className="text-xs font-mono uppercase tracking-widest font-bold mb-2">I want to start now</h4>
            <p className="text-xs text-app-muted leading-relaxed">Play a tone immediately and keep the experience simple.</p>
          </button>
          <button
            onClick={() => onOpenMode('tapping')}
            className="text-left p-4 rounded-2xl bg-black/30 border border-white/10 hover:bg-black/40 transition-colors"
          >
            <Fingerprint size={16} className="text-emerald-400 mb-3" />
            <h4 className="text-xs font-mono uppercase tracking-widest font-bold mb-2">I need to calm down</h4>
            <p className="text-xs text-app-muted leading-relaxed">Open tapping for a guided body-based reset.</p>
          </button>
          <button
            onClick={() => onOpenNeed('scattered')}
            className="text-left p-4 rounded-2xl bg-black/30 border border-white/10 hover:bg-black/40 transition-colors"
          >
            <Timer size={16} className="text-blue-400 mb-3" />
            <h4 className="text-xs font-mono uppercase tracking-widest font-bold mb-2">I want focused work</h4>
            <p className="text-xs text-app-muted leading-relaxed">Open the Focus session so the next Begin starts the right path.</p>
          </button>
        </div>
      </section>

      <section className="p-6 rounded-[32px] bg-white/[0.04] border border-white/10 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-serif italic">What the top buttons do</h3>
          <p className="text-sm text-app-muted leading-relaxed max-w-2xl">
            These controls change the feeling of a session. You can leave them alone and simply press Begin, or use them when you want the space quieter, deeper, or more grounded.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {headerControls.map(({ label, icon: Icon, iconClassName, description }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/24 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon size={15} className={iconClassName} />
                <h4 className="text-[10px] font-mono uppercase tracking-widest font-bold">{label}</h4>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-serif italic">Tap a topic to open it</h3>
          <p className="text-xs text-app-muted">Each guide card now takes you straight to the matching tool.</p>
        </div>
        <button
          onClick={onStartQuickSession}
          className="shrink-0 px-4 py-2 rounded-full bg-app-accent text-black text-[10px] font-mono uppercase tracking-widest font-bold hover:scale-[1.02] transition-transform"
        >
          Quick Start
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guideTopics.map(({ title, description, icon: Icon, iconClassName, action, cta }) => (
          <button
            key={title}
            onClick={action}
            className="group text-left p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-app-accent/40 hover:bg-white/[0.07] transition-all flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} className={iconClassName} />
                <h3 className="text-xs font-mono uppercase tracking-widest font-bold">{title}</h3>
              </div>
              <ChevronRight size={16} className="text-app-muted group-hover:text-app-accent transition-colors shrink-0" />
            </div>
            <p className="text-xs text-app-muted leading-relaxed">
              {description}
            </p>
            <span className="text-[10px] font-mono uppercase tracking-widest text-app-accent font-bold">
              {cta}
            </span>
          </button>
        ))}
      </div>

      {/* Usage Strategy Section */}
      <div className="mt-8 p-8 rounded-[40px] bg-app-accent/5 border border-app-accent/20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-serif italic text-app-accent">How to Choose Your Mode</h3>
          <p className="text-sm text-app-muted">Optimize your experience by selecting the right tool for your current state.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Activity size={20} />
            </div>
            <h4 className="font-mono text-xs uppercase tracking-widest">Grounding (Schumann)</h4>
            <p className="text-xs text-app-muted leading-relaxed">
              Choose **Schumann Resonance** when you feel scattered or overstimulated. It provides a steady {SCHUMANN_RESONANCE_HZ}Hz low-frequency anchor based on the common rounded Schumann reference.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
              <Sparkles size={20} />
            </div>
            <h4 className="font-mono text-xs uppercase tracking-widest">Intention Tone</h4>
            <p className="text-xs text-app-muted leading-relaxed">
              Choose a Solfeggio tone when you want a specific listening intention. Use 528Hz for clarity-focused practice, or 396Hz for a grounding release practice.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Maximize2 size={20} />
            </div>
            <h4 className="font-mono text-xs uppercase tracking-widest">Deep Focus (Zen)</h4>
            <p className="text-xs text-app-muted leading-relaxed">
              Zen is for deep work or total immersion. In a running session, the interface fades away after ten seconds without touch. Any touch brings controls back quickly.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-black/40 border border-white/5">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-app-accent mb-4 flex items-center gap-2">
            <Zap size={12} />
            Synergy: Using Tools Together
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">The "Earth Anchor" Stack</span>
              <p className="text-[11px] text-app-muted">Combine **Schumann Resonance** with **Zen Mode** when you want a minimal screen and a steady low-frequency grounding anchor.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">The "Vagal Reset" Stack</span>
              <p className="text-[11px] text-app-muted">Use a Solfeggio tone while performing **Sonic Vocalizations** if you like having a soft tone underneath your voice. Treat the guide tone as a steady listening anchor, not a required pitch.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">The "Emotional Release" Stack</span>
              <p className="text-[11px] text-app-muted">Use **EFT Tapping** while listening to **Solfeggio Frequencies** when you want a body-based rhythm paired with a steady listening tone.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">The "Flow State" Stack</span>
              <p className="text-[11px] text-app-muted">Layer **Brown Noise** (from the library) with **Zen Mode**. The noise masks cognitive distractions while the minimal interface allows your visual focus to stay locked on the sacred geometry patterns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ profile, onUpdate, triggerHaptic }: { 
  profile: UserProfile, 
  onUpdate: (p: UserProfile) => void,
  triggerHaptic: (p?: number | number[]) => void
}) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    triggerHaptic([30, 50]);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic mb-1">Your Profile</h2>
          <p className="text-sm text-app-muted">Personalize your focus and mindfulness experience.</p>
        </div>
        <button 
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono uppercase tracking-widest text-[10px] transition-all",
            isSaved ? "bg-emerald-500 text-black font-bold" : "bg-app-accent text-black font-bold hover:scale-105"
          )}
        >
          {isSaved ? <><CheckCircle2 size={14} /> Saved</> : <><Save size={14} /> Save Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-app-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Identity</h3>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Display Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={(e) => onUpdate({ ...profile, name: e.target.value })}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-app-accent/50"
              placeholder="Your name..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Preferred Frequency</label>
            <div className="p-4 bg-black/20 border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {SOLFEGGIO_FREQUENCIES.find(f => f.id === profile.preferredFrequencyId)?.label || 'None Selected'}
                </span>
                <span className="text-[10px] text-app-muted">
                  {SOLFEGGIO_FREQUENCIES.find(f => f.id === profile.preferredFrequencyId)?.hz ? `${SOLFEGGIO_FREQUENCIES.find(f => f.id === profile.preferredFrequencyId)?.hz}Hz` : 'Select from frequencies tab'}
                </span>
              </div>
              <Star size={16} className={cn(profile.preferredFrequencyId ? "text-app-accent fill-app-accent/20" : "text-white/10")} />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl mt-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium">Keep Screen On</span>
              <span className="text-[10px] text-app-muted">Prevents device sleep during focus</span>
            </div>
            <button 
              onClick={() => onUpdate({ ...profile, keepScreenOn: !profile.keepScreenOn })}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                profile.keepScreenOn ? "bg-app-accent" : "bg-white/10"
              )}
            >
              <motion.div 
                animate={{ x: profile.keepScreenOn ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </section>

        {/* Timer Defaults */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Timer size={18} className="text-amber-500" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Timer Defaults</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Focus (min)</label>
              <input 
                type="number" 
                value={profile.focusMinutes}
                onChange={(e) => onUpdate({ ...profile, focusMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Break (min)</label>
              <input 
                type="number" 
                value={profile.breakMinutes}
                onChange={(e) => onUpdate({ ...profile, breakMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} className="text-blue-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Preferred Frequency</h3>
          </div>
          <select 
            value={profile.preferredFrequencyId || ''}
            onChange={(e) => onUpdate({ ...profile, preferredFrequencyId: e.target.value })}
            className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400/50 appearance-none"
          >
            {SOLFEGGIO_FREQUENCIES.map(f => (
              <option key={f.id} value={f.id} className="bg-zinc-900">{f.hz}Hz - {f.label}</option>
            ))}
          </select>
        </section>

        {/* Haptic Preferences */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Waves size={18} className="text-app-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Preferred Haptic</h3>
          </div>
          <select 
            value={profile.preferredHapticId || ''}
            onChange={(e) => onUpdate({ ...profile, preferredHapticId: e.target.value })}
            className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-app-accent/50 appearance-none"
          >
            {HAPTIC_PATTERNS.map(h => (
              <option key={h.id} value={h.id} className="bg-zinc-900">{h.label}</option>
            ))}
          </select>
        </section>

        {/* System Settings */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={18} className="text-app-muted" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">System Settings</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Show Visualizer</span>
                <span className="text-[10px] text-app-muted">Display sacred geometry during audio</span>
              </div>
              <button 
                onClick={() => onUpdate({ ...profile, showVisualizer: !profile.showVisualizer })}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  profile.showVisualizer ? "bg-app-accent" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  profile.showVisualizer ? "left-6" : "left-1"
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Schumann Resonance</span>
                <span className="text-[10px] text-app-muted">Enable {SCHUMANN_RESONANCE_HZ}Hz grounding by default</span>
              </div>
              <button 
                onClick={() => onUpdate({ ...profile, useSchumann: !profile.useSchumann })}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  profile.useSchumann ? "bg-amber-500" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  profile.useSchumann ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HandPanView({ 
  playNote, 
  triggerHaptic,
  isRecording,
  recordedUrl,
  onStartRecording,
  onStopRecording,
  onDiscardRecording
}: { 
  playNote: (freq: number) => void, 
  triggerHaptic: (p?: number | number[]) => void,
  isRecording: boolean,
  recordedUrl: string | null,
  onStartRecording: () => void,
  onStopRecording: () => void,
  onDiscardRecording: () => void
}) {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [radius, setRadius] = useState(170);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeNoteTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      
      if (width < 640) {
        setRadius(Math.min(95, (width - 80) / 2.5));
      } else {
        setRadius(170);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (activeNoteTimer.current) window.clearTimeout(activeNoteTimer.current);
    };
  }, []);

  const handleNotePress = (note: typeof HANDPAN_NOTES[0]) => {
    playNote(note.freq);
    setActiveNote(note.id);
    triggerHaptic(30);
    if (activeNoteTimer.current) window.clearTimeout(activeNoteTimer.current);
    activeNoteTimer.current = window.setTimeout(() => setActiveNote(null), 300);
  };

  const handleNotePointerDown = (event: React.PointerEvent<HTMLButtonElement>, note: typeof HANDPAN_NOTES[0]) => {
    event.preventDefault();
    event.stopPropagation();
    handleNotePress(note);
  };

  const handleNoteKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, note: typeof HANDPAN_NOTES[0]) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleNotePress(note);
  };

  const handleExport = async () => {
    if (!recordedUrl) return;

    const fileName = `focusflow-handpan-${new Date().getTime()}.webm`;

    try {
      const response = await fetch(recordedUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type || 'audio/webm' });

      if (
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        'canShare' in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: 'Focus Flow Hand Pan Recording',
          text: 'Hand Pan recording from Focus Flow'
        });
        return;
      }
    } catch (error) {
      console.warn('Native share failed, falling back to direct download.', error);
    }

    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start sm:justify-center p-4 pb-24 sm:pb-8 select-none touch-pan-y overflow-y-auto custom-scrollbar">
      <div className="text-center mb-6 sm:mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-serif italic mb-1 sm:mb-2 text-white"
        >
          Resonance Plate
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] sm:text-xs text-app-muted max-w-sm font-mono uppercase tracking-widest"
        >
          D3 Natural Scale • Integral Tuning
        </motion.p>
      </div>

      {/* Recording Controls */}
      <div className="mb-8 flex items-center gap-3">
        {!recordedUrl ? (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl font-mono uppercase tracking-widest text-[10px] transition-all relative overflow-hidden",
              isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-white" : "bg-red-500")} />
            {isRecording ? "Stop Recording" : "Start Internal Record"}
          </button>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => {
                if (isPlayingRecording) {
                  audioRef.current?.pause();
                } else {
                  audioRef.current?.play();
                }
              }}
              className="p-3 rounded-xl bg-app-accent text-black hover:scale-105 transition-transform"
            >
              {isPlayingRecording ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex flex-col px-3">
              <span className="text-[10px] font-mono font-bold text-white/80 uppercase">Rec Session Ready</span>
              <span className="text-[8px] font-mono text-app-muted uppercase">Ready to export</span>
            </div>
            <div className="flex gap-1 pr-1">
              <button
                onClick={handleExport}
                className="p-2 rounded-lg bg-white/10 text-app-accent hover:bg-app-accent hover:text-black transition-all"
                title="Share or Export"
              >
                <Upload size={14} />
              </button>
              <button
                onClick={onDiscardRecording}
                className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Discard"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            <audio 
              ref={audioRef} 
              src={recordedUrl} 
              onPlay={() => setIsPlayingRecording(true)}
              onPause={() => setIsPlayingRecording(false)}
              onEnded={() => setIsPlayingRecording(false)}
              className="hidden" 
            />
          </div>
        )}
      </div>

      <div className="relative w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] shrink-0 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-4 border-white/5 shadow-2xl flex items-center justify-center">
        {/* Subtle texture/sheen */}
        <div className="absolute inset-4 rounded-full border border-white/5 opacity-30 pointer-events-none" />
        
        {/* Central Ding */}
        <button
          type="button"
          onPointerDown={(event) => handleNotePointerDown(event, HANDPAN_NOTES[0])}
          onKeyDown={(event) => handleNoteKeyDown(event, HANDPAN_NOTES[0])}
          className={cn(
            "z-20 w-24 h-24 sm:w-44 sm:h-44 rounded-full transition-all duration-300 relative group overflow-hidden outline-none cursor-pointer",
            activeNote === 'ding' ? "bg-app-accent scale-95 shadow-[0_0_50px_rgba(0,255,157,0.4)]" : "bg-zinc-700/50 hover:bg-zinc-600/50 shadow-xl border border-white/5"
          )}
          style={{ touchAction: 'manipulation' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <span className={cn(
            "text-[10px] font-mono font-bold tracking-widest transition-colors",
            activeNote === 'ding' ? "text-black" : "text-app-accent"
          )}>DING</span>
        </button>

        {/* Circular Notes */}
        {HANDPAN_NOTES.slice(1).map((note, i) => {
          const angle = (i * 360) / 8 - 90;
          
          return (
            <button
              key={note.id}
              type="button"
              onPointerDown={(event) => handleNotePointerDown(event, note)}
              onKeyDown={(event) => handleNoteKeyDown(event, note)}
              className={cn(
                "absolute z-10 w-12 h-12 sm:w-24 sm:h-24 rounded-full transition-all duration-200 border border-white/10 flex flex-col items-center justify-center gap-1 overflow-hidden outline-none cursor-pointer",
                activeNote === note.id ? "bg-app-accent scale-90 shadow-[0_0_30px_rgba(0,255,157,0.3)]" : "bg-zinc-800/80 hover:bg-zinc-700"
              )}
              style={{
                top: '50%',
                left: '50%',
                marginTop: isMobile ? '-1.5rem' : '-3rem',
                marginLeft: isMobile ? '-1.5rem' : '-3rem',
                transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
                touchAction: 'manipulation'
              }}
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
               <span className={cn(
                 "text-[10px] sm:text-xs font-mono font-bold transition-colors",
                 activeNote === note.id ? "text-black" : "text-white/40"
               )}>{note.label}</span>
            </button>
          );
        })}

        {/* Decorative Internal Rings */}
        <div className="absolute w-[80%] h-[80%] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-white/5 pointer-events-none opacity-30" />
      </div>

      <div className="mt-8 sm:mt-16 flex gap-2 sm:gap-4 flex-wrap justify-center pb-8 sm:pb-0">
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10">
          <Music size={12} className="text-app-accent" />
          <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-app-muted shrink-0">D3 Integral Scale</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10">
          <Zap size={12} className="text-app-accent" />
          <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-widest text-app-muted shrink-0">Active Resonator</span>
        </div>
      </div>
    </div>
  );
}

function AboutView() {
  return (
    <div className="max-w-2xl mx-auto space-y-12 py-8 px-4">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-app-accent to-emerald-800 p-1">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border-2 border-white/10">
              <User size={64} className="text-white/20" />
            </div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 bg-app-accent text-black rounded-full p-2 shadow-lg"
          >
            <Heart size={20} fill="currentColor" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-serif italic text-white">Antoinette Williams</h2>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-app-accent font-bold">Master Reiki Practitioner since 2021</p>
        </div>

        <p className="text-sm text-app-muted leading-relaxed max-w-md">
          Dedicated to the art of energetic healing, Antoinette combines ancient wisdom with modern neurological insights to help individuals achieve profound states of calm and clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="text-app-accent" size={20} />
            <h3 className="text-sm font-mono uppercase tracking-widest font-bold">About the App</h3>
          </div>
          <div className="space-y-4 text-sm text-app-muted leading-relaxed">
            <p>
              <span className="text-white font-medium italic">Focus Flow</span> (Neuro Harmony) was born from a desire to bridge the gap between spiritual wellness and neurodivergent needs. 
            </p>
            <p>
              Designed specifically to facilitate <span className="text-app-accent">DeepFlow</span>, this platform leverages the power of Solfeggio frequencies, guided meridian tapping (EFT), and tactile haptic feedback.
            </p>
            <p>
              Our mission is to help you reach a state of <span className="italic">Neural Harmony</span>—where the brain and body align, allowing for effortless focus, reduced anxiety, and a deeper connection to the present moment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass p-4 rounded-2xl border-white/5 flex flex-col items-center text-center gap-2">
            <Waves className="text-app-accent/60" size={16} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Frequencies</span>
            <p className="text-[10px] leading-tight">Tuned tones for listening, focus, and guided resonance practice.</p>
          </div>
          <div className="glass p-4 rounded-2xl border-white/5 flex flex-col items-center text-center gap-2">
            <Fingerprint className="text-app-accent/60" size={16} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Haptics</span>
            <p className="text-[10px] leading-tight">Tactile feedback that anchors your focus during meditation.</p>
          </div>
        </div>
      </div>

      <footer className="pt-8 border-t border-white/5 text-center">
        <p className="text-[10px] font-mono uppercase tracking-tighter text-white/20">
          Created with intention for mental harmony and emotional clarity.
        </p>
      </footer>
    </div>
  );
}

function ReikiView() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-8 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-serif italic text-white">Reiki Master Symbols</h2>
        <p className="text-xs sm:text-sm text-app-muted max-w-lg mx-auto font-mono uppercase tracking-widest leading-relaxed">
          Sacred geometric keys for advanced energetic healing and spiritual empowerment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REIKI_SYMBOLS.map((symbol) => (
          <motion.div 
            key={symbol.id}
            whileHover={{ y: -5 }}
            className="glass p-6 sm:p-8 rounded-[32px] border-white/5 flex flex-col gap-4 group transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-app-accent/10 flex items-center justify-center text-app-accent">
                <Shield size={24} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-app-accent/40">{symbol.meaning}</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-serif italic text-white group-hover:text-app-accent transition-colors">{symbol.name}</h3>
              <p className="text-xs font-mono uppercase tracking-widest text-app-accent font-bold opacity-80">{symbol.purpose}</p>
            </div>

            <p className="text-sm text-app-muted leading-relaxed border-t border-white/5 pt-4">
              {symbol.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-[32px] border-white/5 bg-gradient-to-br from-app-accent/5 to-transparent">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-app-accent" size={24} />
          <h3 className="text-lg font-serif italic text-white">Using Symbols with Focus Flow</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-app-muted leading-relaxed">
          <div className="space-y-2">
            <span className="text-app-accent font-mono text-[10px] uppercase tracking-widest font-bold">01. Visualize</span>
            <p>Close your eyes and visualize the symbol while listening to a Solfeggio frequency to amplify the intent.</p>
          </div>
          <div className="space-y-2">
            <span className="text-app-accent font-mono text-[10px] uppercase tracking-widest font-bold">02. Chant</span>
            <p>Repeat the name of the symbol as a mantra, matching the rhythm of the sonic vocalizations.</p>
          </div>
          <div className="space-y-2">
            <span className="text-app-accent font-mono text-[10px] uppercase tracking-widest font-bold">03. Trace</span>
            <p>Use the tapping points to physically ground the energy of the symbol into your neurological system.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
