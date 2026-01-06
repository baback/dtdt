'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { WorkspaceSettingsModal } from '@/components/workspace-settings-modal';
import { Plus, Tag, MoreHorizontal, Trash2, LogOut, Settings2 } from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    projects,
    tags,
  } = useAppStore();
  const { createProject, createTag, deleteProject, deleteTag } = useData();
  
  const [newProject, setNewProject] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);

  const handleCreateProject = async () => {
    if (!newProject.trim()) return;
    await createProject(newProject);
    setNewProject('');
    setShowNewProject(false);
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    await createTag(newTag);
    setNewTag('');
    setShowNewTag(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">DTDT</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowWorkspaceSettings(true)}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
        <Select value={currentWorkspaceId || ''} onValueChange={setCurrentWorkspaceId}>
          <SelectTrigger>
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            {(workspaces || []).map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Projects</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNewProject(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {showNewProject && (
            <div className="mb-2 flex gap-2">
              <Input
                placeholder="Project name"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                autoFocus
              />
              <Button size="sm" onClick={handleCreateProject}>Add</Button>
            </div>
          )}
          
          {(projects || []).map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-sm">{project.name}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          {(projects || []).length === 0 && currentWorkspaceId && (
            <p className="text-sm text-muted-foreground py-2">No projects yet</p>
          )}

          <Separator className="my-4" />

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Tags</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNewTag(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {showNewTag && (
            <div className="mb-2 flex gap-2">
              <Input
                placeholder="Tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                autoFocus
              />
              <Button size="sm" onClick={handleCreateTag}>Add</Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {(tags || []).map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs group"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
                <button
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={() => deleteTag(tag.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {(tags || []).length === 0 && currentWorkspaceId && (
            <p className="text-sm text-muted-foreground py-2">No tags yet</p>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <WorkspaceSettingsModal
        open={showWorkspaceSettings}
        onOpenChange={setShowWorkspaceSettings}
      />
    </div>
  );
}
