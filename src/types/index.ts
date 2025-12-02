export interface User {
  id: string
  email: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  status: 'editing' | 'generating' | 'done'
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  project_id: string
  description: string
  reference_image_url?: string
  images?: string[]
  created_at: string
}

export interface Storyboard {
  id: string
  project_id: string
  page_index: number
  description: string
  created_at: string
}

export interface Page {
  id: string
  project_id: string
  page_index: number
  image_url?: string
  status: 'pending' | 'generating' | 'done' | 'error'
  created_at: string
  updated_at: string
}

export interface ProjectWithDetails extends Project {
  character?: Character
  storyboards?: Storyboard[]
  pages?: Page[]
}