'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { getTagIcon } from '@/components/edit-tag-modal';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '@/types';

interface TaskTagModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function TaskTagModal({ task, open, onOpenChange, onUpdate }: TaskTagModalProps) {
  const { tags } = useAppStore();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task && task.tags) {
      setSelectedTagIds(task.tags.map(t => t.id));
    } else {
      setSelectedTagIds([]);
    }
  }, [task]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_ids: selectedTagIds }),
      });
      toast.success('Tags updated');
      onUpdate();
      onOpenChange(false);
    } catch {
      toast.error('Failed to update tags');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          {(tags || []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No tags available. Create tags in the sidebar first.
            </p>
          ) : (
            (tags || []).map((tag) => {
              const TagIcon = getTagIcon(tag.icon || 'tag');
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="w-full flex items-center justify-between py-1.5 px-3 rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2" style={{ color: tag.color }}>
                    <TagIcon className="w-4 h-4" />
                    <span className="text-sm">{tag.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
