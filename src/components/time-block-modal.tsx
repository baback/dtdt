'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { DayBlock } from '@/types';

interface TimeBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: DayBlock | null;
  allBlocks: DayBlock[];
  onSave: (blocks: DayBlock[]) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

function formatHour(hour: number): string {
  if (hour === 12) return '12:00 PM';
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
}

export function TimeBlockModal({ open, onOpenChange, block, allBlocks, onSave }: TimeBlockModalProps) {
  const [editedBlocks, setEditedBlocks] = useState<DayBlock[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && allBlocks.length > 0) {
      setEditedBlocks([...allBlocks].sort((a, b) => a.start_hour - b.start_hour));
      setError(null);
    }
  }, [open, allBlocks]);

  const updateBlockTime = (blockId: string, field: 'start_hour' | 'end_hour', value: number) => {
    setError(null);
    const blockIndex = editedBlocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...editedBlocks];
    const currentBlock = { ...newBlocks[blockIndex] };

    if (field === 'start_hour') {
      // Adjust previous block's end time
      if (blockIndex > 0) {
        newBlocks[blockIndex - 1] = {
          ...newBlocks[blockIndex - 1],
          end_hour: value
        };
      }
      currentBlock.start_hour = value;
    } else {
      // Adjust next block's start time
      if (blockIndex < newBlocks.length - 1) {
        newBlocks[blockIndex + 1] = {
          ...newBlocks[blockIndex + 1],
          start_hour: value
        };
      }
      currentBlock.end_hour = value;
    }

    newBlocks[blockIndex] = currentBlock;
    setEditedBlocks(newBlocks);
  };

  const validateAndSave = () => {
    // Validate blocks
    for (let i = 0; i < editedBlocks.length; i++) {
      const block = editedBlocks[i];
      
      // Check start < end
      if (block.start_hour >= block.end_hour) {
        setError(`Block ${i + 1}: Start time must be before end time`);
        return;
      }

      // Check continuity with next block
      if (i < editedBlocks.length - 1) {
        if (block.end_hour !== editedBlocks[i + 1].start_hour) {
          setError('Blocks must be continuous with no gaps');
          return;
        }
      }
    }

    onSave(editedBlocks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Time Blocks</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {editedBlocks.map((b, index) => (
            <div
              key={b.id}
              className={`p-3 rounded-lg border ${b.id === block?.id ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: b.project_color || '#666' }}
                />
                <span className="text-sm font-medium">
                  {b.project_name || 'No project'}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Start</Label>
                  <Select
                    value={b.start_hour.toString()}
                    onValueChange={(v) => updateBlockTime(b.id, 'start_hour', parseInt(v))}
                    disabled={index === 0} // First block start is fixed
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                          {formatHour(h)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">End</Label>
                  <Select
                    value={b.end_hour.toString()}
                    onValueChange={(v) => updateBlockTime(b.id, 'end_hour', parseInt(v))}
                    disabled={index === editedBlocks.length - 1} // Last block end is fixed
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                          {formatHour(h)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={validateAndSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
