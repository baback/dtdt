'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import {
  Tag, Megaphone, Target, Zap, Star, Heart, Bookmark, Flag,
  Bell, Calendar, Clock, Mail, MessageSquare, Phone, Send,
  Users, User, Settings, Search, Home, Globe, Link, Lock,
  Unlock, Eye, EyeOff, Check, X, Plus, Minus, Edit, Trash2,
  Download, Upload, Share, Copy, Clipboard, File, Folder,
  Image, Video, Music, Mic, Camera, Monitor, Smartphone,
  Laptop, Tablet, Wifi, Bluetooth, Battery, Power, Sun, Moon,
  Cloud, CloudRain, Umbrella, Wind, Thermometer, Map, MapPin,
  Navigation, Compass, Car, Plane, Train, Ship, Bike, Bus,
  Coffee, Pizza, Apple, Cake, Gift, ShoppingCart, ShoppingBag,
  CreditCard, DollarSign, Percent, TrendingUp, TrendingDown,
  BarChart, PieChart, Activity, Award, Trophy, Medal, Crown,
  Gem, Diamond, Sparkles, Flame, Rocket, Lightbulb, Key,
  Shield, AlertTriangle, AlertCircle, Info, HelpCircle, Hash
} from 'lucide-react';
import type { Tag as TagType } from '@/types';

const ICONS = [
  { name: 'tag', Icon: Tag },
  { name: 'megaphone', Icon: Megaphone },
  { name: 'target', Icon: Target },
  { name: 'zap', Icon: Zap },
  { name: 'star', Icon: Star },
  { name: 'heart', Icon: Heart },
  { name: 'bookmark', Icon: Bookmark },
  { name: 'flag', Icon: Flag },
  { name: 'bell', Icon: Bell },
  { name: 'calendar', Icon: Calendar },
  { name: 'clock', Icon: Clock },
  { name: 'mail', Icon: Mail },
  { name: 'message-square', Icon: MessageSquare },
  { name: 'phone', Icon: Phone },
  { name: 'send', Icon: Send },
  { name: 'users', Icon: Users },
  { name: 'user', Icon: User },
  { name: 'settings', Icon: Settings },
  { name: 'search', Icon: Search },
  { name: 'home', Icon: Home },
  { name: 'globe', Icon: Globe },
  { name: 'link', Icon: Link },
  { name: 'lock', Icon: Lock },
  { name: 'unlock', Icon: Unlock },
  { name: 'eye', Icon: Eye },
  { name: 'check', Icon: Check },
  { name: 'x', Icon: X },
  { name: 'plus', Icon: Plus },
  { name: 'minus', Icon: Minus },
  { name: 'edit', Icon: Edit },
  { name: 'trash', Icon: Trash2 },
  { name: 'download', Icon: Download },
  { name: 'upload', Icon: Upload },
  { name: 'share', Icon: Share },
  { name: 'copy', Icon: Copy },
  { name: 'clipboard', Icon: Clipboard },
  { name: 'file', Icon: File },
  { name: 'folder', Icon: Folder },
  { name: 'image', Icon: Image },
  { name: 'video', Icon: Video },
  { name: 'music', Icon: Music },
  { name: 'mic', Icon: Mic },
  { name: 'camera', Icon: Camera },
  { name: 'monitor', Icon: Monitor },
  { name: 'smartphone', Icon: Smartphone },
  { name: 'laptop', Icon: Laptop },
  { name: 'coffee', Icon: Coffee },
  { name: 'gift', Icon: Gift },
  { name: 'shopping-cart', Icon: ShoppingCart },
  { name: 'credit-card', Icon: CreditCard },
  { name: 'dollar-sign', Icon: DollarSign },
  { name: 'trending-up', Icon: TrendingUp },
  { name: 'bar-chart', Icon: BarChart },
  { name: 'activity', Icon: Activity },
  { name: 'award', Icon: Award },
  { name: 'trophy', Icon: Trophy },
  { name: 'crown', Icon: Crown },
  { name: 'gem', Icon: Gem },
  { name: 'sparkles', Icon: Sparkles },
  { name: 'flame', Icon: Flame },
  { name: 'rocket', Icon: Rocket },
  { name: 'lightbulb', Icon: Lightbulb },
  { name: 'key', Icon: Key },
  { name: 'shield', Icon: Shield },
  { name: 'alert-triangle', Icon: AlertTriangle },
  { name: 'info', Icon: Info },
  { name: 'hash', Icon: Hash },
];

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

interface EditTagModalProps {
  tag: TagType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTagModal({ tag, open, onOpenChange }: EditTagModalProps) {
  const { updateTag } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [icon, setIcon] = useState('tag');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
      setIcon(tag.icon || 'tag');
    }
  }, [tag]);

  const handleSave = async () => {
    if (!tag || !name.trim()) return;
    setSaving(true);
    try {
      await updateTag(tag.id, name.trim(), color, icon);
      toast.success('Tag updated');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update tag');
    } finally {
      setSaving(false);
    }
  };

  const SelectedIcon = ICONS.find(i => i.name === icon)?.Icon || Tag;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
            />
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm"
              style={{ backgroundColor: color + '15', color: color }}
            >
              <SelectedIcon className="w-3.5 h-3.5" />
              {name || 'Tag name'}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={`Select color ${c}`}
                  className={`w-7 h-7 rounded-md border-2 transition-all ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              <div className="grid grid-cols-8 gap-1">
                {ICONS.map(({ name: iconName, Icon }) => (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                      icon === iconName ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIcon(iconName)}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to get icon component by name
export function getTagIcon(iconName: string) {
  return ICONS.find(i => i.name === iconName)?.Icon || Tag;
}
