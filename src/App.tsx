import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
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
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

const SOLFEGGIO_FREQUENCIES: Frequency[] = [
  { id: '174', hz: 174, label: 'Relief', description: 'Pain & Stress Reduction', color: '#ef4444', secondaryColor: '#7f1d1d', chakra: 'Root (Muladhara)' },
  { id: '285', hz: 285, label: 'Heal', description: 'Tissue & Energy Repair', color: '#f97316', secondaryColor: '#7c2d12', chakra: 'Root/Sacral' },
  { id: '396', hz: 396, label: 'Liberate', description: 'Releasing Guilt & Fear', color: '#dc2626', secondaryColor: '#450a0a', chakra: 'Root (Muladhara)' },
  { id: '417', hz: 417, label: 'Change', description: 'Facilitating Transformation', color: '#fb923c', secondaryColor: '#7c2d12', chakra: 'Sacral (Svadhisthana)' },
  { id: '528', hz: 528, label: 'Focus', description: 'DNA Repair & Clarity', color: '#facc15', secondaryColor: '#713f12', chakra: 'Solar Plexus (Manipura)' },
  { id: '639', hz: 639, label: 'Connect', description: 'Harmonizing Relationships', color: '#22c55e', secondaryColor: '#064e3b', chakra: 'Heart (Anahata)' },
  { id: '741', hz: 741, label: 'Awaken', description: 'Intuition & Expression', color: '#0ea5e9', secondaryColor: '#0c4a6e', chakra: 'Throat (Vishuddha)' },
  { id: '852', hz: 852, label: 'Spiritual', description: 'Returning to Order', color: '#6366f1', secondaryColor: '#312e81', chakra: 'Third Eye (Ajna)' },
  { id: '963', hz: 963, label: 'Divine', description: 'Higher Consciousness', color: '#a855f7', secondaryColor: '#581c87', chakra: 'Crown (Sahasrara)' },
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

interface HapticPattern {
  id: string;
  label: string;
  description: string;
  pattern: number[];
  color: string;
}

const HAPTIC_PATTERNS: HapticPattern[] = [
  { id: 'heartbeat', label: 'Heartbeat', description: 'Coherence & Grounding', pattern: [100, 100, 100, 800], color: '#f43f5e' },
  { id: 'waves', label: 'Ocean Waves', description: 'Calm & Flow', pattern: [500, 1000, 500, 1500], color: '#3b82f6' },
  { id: 'zen', label: 'Zen Pulse', description: 'Soft Awareness', pattern: [50, 400, 50, 400], color: '#00ff9d' },
  { id: 'breathe', label: 'Breath Guide', description: 'Paced Respiration', pattern: [1000, 2000, 1000, 2000], color: '#a855f7' },
];

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
  // Vagus Nerve
  { id: 'voo', label: 'Vagus Reset', sound: 'VOO', instruction: 'Inhale deeply, then release a low, resonant "VOOO" sound, feeling the vibration deep in your belly.', benefit: 'Instantly calms the nervous system by signaling safety to the brainstem.', category: 'vagus', resonates: 'Chest & Abdomen', referenceHz: 85 },
  { id: 'mom', label: 'Nurturing Connection', sound: 'MOM', instruction: 'Gently repeat "MOM-MOM-MOM" with a soft, rhythmic hum.', benefit: 'Activates the ventral vagal system to foster feelings of warmth and joy.', category: 'vagus', resonates: 'Face & Throat', referenceHz: 174 },
  { id: 'err', label: 'Earth Grounding', sound: 'ERR', instruction: 'Produce a low-pitched, steady "ERRR" sound, focusing on your root.', benefit: 'Provides deep grounding and stabilizes the lower abdominal energy.', category: 'vagus', resonates: 'Lower Abdomen', referenceHz: 73 },
  { id: 'hum', label: 'Celestial Hum', sound: 'Humming', instruction: 'Close your lips and hum softly, letting the vibration fill your sinuses and head.', benefit: 'Directly stimulates vagal fibers and promotes nitric oxide release for healing.', category: 'vagus', resonates: 'Throat & Sinuses', referenceHz: 128 },
  { id: 'om', label: 'Universal Harmony', sound: 'OM', instruction: 'Chant "A-U-M" slowly, feeling the sound rise from your heart to the crown of your head.', benefit: 'A sacred frequency that harmonizes your entire being with the universe.', category: 'vagus', resonates: 'Chest, Throat & Head', referenceHz: 136.1 },
  { id: 'mmm', label: 'Inner Peace', sound: 'MMM', instruction: 'Sustain a gentle "MMM" sound, focusing on the vibration in your throat.', benefit: 'Soothes the thyroid and parathyroid while calming the mind.', category: 'vagus', resonates: 'Throat & Chest', referenceHz: 98 },
  { id: 'gargle', label: 'Vagal Activation', sound: 'Gargle', instruction: 'Gargle with pure water, making a loud, vigorous sound for 30-60 seconds.', benefit: 'Provides direct physical stimulation to the vagus nerve for rapid regulation.', category: 'vagus', resonates: 'Throat' },
  
  // Six Healing Sounds
  { id: 'si', label: 'Lung Purification', sound: 'SI (Sss)', instruction: 'Exhale with a sharp but controlled "SSSS" sound, visualizing white light.', benefit: 'Releases grief and sadness, replacing them with courage and clarity.', category: 'healing', resonates: 'Lungs', referenceHz: 417 },
  { id: 'chui', label: 'Kidney Restoration', sound: 'CHUI (Chway)', instruction: 'Exhale with a soft "CHWAY" sound, like blowing out a candle.', benefit: 'Transforms fear into deep calmness and ancestral wisdom.', category: 'healing', resonates: 'Kidneys', referenceHz: 396 },
  { id: 'xu', label: 'Liver Renewal', sound: 'XU (Shu)', instruction: 'Make a gentle "SHHHU" sound, visualizing a vibrant green forest.', benefit: 'Releases anger and frustration, inviting kindness and expansion.', category: 'healing', resonates: 'Liver', referenceHz: 639 },
  { id: 'he', label: 'Heart Radiance', sound: 'HE (Her)', instruction: 'Exhale with a soft, warm "HERRR" sound from the back of the throat.', benefit: 'Transforms restlessness and anxiety into pure joy and gratitude.', category: 'healing', resonates: 'Heart', referenceHz: 528 },
  { id: 'hu', label: 'Spleen Balance', sound: 'HU (Hoo)', instruction: 'Produce a deep, guttural "HOOO" sound, feeling it in your stomach.', benefit: 'Aids digestion and transforms worry into centered confidence.', category: 'healing', resonates: 'Spleen & Stomach', referenceHz: 741 },
  { id: 'xi', label: 'Total Integration', sound: 'XI (Shee)', instruction: 'Exhale with a high-pitched "SHEEE" sound, moving energy down the body.', benefit: 'Coordinates the "Triple Burner" systems for total body harmony.', category: 'healing', resonates: 'Whole Torso', referenceHz: 852 },

  // Bija Mantras
  { id: 'lam', label: 'Root Foundation', sound: 'LAM', instruction: 'Chant a deep, resonant "LA-MNG", focusing on the base of your spine.', benefit: 'Establishes a sense of absolute security and physical stability.', category: 'bija', resonates: 'Base of Spine', referenceHz: 256 },
  { id: 'vam', label: 'Sacral Flow', sound: 'VAM', instruction: 'Chant "VA-MNG", feeling the vibration in your lower pelvis.', benefit: 'Clears emotional blocks and enhances creative and vital energy.', category: 'bija', resonates: 'Pelvic Area', referenceHz: 288 },
  { id: 'ram', label: 'Solar Power', sound: 'RAM', instruction: 'Chant a vibrant "RA-MNG", focusing on your solar plexus.', benefit: 'Ignites personal power, willpower, and digestive fire.', category: 'bija', resonates: 'Navel', referenceHz: 320 },
  { id: 'yam', label: 'Heart Compassion', sound: 'YAM', instruction: 'Chant a soft, airy "YA-MNG" from the center of your chest.', benefit: 'Opens the heart to unconditional self-love and empathy for others.', category: 'bija', resonates: 'Heart Center', referenceHz: 341.3 },
  { id: 'ham', label: 'Throat Expression', sound: 'HAM', instruction: 'Chant "HA-MNG", letting the vibration clear your throat.', benefit: 'Enhances communication and helps you speak your authentic truth.', category: 'bija', resonates: 'Throat & Neck', referenceHz: 384 },

  // Vowel Resonances
  { id: 'eee', label: 'Mental Focus', sound: 'EEE', instruction: 'Sustain a high-pitched "EEEE" sound, focusing on your third eye.', benefit: 'Pierces through brain fog to bring sharp mental focus and insight.', category: 'vowel', resonates: 'Head', referenceHz: 480 },
  { id: 'aaa', label: 'Heart Opening', sound: 'AAA', instruction: 'Release a wide, open "AHHH" sound from the chest.', benefit: 'Facilitates emotional release and a deep sense of expansion.', category: 'vowel', resonates: 'Chest', referenceHz: 341.3 },
  { id: 'ooo', label: 'Deep Stability', sound: 'OOO', instruction: 'Sustain a slow, deep "OOOO" sound, feeling it in your core.', benefit: 'Brings immediate stability and anchors you in the present moment.', category: 'vowel', resonates: 'Abdomen', referenceHz: 256 },
  { id: 'why', label: 'Life Cycle', sound: 'WHY', instruction: 'Enunciate "W-H-Y" very slowly, transitioning from OOO to EEE.', benefit: 'A complete respiratory tonic that oxygenates tissues and clears the mind.', category: 'vowel', resonates: 'Full Respiratory System', referenceHz: 256 },
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
  { id: 'test-sound', label: 'System Test', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', category: 'System' }
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
        className="w-full h-full opacity-60 mix-blend-screen"
      />
    </div>
  );
}

function BreathingGuide({ isPlaying }: { isPlaying: boolean }) {
  const [breathText, setBreathText] = useState('Inhale');

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBreathText((prev) => (prev === 'Inhale' ? 'Exhale' : 'Inhale'));
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
            className="absolute text-[12px] sm:text-sm font-mono uppercase tracking-[0.5em] text-white mt-[180px] sm:mt-[300px]"
          >
            {breathText}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
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

  const [mode, setMode] = useState<'frequencies' | 'tapping' | 'timer' | 'haptics' | 'profile' | 'guide' | 'chants' | 'handpan' | 'about' | 'reiki'>('frequencies');
  const [intention, setIntention] = useState(() => getStoredValue('focusflow_intention'));
  const [isMicActive, setIsMicActive] = useState(false);
  const [isReferencePlaying, setIsReferencePlaying] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [activeHaptic, setActiveHaptic] = useState<HapticPattern | null>(null);
  const [isHealingMode, setIsHealingMode] = useState(true);
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

  // Haptics Helper
  const triggerHaptic = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    setStoredValue('focusflow_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    setStoredValue('focusflow_intention', intention);
  }, [intention]);
  
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
  const pannerNode = useRef<PannerNode | null>(null);
  const sonicGainNode = useRef<GainNode | null>(null);
  const reverbNode = useRef<ConvolverNode | GainNode | null>(null);
  const noiseNode = useRef<AudioBufferSourceNode | null>(null);
  const noiseGain = useRef<GainNode | null>(null);
  const spatialInterval = useRef<number | null>(null);
  const analyzer = useRef<AnalyserNode | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const micSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const droneOsc = useRef<OscillatorNode | null>(null);
  const droneGain = useRef<GainNode | null>(null);
  const audioFileElement = useRef<HTMLAudioElement | null>(null);
  const audioFileSource = useRef<MediaElementAudioSourceNode | null>(null);
  const wakeLock = useRef<any>(null);

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

      // Solfeggio Gain (for fading)
      gainNode.current = audioCtx.current.createGain();
      gainNode.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      
      // Spatial Panner
      pannerNode.current = audioCtx.current.createPanner();
      pannerNode.current.panningModel = 'equalpower';
      pannerNode.current.distanceModel = 'inverse';
      
      // Connect Solfeggio chain
      gainNode.current.connect(pannerNode.current);
      pannerNode.current.connect(masterGainNode.current);

      // Sonic Vocalizations Gain
      sonicGainNode.current = audioCtx.current.createGain();
      sonicGainNode.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      sonicGainNode.current.connect(masterGainNode.current);

      // Brownian Noise Gain
      noiseGain.current = audioCtx.current.createGain();
      noiseGain.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
      noiseGain.current.connect(masterGainNode.current);

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
    }
    
    if (audioCtx.current?.state === 'suspended') {
      audioCtx.current.resume();
    }

    return audioCtx.current;
  }, [volume, isMuted]);

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
    if (spatialInterval.current) {
      clearInterval(spatialInterval.current);
      spatialInterval.current = null;
    }

    if (schumannOsc.current) {
      const now = audioCtx.current!.currentTime;
      schumannGain.current!.gain.linearRampToValueAtTime(0, now + 0.5);
      const node = schumannOsc.current;
      setTimeout(() => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      }, 600);
      schumannOsc.current = null;
    }

    if (noiseNode.current) {
      const now = audioCtx.current!.currentTime;
      noiseGain.current!.gain.linearRampToValueAtTime(0, now + 0.5);
      const node = noiseNode.current;
      setTimeout(() => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      }, 600);
      noiseNode.current = null;
    }

    if (oscillator.current) {
      const now = audioCtx.current!.currentTime;
      gainNode.current!.gain.linearRampToValueAtTime(0, now + 0.2);
      if (sonicGainNode.current) {
        sonicGainNode.current.gain.linearRampToValueAtTime(0, now + 0.2);
      }
      
      const osc1 = oscillator.current;
      const osc2 = oscillator2.current;
      const subOsc = (osc1 as any).subOsc;
      const breathSource = (osc1 as any).breathSource;
      const lfo = (osc1 as any).lfo;
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
          if (formants) {
            formants.forEach((f: any) => {
              try { f.filter.disconnect(); f.gain.disconnect(); } catch (e) {}
            });
          }
        } catch (e) {}
      }, 600);
      
      oscillator.current = null;
      oscillator2.current = null;
    }

    if (hasMediaSessionSupport()) {
      navigator.mediaSession.playbackState = 'paused';
    }

    setIsPlaying(false);
    setIsReferencePlaying(false);
    setActiveReferenceId(null);
  }, []);

  const playFrequency = useCallback((freq: Frequency) => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (oscillator.current) {
      stopFrequency();
    }

    const now = ctx.currentTime;

    // Update Media Session
    if (hasMediaSessionSupport() && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${freq.label} (${freq.hz}Hz)`,
        artist: 'FocusFlow',
        album: 'Solfeggio Frequencies',
        artwork: [
          { src: 'https://picsum.photos/seed/focus/512/512', sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.playbackState = 'playing';
    }

    // Oscillator 1 (Left)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    
    // Oscillator 2 (Right)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';

    if (isHealingMode) {
      // Center the binaural beat (6Hz) around the target frequency
      // This ensures the perceived pitch is EXACTLY the Solfeggio frequency
      osc1.frequency.setValueAtTime(freq.hz - 3, now);
      osc2.frequency.setValueAtTime(freq.hz + 3, now);
      
      const merger = ctx.createChannelMerger(2);
      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      
      osc1.connect(g1);
      osc2.connect(g2);
      
      g1.connect(merger, 0, 0); // Left
      g2.connect(merger, 0, 1); // Right
      
      merger.connect(gainNode.current!);
      oscillator2.current = osc2;
      osc2.start();
    } else {
      osc1.frequency.setValueAtTime(freq.hz, now);
      osc1.connect(gainNode.current!);
    }

    // 8D Spatial Animation
    if (isHealingMode && pannerNode.current) {
      let angle = 0;
      spatialInterval.current = window.setInterval(() => {
        if (pannerNode.current) {
          // Subtle movement to avoid breaking binaural beats
          const x = Math.sin(angle) * 2; 
          const z = Math.cos(angle) * 2;
          pannerNode.current.positionX.setValueAtTime(x, ctx.currentTime);
          pannerNode.current.positionZ.setValueAtTime(z, ctx.currentTime);
          angle += 0.015; 
        }
      }, 50);

      // Start Brownian Noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      source.connect(noiseGain.current!);
      source.start();
      noiseNode.current = source;
      noiseGain.current!.gain.setValueAtTime(0, now);
      noiseGain.current!.gain.linearRampToValueAtTime(0.02, now + 2);
    } else if (pannerNode.current) {
      pannerNode.current.positionX.setValueAtTime(0, now);
      pannerNode.current.positionZ.setValueAtTime(0, now);
    }

    gainNode.current!.gain.setValueAtTime(0, now);
    gainNode.current!.gain.linearRampToValueAtTime(0.8, now + 0.2);
    
    // Schumann Resonance (7.83Hz Grounding)
    if (isSchumannActive) {
      const sOsc = ctx.createOscillator();
      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(7.83, now);
      sOsc.connect(schumannGain.current!);
      sOsc.start();
      schumannOsc.current = sOsc;
      schumannGain.current!.gain.setValueAtTime(0, now);
      schumannGain.current!.gain.linearRampToValueAtTime(0.1, now + 2);
    }

    osc1.start();
    oscillator.current = osc1;
    setActiveFreq(freq);
    setIsPlaying(true);
  }, [initAudio, volume, isMuted, stopFrequency, isHealingMode, isSchumannActive]);

  useEffect(() => {
    if (masterGainNode.current && audioCtx.current) {
      const now = audioCtx.current.currentTime;
      const targetGain = isMuted ? 0 : volume;
      masterGainNode.current.gain.linearRampToValueAtTime(targetGain, now + 0.1);
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

  // Wake Lock Logic
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && userProfile.keepScreenOn && isPlaying) {
        try {
          wakeLock.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock.current) {
        await wakeLock.current.release();
        wakeLock.current = null;
      }
    };

    if (isPlaying && userProfile.keepScreenOn) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isPlaying, userProfile.keepScreenOn]);

  // Haptics Helper

  // Haptic Looper
  const hapticInterval = useRef<NodeJS.Timeout | null>(null);

  const stopHaptic = useCallback(() => {
    if (hapticInterval.current) {
      clearInterval(hapticInterval.current);
      hapticInterval.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    setActiveHaptic(null);
  }, []);

  const playHaptic = useCallback((haptic: HapticPattern) => {
    stopHaptic();
    setActiveHaptic(haptic);
    
    const totalDuration = haptic.pattern.reduce((a, b) => a + b, 0);
    
    const run = () => {
      // Physical Haptics
      if ('vibrate' in navigator) {
        navigator.vibrate(haptic.pattern);
      }
      
      // Simulated Audio Haptics (Subtle clicks for desktop)
      if (useSimulatedHaptics || !('vibrate' in navigator)) {
        initAudio();
        if (audioCtx.current) {
          let offset = 0;
          haptic.pattern.forEach((duration, i) => {
            if (i % 2 === 0) { // Vibration part
              const now = audioCtx.current!.currentTime + (offset / 1000);
              const osc = audioCtx.current!.createOscillator();
              const g = audioCtx.current!.createGain();
              
              osc.type = 'sine';
              osc.frequency.setValueAtTime(60, now); // Low thud
              
              g.connect(audioCtx.current!.destination);
              g.gain.setValueAtTime(0, now);
              g.gain.linearRampToValueAtTime(0.05, now + 0.01);
              g.gain.exponentialRampToValueAtTime(0.0001, now + (duration / 1000));
              
              osc.connect(g);
              osc.start(now);
              osc.stop(now + (duration / 1000));
            }
            offset += duration;
          });
        }
      }
    };

    run();
    hapticInterval.current = setInterval(run, totalDuration);
  }, [stopHaptic, useSimulatedHaptics, initAudio]);

  useEffect(() => {
    return () => {
      if (hapticInterval.current) clearInterval(hapticInterval.current);
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
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
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
    breathGain.gain.setValueAtTime(0.08, now);
    
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
    sourceMix.gain.setValueAtTime(0.5, now);
    
    osc1.connect(sourceMix);
    osc2.connect(sourceMix);
    subOsc.connect(sourceMix);
    breathSource.connect(breathGain);
    breathGain.connect(sourceMix);

    const vocalMix = ctx.createGain();
    vocalMix.gain.setValueAtTime(0, now);
    vocalMix.gain.linearRampToValueAtTime(0.8, now + 0.3);

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
    finalFilter.frequency.setValueAtTime(6000, now);

    vocalMix.connect(compressor);
    compressor.connect(finalFilter);
    finalFilter.connect(analyzer.current!);

    if (sonicGainNode.current) {
      finalFilter.connect(sonicGainNode.current);
      sonicGainNode.current.gain.setValueAtTime(0, now);
      sonicGainNode.current.gain.linearRampToValueAtTime(0.6, now + 0.5);
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

  const stopAll = useCallback(() => {
    stopFrequency();
    stopHaptic();
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
    noteGain.gain.linearRampToValueAtTime(0.4, now + 0.005);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    
    // Harmonic Overtones (The "Shimmer")
    const harmonic1 = audioCtx.current.createOscillator();
    harmonic1.type = 'sine';
    harmonic1.frequency.setValueAtTime(freq * 2, now);
    const h1Gain = audioCtx.current.createGain();
    h1Gain.gain.setValueAtTime(0, now);
    h1Gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    h1Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    const harmonic2 = audioCtx.current.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(freq * 3, now);
    const h2Gain = audioCtx.current.createGain();
    h2Gain.gain.setValueAtTime(0, now);
    h2Gain.gain.linearRampToValueAtTime(0.08, now + 0.012);
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
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

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
  }, [initAudio]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto overflow-x-hidden relative bg-black">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000"
          style={{ backgroundColor: activeFreq?.color || '#00ff9d' }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <main className={cn(
        "glass rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 relative",
        isZenMode ? "w-screen h-screen rounded-none fixed inset-0 z-50" : "w-full max-w-4xl h-[95vh] sm:h-[90vh] md:h-[700px] max-h-[900px]"
      )}>
        
        {/* Sidebar Navigation */}
        <nav className={cn(
          "w-full md:w-20 bg-black/40 border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center justify-start md:justify-center gap-1 sm:gap-6 p-1 sm:p-4 transition-all duration-500 overflow-x-auto md:overflow-x-visible no-scrollbar flex-nowrap order-last md:order-first mask-fade-right md:mask-none px-4 md:px-0",
          isZenMode && "opacity-0 pointer-events-none -translate-x-20"
        )}>
          <NavButton 
            active={mode === 'frequencies'} 
            onClick={() => setMode('frequencies')} 
            icon={<Zap size={24} />} 
            label="Frequencies" 
          />
          <NavButton 
            active={mode === 'tapping'} 
            onClick={() => setMode('tapping')} 
            icon={<Fingerprint size={24} />} 
            label="Tapping" 
          />
          <NavButton 
            active={mode === 'timer'} 
            onClick={() => setMode('timer')} 
            icon={<Timer size={24} />} 
            label="Timer" 
          />
          <NavButton 
            active={mode === 'haptics'} 
            onClick={() => setMode('haptics')} 
            icon={<Waves size={24} />} 
            label="Haptics" 
          />
      <NavButton 
            active={mode === 'chants'} 
            onClick={() => setMode('chants')} 
            icon={<Mic size={24} />} 
            label="Chants" 
          />
          <NavButton 
            active={mode === 'handpan'} 
            onClick={() => setMode('handpan')} 
            icon={<Music size={24} />} 
            label="Handpan" 
          />
          <NavButton 
            active={mode === 'reiki'} 
            onClick={() => setMode('reiki')} 
            icon={<Shield size={24} />} 
            label="Reiki" 
          />
          <NavButton 
            active={mode === 'about'} 
            onClick={() => setMode('about')} 
            icon={<Info size={24} />} 
            label="About" 
          />
          <NavButton 
            active={mode === 'profile'} 
            onClick={() => setMode('profile')} 
            icon={<User size={24} />} 
            label="Profile" 
          />
          
          <div className="hidden md:flex flex-col items-center mt-auto pb-4 gap-4">
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

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Immersive Background */}
          <AnimatePresence>
            {((activeFreq && isPlaying) || isMicActive || isAudioPlaying || isReferencePlaying) && (
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
                    isTappingMode={mode === 'tapping'}
                  />
                )}
                <BreathingGuide isPlaying={isPlaying} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <header className={cn(
            "p-4 sm:p-6 border-b border-white/5 flex items-center justify-between transition-all duration-500 z-10",
            isZenMode && "opacity-0 pointer-events-none -translate-y-20"
          )}>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-serif italic tracking-tight">FocusFlow</h1>
              <p className="text-[8px] sm:text-xs text-app-muted font-mono uppercase tracking-widest">Neural Harmony & Focus</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto no-scrollbar flex-nowrap pb-1 sm:pb-0 mask-fade-right sm:mask-none">
              <button 
                onClick={() => setMode('guide')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0",
                  mode === 'guide' ? "bg-app-accent/20 border-app-accent text-app-accent" : "bg-white/5 border-white/10 hover:bg-white/10 text-app-muted"
                )}
              >
                <HelpCircle size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest hidden xs:inline">Guide</span>
              </button>
              {userProfile.preferredFrequencyId && (
                <button 
                  onClick={() => {
                    const freq = SOLFEGGIO_FREQUENCIES.find(f => f.id === userProfile.preferredFrequencyId);
                    if (freq) {
                      if (activeFreq?.id === freq.id && isPlaying) {
                        stopFrequency();
                      } else {
                        playFrequency(freq);
                      }
                      triggerHaptic(20);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0",
                    activeFreq?.id === userProfile.preferredFrequencyId && isPlaying
                      ? "bg-app-accent text-black border-app-accent"
                      : "bg-app-accent/10 border-app-accent/30 text-app-accent hover:bg-app-accent/20"
                  )}
                >
                  <Zap size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Quick Play</span>
                </button>
              )}
              <button 
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shrink-0"
              >
                <Maximize2 size={14} className="text-app-accent" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted hidden xs:inline">Zen</span>
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted">Schumann</span>
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted hidden sm:inline">Healing Mode</span>
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
                className="w-16 sm:w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-app-accent hidden xs:block"
              />
            </div>
          </header>

          {/* Zen Mode Exit Button */}
          {isZenMode && (
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
                {mode === 'chants' && selectedChant && (
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
                {mode === 'frequencies' && activeFreq && isPlaying && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4 text-center"
                  >
                    <span className="text-6xl font-mono font-bold text-app-accent">{activeFreq.hz}Hz</span>
                    <h2 className="text-2xl font-serif italic text-white/80">{activeFreq.label}</h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Dynamic Content */}
          <div className={cn(
            "flex-1 overflow-y-auto p-6 custom-scrollbar transition-all duration-500",
            isZenMode && "opacity-0 pointer-events-none"
          )}>
            <AnimatePresence mode="wait">
              {mode === 'frequencies' && (
                <motion.div 
                  key="freq"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Daily Intention */}
                  <div className="mb-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-app-accent/10 to-transparent border border-app-accent/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles size={16} className="text-app-accent" />
                      <h2 className="text-xs font-mono uppercase tracking-widest text-app-accent font-bold">Session Intention</h2>
                    </div>
                    <input 
                      type="text"
                      placeholder="What is your focus for this healing session? (e.g. Clarity, Grounding, Love)"
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-app-accent/50 transition-colors placeholder:text-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProfile.preferredFrequencyId && (
                      <div className="col-span-full mb-2">
                        <div className="flex items-center gap-2 mb-4">
                          <Star size={14} className="text-app-accent fill-app-accent/20" />
                          <h2 className="text-[10px] font-mono uppercase tracking-widest text-app-accent/80 font-bold">Your Preferred Frequency</h2>
                          <div className="h-px flex-1 bg-app-accent/10" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {SOLFEGGIO_FREQUENCIES.filter(f => f.id === userProfile.preferredFrequencyId).map((f) => (
                            <FrequencyCard 
                              key={`pref-${f.id}`}
                              freq={f}
                              isActive={activeFreq?.id === f.id && isPlaying}
                              isPreferred={true}
                              onSetPreferred={() => {}}
                              onClick={() => {
                                if (activeFreq?.id === f.id && isPlaying) {
                                  stopFrequency();
                                } else {
                                  playFrequency(f);
                                }
                                triggerHaptic(20);
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-8 mb-4">
                          <LayoutGrid size={14} className="text-app-muted" />
                          <h2 className="text-[10px] font-mono uppercase tracking-widest text-app-muted font-bold">All Frequencies</h2>
                          <div className="h-px flex-1 bg-white/5" />
                        </div>
                      </div>
                    )}
                    {SOLFEGGIO_FREQUENCIES.map((f) => (
                      <FrequencyCard 
                        key={f.id}
                        freq={f}
                        isActive={activeFreq?.id === f.id && isPlaying}
                        isPreferred={userProfile.preferredFrequencyId === f.id}
                        onSetPreferred={() => {
                          setUserProfile({ ...userProfile, preferredFrequencyId: f.id });
                          triggerHaptic([30, 50]);
                        }}
                        onClick={() => {
                          if (activeFreq?.id === f.id && isPlaying) {
                            stopFrequency();
                          } else {
                            playFrequency(f);
                          }
                          triggerHaptic(20);
                        }}
                      />
                    ))}
                  </div>
                  <div className="col-span-full mt-4 p-4 rounded-2xl bg-app-accent/5 border border-app-accent/10 flex items-start gap-3">
                    <Info size={16} className="text-app-accent shrink-0 mt-0.5" />
                    <div className="text-[10px] sm:text-xs text-app-muted leading-relaxed">
                      <p className="font-bold text-app-accent mb-1 uppercase tracking-widest">Background Play Enabled</p>
                      <p>FocusFlow uses the Media Session API to keep audio active when your phone is locked or in the background. For uninterrupted sessions, enable **"Keep Screen On"** in your profile settings.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {mode === 'tapping' && (
                <motion.div 
                  key="tapping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col"
                >
                  <TappingView 
                    triggerHaptic={triggerHaptic} 
                    currentIndex={tappingPointIndex}
                    onIndexChange={setTappingPointIndex}
                  />
                </motion.div>
              )}

              {mode === 'timer' && (
                <motion.div 
                  key="timer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex items-center justify-center"
                >
                  <FocusTimerView 
                    triggerHaptic={triggerHaptic} 
                    profile={userProfile}
                    onUpdateProfile={setUserProfile}
                  />
                </motion.div>
              )}

              {mode === 'haptics' && (
                <motion.div 
                  key="haptics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  {!hapticsSupported ? (
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-3">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-1">Desktop Mode: Audio Simulation Active</p>
                        <p className="opacity-80">Physical vibration is usually only available on mobile Chrome (Android/iOS). I've enabled **Audio Simulation** so you can still follow the patterns using subtle low-frequency pulses.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Fingerprint size={16} className="text-app-accent" />
                        <span className="text-xs font-mono uppercase tracking-widest">Audio Simulation</span>
                      </div>
                      <button 
                        onClick={() => setUseSimulatedHaptics(!useSimulatedHaptics)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          useSimulatedHaptics ? "bg-app-accent" : "bg-white/20"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          useSimulatedHaptics ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {HAPTIC_PATTERNS.map((h) => (
                      <HapticCard 
                        key={h.id}
                        haptic={h}
                        isActive={activeHaptic?.id === h.id}
                        isPreferred={userProfile.preferredHapticId === h.id}
                        onSetPreferred={() => {
                          setUserProfile({ ...userProfile, preferredHapticId: h.id });
                          triggerHaptic([30, 50]);
                        }}
                        onClick={() => {
                          if (activeHaptic?.id === h.id) {
                            stopHaptic();
                          } else {
                            playHaptic(h);
                          }
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {mode === 'chants' && (
                <motion.div 
                   key="chants"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
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
                </motion.div>
              )}

              {mode === 'handpan' && (
                <motion.div 
                  key="handpan"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="h-full"
                >
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
                </motion.div>
              )}

              {mode === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <ProfileView 
                    profile={userProfile} 
                    onUpdate={setUserProfile} 
                    triggerHaptic={triggerHaptic}
                  />
                </motion.div>
              )}

              {mode === 'guide' && (
                <motion.div 
                  key="guide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <GuideView />
                </motion.div>
              )}

              {mode === 'about' && (
                <motion.div 
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <AboutView />
                </motion.div>
              )}

              {mode === 'reiki' && (
                <motion.div 
                  key="reiki"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <ReikiView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Status */}
          <footer className={cn(
            "p-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-app-muted transition-all duration-500",
            isZenMode && "opacity-0 pointer-events-none translate-y-20"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", (isPlaying || activeHaptic) ? "bg-app-accent animate-pulse" : "bg-white/20")} />
              {isPlaying ? `Audio: ${activeFreq?.hz}Hz` : activeHaptic ? `Haptic: ${activeHaptic.label}` : 'Engine Idle'}
            </div>
            <div>v1.0.0 // Flow State Optimized</div>
          </footer>
        </div>
      </main>

      {/* Info Tooltip */}
      <div className={cn(
        "mt-8 text-app-muted text-xs flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-500 cursor-help",
        isZenMode && "opacity-0 pointer-events-none"
      )}>
        <Info size={14} />
        <span>Solfeggio frequencies and EFT tapping are used for emotional regulation.</span>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 group shrink-0 min-w-[56px] sm:min-w-[70px] cursor-pointer outline-none pb-1 sm:pb-0",
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
        "text-[8px] sm:text-[10px] font-mono uppercase tracking-tighter font-medium transition-opacity",
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
  // Calculate total duration for the animation loop
  const totalDuration = haptic.pattern.reduce((a, b) => a + b, 0) / 1000;
  
  // Create keyframes for opacity based on the pattern
  // Even indices are vibration (visible), odd are pauses (invisible)
  const times: number[] = [0];
  const values: number[] = [1];
  let currentPos = 0;
  const total = haptic.pattern.reduce((a, b) => a + b, 0);
  
  haptic.pattern.forEach((duration, i) => {
    currentPos += duration;
    times.push(currentPos / total);
    values.push(i % 2 === 0 ? 0 : 1); // If we just finished a vibe, go to 0. If we finished a pause, go to 1.
  });

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
              if ('vibrate' in navigator) navigator.vibrate(haptic.pattern);
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
    <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-8 pb-8 sm:pb-12 select-none">
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

      <div className="flex flex-col items-center gap-4 sm:gap-6">
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
    { id: 'vagus', label: 'Vagus Nerve', icon: <Zap size={14} /> },
    { id: 'healing', label: 'Healing Sounds', icon: <Sparkles size={14} /> },
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
              <span className="text-xl font-serif italic text-white">{selectedChant.label} Target: {selectedChant.referenceHz}Hz</span>
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
                 ? "Perfect Resonance Found" 
                 : "Align your pitch with the target zone")
              : "Detecting Voice..."}
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-serif italic">Sonic Vocalizations</h2>
          <p className="text-xs sm:text-sm text-app-muted">Use your own voice or pre-recorded sounds to stimulate the vagus nerve.</p>
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
                  <span className="text-[10px] font-mono text-app-accent/40">{chant.referenceHz}Hz</span>
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
                  title="Play Reference Tone"
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
                  <span className="text-[10px] font-mono uppercase tracking-widest text-app-muted block mb-2">Benefit</span>
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
                      {isReferencePlaying ? "Stop Reference" : "Play Reference"}
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

function GuideView() {
  return (
    <div className="h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-serif italic mb-1">The FocusFlow Guide</h2>
        <p className="text-sm text-app-muted">Understanding the science and purpose behind your neural harmony tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solfeggio */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={18} className="text-app-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Solfeggio Frequencies</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            Ancient tones used in sacred music and healing. Each frequency is believed to resonate with specific energy centers in the body. For example, 528Hz is known as the "Love Frequency" or "Miracle Tone," often used for DNA repair and clarity.
          </p>
        </section>

        {/* Schumann */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} className="text-amber-500" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Schumann Resonance</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            Often called the "Earth's Heartbeat," this 7.83Hz frequency is the natural electromagnetic resonance of the Earth's atmosphere. It is used for grounding, reducing stress, and synchronizing your biological rhythms with the planet.
          </p>
        </section>

        {/* Healing Mode */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Brain size={18} className="text-blue-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Healing Mode (Binaural)</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            When active, the app sends slightly different frequencies to each ear. Your brain perceives the difference as a third tone—a binaural beat. We use a 6Hz Theta beat, which is associated with deep meditation, creativity, and REM sleep.
          </p>
        </section>

        {/* EFT Tapping */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint size={18} className="text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">EFT Tapping</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            Emotional Freedom Technique involves tapping on specific meridian points while focusing on a stressor. This physical stimulation sends signals to the amygdala (the brain's fear center) to reduce the "fight or flight" response.
          </p>
        </section>

        {/* Visualizer */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Eye size={18} className="text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Sacred Visuals</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            The visualizer uses real-time audio analysis to generate sacred geometry patterns. These visuals are designed to be hypnotic and calming, helping to anchor your focus and facilitate a flow state through visual-auditory synchronization.
          </p>
        </section>

        {/* Zen Mode */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Maximize2 size={18} className="text-white" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Zen Mode</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            Zen Mode removes all interface elements except the core experience. It is designed for deep work or meditation where you want zero distractions. Simply click the icon in the header to enter, and the "minimize" icon to exit.
          </p>
        </section>

        {/* Haptics */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} className="text-app-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Haptic Feedback</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            On mobile devices, haptics provide physical pulses to guide your breathing or grounding. On desktop, we use low-frequency audio pulses to simulate this effect. These patterns help regulate the nervous system by providing a rhythmic physical anchor.
          </p>
        </section>

        {/* Sonic Vocalizations */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Mic size={18} className="text-app-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Sonic Vocalizations</h3>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            Using your own voice is one of the most powerful ways to stimulate the Vagus Nerve. Sounds like "VOO" create deep vibrations in the chest that signal safety to the brainstem. Bija mantras and vowel resonances target specific energy centers to ground or clear your energy.
          </p>
        </section>
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
              Choose **Schumann Resonance** when you feel scattered, anxious, or "out of sync." It provides a steady 7.83Hz anchor that mimics Earth's natural pulse, helping to stabilize your biological clock and reduce environmental stress.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
              <Sparkles size={20} />
            </div>
            <h4 className="font-mono text-xs uppercase tracking-widest">Targeted Healing</h4>
            <p className="text-xs text-app-muted leading-relaxed">
              Choose **Healing Mode (Solfeggio)** when you have a specific emotional or physical intention. Use 528Hz for clarity and repair, or 396Hz to release fear. This mode is best for active meditation and intentional energy work.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Maximize2 size={20} />
            </div>
            <h4 className="font-mono text-xs uppercase tracking-widest">Deep Focus (Zen)</h4>
            <p className="text-xs text-app-muted leading-relaxed">
              Choose **Zen Mode** for deep work or total immersion. It strips away the UI to prevent visual distraction, allowing the auditory and haptic elements to guide you into a flow state without the "clutter" of the interface.
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
              <p className="text-[11px] text-app-muted">Combine **Schumann Resonance** with **Zen Mode** for the ultimate grounding experience. This creates a sensory-deprived environment where your body can fully synchronize with the Earth's pulse.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">The "Vagal Reset" Stack</span>
              <p className="text-[11px] text-app-muted">Activate **Healing Mode** while performing **Sonic Vocalizations**. The external binaural beats provide a reference tone that amplifies the internal vibrations of your own voice, doubling the vagal stimulation.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">The "Emotional Release" Stack</span>
              <p className="text-[11px] text-app-muted">Use **EFT Tapping** while listening to **Solfeggio Frequencies**. Tapping clears the physical stress response while the frequencies provide the energetic resonance needed for emotional transformation.</p>
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
                <span className="text-[10px] text-app-muted">Enable 7.83Hz grounding by default</span>
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

  const handleNotePress = (note: typeof HANDPAN_NOTES[0]) => {
    playNote(note.freq);
    setActiveNote(note.id);
    triggerHaptic(30);
    setTimeout(() => setActiveNote(null), 300);
  };

  const handleExport = () => {
    if (!recordedUrl) return;
    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = `focusflow-handpan-${new Date().getTime()}.webm`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col items-center justify-start sm:justify-center p-4 min-h-[400px] select-none touch-none overflow-y-auto custom-scrollbar">
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
                title="Export WebM"
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
          onClick={() => handleNotePress(HANDPAN_NOTES[0])}
          className={cn(
            "z-20 w-24 h-24 sm:w-44 sm:h-44 rounded-full transition-all duration-300 relative group overflow-hidden outline-none cursor-pointer",
            activeNote === 'ding' ? "bg-app-accent scale-95 shadow-[0_0_50px_rgba(0,255,157,0.4)]" : "bg-zinc-700/50 hover:bg-zinc-600/50 shadow-xl border border-white/5"
          )}
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
              onClick={() => handleNotePress(note)}
              className={cn(
                "absolute z-10 w-12 h-12 sm:w-24 sm:h-24 rounded-full transition-all duration-200 border border-white/10 flex flex-col items-center justify-center gap-1 overflow-hidden outline-none cursor-pointer",
                activeNote === note.id ? "bg-app-accent scale-90 shadow-[0_0_30px_rgba(0,255,157,0.3)]" : "bg-zinc-800/80 hover:bg-zinc-700"
              )}
              style={{
                top: '50%',
                left: '50%',
                marginTop: isMobile ? '-1.5rem' : '-3rem',
                marginLeft: isMobile ? '-1.5rem' : '-3rem',
                transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`
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
              <span className="text-white font-medium italic">FocusFlow</span> (Neuro Harmony) was born from a desire to bridge the gap between spiritual wellness and neurodivergent needs. 
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
            <p className="text-[10px] leading-tight">Mathematically tuned tones to stimulate specific neural pathways.</p>
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
          <h3 className="text-lg font-serif italic text-white">Using Symbols with FocusFlow</h3>
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
