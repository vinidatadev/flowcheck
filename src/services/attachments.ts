import { supabase } from './supabase'
import type { TaskCommentAttachment } from '@/types/flowcheck'

// Nome do bucket no Supabase Storage — crie com acesso público ou via signed URLs
const BUCKET = 'task-attachments'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

export function isImage(tipo: string): boolean {
  return IMAGE_TYPES.includes(tipo)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileIcon(tipo: string): string {
  if (isImage(tipo)) return '🖼️'
  if (tipo === 'application/pdf') return '📄'
  if (tipo.includes('spreadsheet') || tipo.includes('excel') || tipo === 'text/csv') return '📊'
  if (tipo.includes('word') || tipo.includes('document')) return '📝'
  if (tipo.includes('zip') || tipo.includes('rar') || tipo.includes('7z')) return '🗜️'
  return '📎'
}

export async function uploadAttachment(
  taskId: number,
  commentId: string,
  file: File
): Promise<TaskCommentAttachment> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${taskId}/${commentId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Erro ao enviar arquivo: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return {
    nome: file.name,
    url: data.publicUrl,
    tipo: file.type,
    tamanho: file.size,
  }
}

export async function uploadAttachments(
  taskId: number,
  commentId: string,
  files: File[]
): Promise<TaskCommentAttachment[]> {
  return Promise.all(files.map(f => uploadAttachment(taskId, commentId, f)))
}

export function downloadAttachment(attachment: TaskCommentAttachment): void {
  const a = document.createElement('a')
  a.href = attachment.url
  a.download = attachment.nome
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
