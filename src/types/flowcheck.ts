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
  comentarios: string[] | null
  percenti_concluido: number | null
  ganhos: string | null
  projeto: boolean | null
  pos_s4hana: boolean | null
  criado_por: string | null
  modificado_por: string | null
  display_order: number | null
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