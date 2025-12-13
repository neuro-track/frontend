import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { Note } from '../types';

/**
 * API Client for Supabase integration
 * Handles all backend communication with fallback to localStorage
 */

export class ApiClient {
  /**
   * Check if user is authenticated with Supabase
   */
  async isAuthenticated(): Promise<boolean> {
    if (!isSupabaseEnabled || !supabase) return false;

    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (!isSupabaseEnabled || !supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // ===== NOTES API =====

  /**
   * Fetch all notes for current user
   */
  async fetchNotes(): Promise<Note[]> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Map database format to app format
    return (data || []).map(note => ({
      id: note.id,
      userId: note.user_id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      linkedNodeId: note.linked_lesson_id || undefined,
      linkedCourseId: note.linked_course_id || undefined,
      isPinned: note.is_pinned,
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at),
    }));
  }

  /**
   * Create a new note
   */
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: note.userId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        linked_lesson_id: note.linkedNodeId || null,
        linked_course_id: note.linkedCourseId || null,
        is_pinned: note.isPinned,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      linkedNodeId: data.linked_lesson_id || undefined,
      linkedCourseId: data.linked_course_id || undefined,
      isPinned: data.is_pinned,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'isPinned'>>): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;

    const { error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);

    if (error) throw error;
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }

  // ===== ROADMAPS API =====

  /**
   * Fetch user's roadmap
   */
  async fetchRoadmap(): Promise<any | null> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    if (!data) return null;

    return data.data; // Return the JSONB data field
  }

  /**
   * Save roadmap
   */
  async saveRoadmap(roadmap: any): Promise<void> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if roadmap exists
    const { data: existing } = await supabase
      .from('roadmaps')
      .select('id')
      .eq('id', roadmap.id)
      .single();

    if (existing) {
      // Update existing roadmap
      const { error } = await supabase
        .from('roadmaps')
        .update({
          title: roadmap.title,
          description: roadmap.description,
          data: roadmap,
          total_nodes: roadmap.totalNodes,
          completed_nodes: roadmap.completedNodes,
        })
        .eq('id', roadmap.id);

      if (error) throw error;
    } else {
      // Insert new roadmap
      const { error } = await supabase
        .from('roadmaps')
        .insert({
          id: roadmap.id,
          user_id: user.id,
          title: roadmap.title,
          description: roadmap.description,
          data: roadmap,
          total_nodes: roadmap.totalNodes,
          completed_nodes: roadmap.completedNodes,
        });

      if (error) throw error;
    }
  }

  // ===== SYNC HELPERS =====

  /**
   * Sync localStorage data to Supabase
   */
  async syncToSupabase(localData: {
    notes?: Note[];
    roadmap?: any;
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseEnabled || !supabase) {
      return { success: false, error: 'Supabase not enabled' };
    }

    try {
      // Sync notes
      if (localData.notes && localData.notes.length > 0) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        for (const note of localData.notes) {
          try {
            await this.createNote({
              userId: user.id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              linkedNodeId: note.linkedNodeId,
              linkedCourseId: note.linkedCourseId,
              isPinned: note.isPinned,
            });
          } catch (error) {
            console.error('Error syncing note:', error);
            // Continue with other notes
          }
        }
      }

      // Sync roadmap
      if (localData.roadmap) {
        await this.saveRoadmap(localData.roadmap);
      }

      return { success: true };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export Supabase data to localStorage format
   */
  async exportToLocalStorage(): Promise<{ notes: Note[]; roadmap: any | null }> {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase not enabled');
    }

    const notes = await this.fetchNotes();
    const roadmap = await this.fetchRoadmap();

    return { notes, roadmap };
  }
}

export const apiClient = new ApiClient();
