const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
}

const TYPE_NAMES_CN = {
  normal: '一般',
  fire: '火',
  water: '水',
  electric: '电',
  grass: '草',
  ice: '冰',
  fighting: '格斗',
  poison: '毒',
  ground: '地面',
  flying: '飞行',
  psychic: '超能力',
  bug: '虫',
  rock: '岩石',
  ghost: '幽灵',
  dragon: '龙',
  dark: '恶',
  steel: '钢',
  fairy: '妖精'
}

const STAT_NAMES_CN = {
  hp: 'HP',
  attack: '攻击',
  defense: '防御',
  'special-attack': '特攻',
  'special-defense': '特防',
  speed: '速度'
}

/**
 * Get background color for a Pokémon type
 * @param {string} type
 * @returns {string} hex color
 */
function getTypeColor(type) {
  return TYPE_COLORS[type] || '#A8A77A'
}

/**
 * Get Chinese name for a Pokémon type
 * @param {string} type
 * @returns {string}
 */
function getTypeName(type) {
  return TYPE_NAMES_CN[type] || type
}

/**
 * Get Chinese name for a stat
 * @param {string} stat
 * @returns {string}
 */
function getStatName(stat) {
  return STAT_NAMES_CN[stat] || stat
}

/**
 * Build the official artwork image URL for a Pokémon
 * @param {number} id
 * @returns {string}
 */
function getPokemonImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

/**
 * Format a Pokémon ID as a padded string, e.g. "#001"
 * @param {number} id
 * @returns {string}
 */
function formatPokemonId(id) {
  return `#${String(id).padStart(3, '0')}`
}

/**
 * Return a color based on a stat value
 * @param {number} value
 * @returns {string}
 */
function getStatColor(value) {
  if (value >= 100) return '#4CAF50'
  if (value >= 70) return '#8BC34A'
  if (value >= 45) return '#FFC107'
  return '#FF5722'
}

module.exports = {
  TYPE_COLORS,
  TYPE_NAMES_CN,
  STAT_NAMES_CN,
  getTypeColor,
  getTypeName,
  getStatName,
  getPokemonImageUrl,
  formatPokemonId,
  getStatColor
}
