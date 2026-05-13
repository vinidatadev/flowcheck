import { ref, reactive } from 'vue'
import { usersService } from '@/services/users'
import { tagsService } from '@/services/tags'
import { obsProcessoService } from '@/services/obsProcesso'
import type { User } from '@/types/user'
import type { Tag, TagProcesso } from '@/services/tags'
import type { ObsProcesso } from '@/types/flowcheck'

interface MetadataState {
  users: User[]
  tags: Tag[]
  tagsProcesso: TagProcesso[]
  obsProcesso: ObsProcesso[]
  loading: boolean
  error: string | null
}

const state = reactive<MetadataState>({
  users: [],
  tags: [],
  tagsProcesso: [],
  obsProcesso: [],
  loading: false,
  error: null
})

const loaded = ref(false)

export function useMetadata() {
  const loadMetadata = async () => {
    if (loaded.value) return // Carregar apenas uma vez

    try {
      state.loading = true
      state.error = null

      const [users, tags, tagsProcesso, obsProcesso] = await Promise.all([
        usersService.getUsers(),
        tagsService.getTags(),
        tagsService.getTagsProcesso(),
        obsProcessoService.getAll(),
      ])

      state.users = users
      state.tags = tags
      state.tagsProcesso = tagsProcesso
      state.obsProcesso = obsProcesso
      loaded.value = true
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Erro ao carregar metadados'
    } finally {
      state.loading = false
    }
  }

  const getUsersByNames = (names: string[]): User[] => {
    return state.users.filter(user => names.includes(user.nome_usuario || ''))
  }

  const getTagsByNames = (names: string[]): Tag[] => {
    return state.tags.filter(tag => names.includes(tag.tag || ''))
  }

  const getTagsProcessoByNames = (names: string[]): TagProcesso[] => {
    return state.tagsProcesso.filter(tag => names.includes(tag.tag_processo || ''))
  }

  const getTagColor = (tagName: string): string | null => {
    const tag = state.tags.find(t => t.tag === tagName)
    return tag?.color || null
  }

  const getTagProcessoColor = (tagName: string): string | null => {
    const tag = state.tagsProcesso.find(t => t.tag_processo === tagName)
    return tag?.color || null
  }

  const getObsProcessoText = (id: number | null): string | null => {
    if (!id) return null
    return state.obsProcesso.find(o => o.id === id)?.observacao_processo ?? null
  }

  return {
    state,
    loadMetadata,
    getUsersByNames,
    getTagsByNames,
    getTagsProcessoByNames,
    getTagColor,
    getTagProcessoColor,
    getObsProcessoText,
  }}

