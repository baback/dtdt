'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';
import { Check } from 'lucide-react';

interface ProjectSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId: string | null;
  onSelect: (projectId: string | null) => void;
}

export function ProjectSelectModal({ open, onOpenChange, currentProjectId, onSelect }: ProjectSelectModalProps) {
  const { projects } = useAppStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          <button
            onClick={() => onSelect(null)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors ${
              !currentProjectId ? 'bg-muted' : ''
            }`}
          >
            <span className="text-muted-foreground">No project</span>
            {!currentProjectId && <Check className="w-4 h-4 text-primary" />}
          </button>
          
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelect(project.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors ${
                currentProjectId === project.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: project.color }}
                />
                <span>{project.name}</span>
              </div>
              {currentProjectId === project.id && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
