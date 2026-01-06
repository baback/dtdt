'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';
import type { Project } from '@/types';

interface TaskTemplate {
  id: string;
  project_id: string;
  title: string;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

interface EditProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectModal({ project, open, onOpenChange }: EditProjectModalProps) {
  const { updateProject } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [addingTemplate, setAddingTemplate] = useState(false);

  useEffect(() => {
    if (project && open) {
      setName(project.name);
      setColor(project.color);
      fetchTemplates(project.id);
    }
  }, [project, open]);

  const fetchTemplates = async (projectId: string) => {
    setLoadingTemplates(true);
    try {
      const res = await fetch(`/api/task-templates?project_id=${projectId}`);
      const data = await res.json();
      setTemplates(data);
    } catch {
      console.error('Failed to fetch templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const addTemplate = async () => {
    if (!project || !newTemplate.trim()) return;
    setAddingTemplate(true);
    try {
      const res = await fetch('/api/task-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, title: newTemplate.trim() }),
      });
      const template = await res.json();
      setTemplates([...templates, template]);
      setNewTemplate('');
      toast.success('Template added');
    } catch {
      toast.error('Failed to add template');
    } finally {
      setAddingTemplate(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await fetch(`/api/task-templates/${id}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template removed');
    } catch {
      toast.error('Failed to remove template');
    }
  };

  const handleSave = async () => {
    if (!project || !name.trim()) return;
    setSaving(true);
    try {
      await updateProject(project.id, name.trim(), color);
      toast.success('Project updated');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 py-4 pr-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
              />
            </div>

            {/* Color */}
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

            <Separator />

            {/* Task Templates */}
            <div className="space-y-2">
              <Label>Quick Tasks</Label>
              <p className="text-xs text-muted-foreground">
                Add repetitive tasks that you can quickly select when adding tasks to this project.
              </p>
              
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-1">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50 group"
                    >
                      <span className="text-sm">{template.title}</span>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        title="Remove template"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {templates.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No quick tasks yet</p>
                  )}
                </div>
              )}

              {/* Add new template */}
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  placeholder="Add quick task..."
                  onKeyDown={(e) => e.key === 'Enter' && !addingTemplate && addTemplate()}
                  disabled={addingTemplate}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={addTemplate}
                  disabled={!newTemplate.trim() || addingTemplate}
                >
                  {addingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-2">
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
