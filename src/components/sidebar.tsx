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
import { EditProjectModal } from '@/components/edit-project-modal';
import { EditTagModal, getTagIcon } from '@/components/edit-tag-modal';
import { Plus, MoreHorizontal, Trash2, LogOut, Settings2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Project, Tag } from '@/types';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);

  const isLoadingProjects = currentWorkspaceId && !projects;
  const isLoadingTags = currentWorkspaceId && !tags;

  const handleCreateProject = async () => {
    if (!newProject.trim()) return;
    setCreatingProject(true);
    try {
      await createProject(newProject);
      toast.success('Project created');
      setNewProject('');
      setShowNewProject(false);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    setCreatingTag(true);
    try {
      await createTag(newTag);
      toast.success('Tag created');
      setNewTag('');
      setShowNewTag(false);
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      {/* Workspace Selector - Full Width */}
      <div className="p-3 border-b">
        {!workspaces ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <div className="flex items-center gap-2">
            <Select value={currentWorkspaceId || ''} onValueChange={setCurrentWorkspaceId}>
              <SelectTrigger className="flex-1">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setShowWorkspaceSettings(true)}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Projects Section */}
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
                onKeyDown={(e) => e.key === 'Enter' && !creatingProject && handleCreateProject()}
                autoFocus
                disabled={creatingProject}
              />
              <Button size="sm" onClick={handleCreateProject} disabled={creatingProject}>
                {creatingProject ? '...' : 'Add'}
              </Button>
            </div>
          )}
          
          {isLoadingProjects ? (
            // Skeleton loading for projects
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : (
            <>
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
                      <DropdownMenuItem onClick={() => setEditingProject(project)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteProject(project.id)}
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
            </>
          )}

          <Separator className="my-4" />

          {/* Tags Section */}
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
                onKeyDown={(e) => e.key === 'Enter' && !creatingTag && handleCreateTag()}
                autoFocus
                disabled={creatingTag}
              />
              <Button size="sm" onClick={handleCreateTag} disabled={creatingTag}>
                {creatingTag ? '...' : 'Add'}
              </Button>
            </div>
          )}
          
          {isLoadingTags ? (
            // Skeleton loading for tags
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : (
            <div className="space-y-1">
              {(tags || []).map((tag) => {
                const TagIcon = getTagIcon(tag.icon || 'tag');
                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between py-1 px-2 rounded group"
                    style={{ backgroundColor: tag.color + '15' }}
                  >
                    <div className="flex items-center gap-2" style={{ color: tag.color }}>
                      <TagIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">{tag.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          style={{ color: tag.color }}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingTag(tag)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
              
              {(tags || []).length === 0 && currentWorkspaceId && (
                <p className="text-sm text-muted-foreground py-2">No tags yet</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
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

      {/* Modals */}
      <WorkspaceSettingsModal
        open={showWorkspaceSettings}
        onOpenChange={setShowWorkspaceSettings}
      />

      <EditProjectModal
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
      />

      <EditTagModal
        tag={editingTag}
        open={!!editingTag}
        onOpenChange={(open) => !open && setEditingTag(null)}
      />
    </div>
  );
}
