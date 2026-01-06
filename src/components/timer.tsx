'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, RotateCcw, Volume2, VolumeX, PictureInPicture2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_TIMES = [
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
  { label: '90m', minutes: 90 },
];

// Sound definitions using Web Audio API
const SOUNDS = [
  { id: 'bell', name: 'Bell', freq: 800, type: 'sine' as OscillatorType, duration: 0.5 },
  { id: 'chime', name: 'Chime', freq: 1200, type: 'sine' as OscillatorType, duration: 0.8 },
  { id: 'ding', name: 'Ding', freq: 600, type: 'triangle' as OscillatorType, duration: 0.3 },
  { id: 'beep', name: 'Beep', freq: 440, type: 'square' as OscillatorType, duration: 0.2 },
  { id: 'soft', name: 'Soft', freq: 400, type: 'sine' as OscillatorType, duration: 1.0 },
  { id: 'alert', name: 'Alert', freq: 1000, type: 'sawtooth' as OscillatorType, duration: 0.4 },
];

export function Timer() {
  const {
    timerDuration,
    timerRemaining,
    timerRunning,
    setTimerDuration,
    setTimerRemaining,
    setTimerRunning,
    resetTimer,
  } = useAppStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('bell');
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      setIsPipSupported(true);
    }
  }, []);

  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerRemaining(timerRemaining - 1);
      }, 1000);
    } else if (timerRemaining === 0 && timerRunning) {
      setTimerRunning(false);
      if (soundEnabled) {
        playSound(selectedSound);
      }
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', { body: 'Your focus session has ended.' });
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerRunning, timerRemaining, setTimerRemaining, setTimerRunning, soundEnabled, selectedSound]);

  useEffect(() => {
    if (isPipActive && pipWindowRef.current) {
      updatePipContent();
    }
  }, [timerRemaining, timerRunning, isPipActive]);

  const playSound = (soundId: string) => {
    if (typeof window === 'undefined') return;
    
    const sound = SOUNDS.find(s => s.id === soundId);
    if (!sound) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = sound.freq;
      oscillator.type = sound.type;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  };

  const handleSoundChange = (soundId: string) => {
    setSelectedSound(soundId);
    playSound(soundId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (minutes: number) => {
    setTimerDuration(minutes * 60);
    setShowCustomInput(false);
  };

  const handleCustomTime = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 180) {
      setTimerDuration(mins * 60);
      setShowCustomInput(false);
      setCustomMinutes('');
    }
  };

  const requestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const progress = ((timerDuration - timerRemaining) / timerDuration) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const currentMinutes = Math.ceil(timerDuration / 60);
  const isPreset = PRESET_TIMES.some(p => p.minutes * 60 === timerDuration);

  const updatePipContent = () => {
    if (!pipWindowRef.current) return;
    
    const doc = pipWindowRef.current.document;
    const timeEl = doc.getElementById('pip-time');
    const progressEl = doc.getElementById('pip-progress');
    const playBtn = doc.getElementById('pip-play');
    const pauseBtn = doc.getElementById('pip-pause');
    
    if (timeEl) timeEl.textContent = formatTime(timerRemaining);
    if (progressEl) {
      const pipProgress = ((timerDuration - timerRemaining) / timerDuration) * 100;
      progressEl.style.width = `${pipProgress}%`;
    }
    if (playBtn && pauseBtn) {
      playBtn.style.display = timerRunning ? 'none' : 'flex';
      pauseBtn.style.display = timerRunning ? 'flex' : 'none';
    }
  };

  const openPip = async () => {
    if (!('documentPictureInPicture' in window)) return;
    
    try {
      // @ts-ignore
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 180,
      });
      
      pipWindowRef.current = pipWindow;
      setIsPipActive(true);

      const style = pipWindow.document.createElement('style');
      style.textContent = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 8px;
          user-select: none;
          overflow: hidden;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .time {
          font-size: clamp(24px, 15vw, 64px);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: clamp(4px, 2vh, 12px);
        }
        .progress-bar {
          width: 90%;
          max-width: 280px;
          height: clamp(3px, 1.5vh, 6px);
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: clamp(6px, 3vh, 16px);
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 1s linear;
        }
        .controls {
          display: flex;
          gap: clamp(6px, 2vw, 12px);
        }
        button {
          width: clamp(28px, 12vw, 44px);
          height: clamp(28px, 12vw, 44px);
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        button:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.05);
        }
        button svg {
          width: clamp(12px, 5vw, 20px);
          height: clamp(12px, 5vw, 20px);
        }
        .label {
          font-size: clamp(8px, 3vw, 11px);
          color: rgba(255,255,255,0.5);
          margin-bottom: clamp(2px, 1vh, 4px);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        @media (max-height: 100px) {
          .label { display: none; }
          .progress-bar { display: none; }
          .controls { display: none; }
          body { padding: 4px; }
          .time { margin-bottom: 0; }
        }
        @media (max-height: 140px) {
          .label { display: none; }
          .controls { margin-top: auto; }
        }
        @media (max-width: 150px) {
          .controls { gap: 4px; }
          button { width: 24px; height: 24px; }
          button svg { width: 10px; height: 10px; }
        }
      `;
      pipWindow.document.head.appendChild(style);

      pipWindow.document.body.innerHTML = `
        <div class="container">
          <div class="label">Focus Timer</div>
          <div class="time" id="pip-time">${formatTime(timerRemaining)}</div>
          <div class="progress-bar">
            <div class="progress-fill" id="pip-progress" style="width: ${progress}%"></div>
          </div>
          <div class="controls">
            <button id="pip-play" style="display: ${timerRunning ? 'none' : 'flex'}">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button id="pip-pause" style="display: ${timerRunning ? 'flex' : 'none'}">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button id="pip-reset">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            </button>
          </div>
        </div>
      `;

      pipWindow.document.getElementById('pip-play')?.addEventListener('click', () => {
        setTimerRunning(true);
      });
      pipWindow.document.getElementById('pip-pause')?.addEventListener('click', () => {
        setTimerRunning(false);
      });
      pipWindow.document.getElementById('pip-reset')?.addEventListener('click', () => {
        resetTimer();
      });

      pipWindow.addEventListener('pagehide', () => {
        pipWindowRef.current = null;
        setIsPipActive(false);
      });
    } catch (error) {
      console.error('Failed to open PiP:', error);
    }
  };

  const closePip = () => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
      setIsPipActive(false);
    }
  };

  return (
    <div className="border rounded-xl p-5 bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Focus Timer</h3>
        <div className="flex items-center gap-2">
          {isPipSupported && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={isPipActive ? closePip : openPip}
              title={isPipActive ? 'Close mini player' : 'Open mini player'}
            >
              {isPipActive ? <X className="w-4 h-4" /> : <PictureInPicture2 className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-primary transition-all duration-1000"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-bold tabular-nums">
              {formatTime(timerRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <Button
          variant={timerRunning ? 'secondary' : 'default'}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={() => setTimerRunning(!timerRunning)}
        >
          {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={resetTimer}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Time Presets */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4">
        <div className="text-xs text-muted-foreground mb-2 text-center">Duration</div>
        <div className="grid grid-cols-3 gap-1 mb-2">
          {PRESET_TIMES.map(({ label, minutes }) => (
            <Button
              key={minutes}
              variant={timerDuration === minutes * 60 ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 text-xs font-medium',
                timerDuration === minutes * 60 && 'shadow-sm'
              )}
              onClick={() => handleDurationChange(minutes)}
            >
              {label}
            </Button>
          ))}
          <Button
            variant={!isPreset ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-8 text-xs font-medium',
              !isPreset && 'shadow-sm'
            )}
            onClick={() => setShowCustomInput(!showCustomInput)}
          >
            {!isPreset ? `${currentMinutes}m` : 'Custom'}
          </Button>
        </div>
        
        {showCustomInput && (
          <div className="flex gap-2 mt-2">
            <Input
              type="number"
              placeholder="Minutes"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomTime()}
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8" onClick={handleCustomTime}>
              Set
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Sound Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm">Sound</span>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </div>
        
        {soundEnabled && (
          <Select value={selectedSound} onValueChange={handleSoundChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select sound" />
            </SelectTrigger>
            <SelectContent>
              {SOUNDS.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  {sound.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground"
          onClick={requestNotificationPermission}
        >
          Enable notifications
        </Button>
      </div>
    </div>
  );
}
