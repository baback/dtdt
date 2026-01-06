'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useData } from '@/hooks/use-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Settings2 } from 'lucide-react';

interface WorkspaceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceSettingsModal({ open, onOpenChange }: WorkspaceSettingsModalProps) {
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } = useAppStore();
  const { createWorkspace, deleteWorkspace, updateWorkspace, fetchWorkspaces } = useData();
  
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;
    const ws = await createWorkspace(newWorkspaceName.trim());
    if (ws) {
      setCurrentWorkspaceId(ws.id);
    }
    setNewWorkspaceName('');
  };

  const handleDelete = async (id: string) => {
    if ((workspaces || []).length <= 1) return;
    
    await deleteWorkspace(id);
    
    if (currentWorkspaceId === id) {
      const remaining = (workspaces || []).filter(w => w.id !== id);
      if (remaining.length > 0) {
        setCurrentWorkspaceId(remaining[0].id);
      }
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    await updateWorkspace(editingId, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Workspace Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Create New Workspace</label>
            <div className="flex gap-2">
              <Input
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={!newWorkspaceName.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">Your Workspaces</label>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {(workspaces || []).map((ws) => (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    {editingId === ws.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ws.name}</span>
                          {ws.id === currentWorkspaceId && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(ws.id, ws.name)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(ws.id)}
                            disabled={(workspaces || []).length <= 1}
                            title={(workspaces || []).length <= 1 ? "Can't delete the last workspace" : 'Delete workspace'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
