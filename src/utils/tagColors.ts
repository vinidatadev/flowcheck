/**
 * Utilitários para gerenciar cores dinâmicas das tags
 */

/**
 * Converte hex sem # para hex com #
 */
export function getBackgroundColor(hex: string | null): string {
  if (!hex) return '#e5e7eb' // cor padrão cinza claro
  
  // Remove # se existir e garante que tenha 6 caracteres
  const cleanHex = hex.replace('#', '').padEnd(6, '0')
  return `#${cleanHex}`
}

/**
 * Calcula a luminância de uma cor hex para determinar se é clara ou escura
 */
export function getLuminance(hex: string): number {
  // Remove # se existir
  const cleanHex = hex.replace('#', '')
  
  // Converte para RGB
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255

  // Aplica correção gamma
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // Calcula luminância
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Determina a cor do texto baseada na luminância do fundo
 */
export function getTextColor(hexColor: string | null): string {
  if (!hexColor) return '#1f2937' // texto escuro padrão
  
  const backgroundColor = getBackgroundColor(hexColor)
  const luminance = getLuminance(backgroundColor)
  
  // Se a luminância for maior que 0.5, usar texto escuro, senão texto claro
  return luminance > 0.5 ? '#1f2937' : '#ffffff'
}

/**
 * Escurece uma cor hex em uma porcentagem
 */
export function darkenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '')
  
  const r = parseInt(cleanHex.substr(0, 2), 16)
  const g = parseInt(cleanHex.substr(2, 2), 16)
  const b = parseInt(cleanHex.substr(4, 2), 16)

  const darkenedR = Math.max(0, Math.floor(r * (1 - percent / 100)))
  const darkenedG = Math.max(0, Math.floor(g * (1 - percent / 100)))
  const darkenedB = Math.max(0, Math.floor(b * (1 - percent / 100)))

  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  
  return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`
}

/**
 * Gera estilos CSS para uma tag baseado na cor
 */
export function getTagStyles(color: string | null, type: 'tag' | 'tag_processo' = 'tag') {
  const backgroundColor = getBackgroundColor(color)
  const textColor = getTextColor(color)
  const hoverColor = darkenColor(backgroundColor, 8)
  
  if (type === 'tag_processo') {
    // Tags de processo com background translúcido
    return {
      backgroundColor: `${backgroundColor}26`, // 15% opacity
      color: backgroundColor,
      borderColor: `${backgroundColor}66`, // 40% opacity
      '--hover-bg': `${backgroundColor}40`, // 25% opacity
      '--hover-border': `${backgroundColor}80` // 50% opacity
    }
  }
  
  // Tags normais com background sólido
  return {
    backgroundColor,
    color: textColor,
    borderColor: backgroundColor,
    '--hover-bg': hoverColor,
    '--hover-border': hoverColor
  }
}

/**
 * Encontra a cor de uma tag pelo nome
 */
export function findTagColor(tagName: string, tags: Array<{ tag?: string | null; color?: string | null }>): string | null {
  const foundTag = tags.find(t => t.tag === tagName)
  return foundTag?.color || null
}

/**
 * Encontra a cor de uma tag de processo pelo nome
 */
export function findTagProcessoColor(tagName: string, tags: Array<{ tag_processo?: string | null; color?: string | null }>): string | null {
  const foundTag = tags.find(t => t.tag_processo === tagName)
  return foundTag?.color || null
}