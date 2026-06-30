export interface Bucket {
  id: number
  created_at: string
  bucket: string | null
  descrição: string | null
  abrev: string | null
  nivel: number | null
}

export interface Category {
  id: number
  created_at: string
  category: string | null
  id_bucket: number | null
}

export interface TaskCommentAttachment {
  nome: string        // nome original do arquivo
  url: string         // URL pública no Storage
  tipo: string        // MIME type
  tamanho: number     // bytes
}

export interface TaskComment {
  id: string            // uuid gerado no cliente
  texto: string
  autor_nome: string
  autor_foto: string | null
  criado_em: string     // ISO timestamp
  anexos?: TaskCommentAttachment[]
}

export interface Task {
  id: number
  created_at: string
  titulo_task: string | null
  descricao: string | null
  id_bucket: number | null
  id_category: number | null
  tag: string[] | null
  tag_processo: string[] | null
  responsavel: string[] | null
  data_inicio: string | null
  data_fim: string | null
  prioridade: boolean | null
  status_concluido: boolean | null
  subtask: string[] | null
  subtask_bool: boolean[] | null
  solicitante: string[] | null
  comentarios: TaskComment[] | null
  percenti_concluido: number | null
  ganhos: string | null
  projeto: boolean | null
  pos_s4hana: boolean | null
  criado_por: string | null
  modificado_por: string | null
  display_order: number | null
  id_obs_processo: number | null
  anexo_task: string[] | null
}

export interface TaskFormData {
  titulo_task: string
  descricao: string
  prioridade: boolean
  percenti_concluido: number
  tag: string[]
  tag_processo: string[]
  responsavel: string[]
  data_inicio: string | null
  data_fim: string | null
  subtask: string[]
  subtask_bool: boolean[]
  solicitante: string[]
  ganhos: string
  projeto: boolean
  pos_s4hana: boolean
  id_obs_processo: number | null
}

export interface ObsProcesso {
  id: number
  created_at: string
  observacao_processo: string | null
}

export interface TaskWithContext extends Task {
  bucketName: string
  categoryName: string
}

export interface FlowCheckState {
  buckets: Bucket[]
  selectedBucket: Bucket | null
  categories: Category[]
  tasks: Task[]
  loading: boolean
  error: string | null
}