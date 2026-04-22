const { request } = require('../../utils/api')
const {
  getTypeColor,
  getTypeName,
  getStatName,
  getPokemonImageUrl,
  formatPokemonId,
  getStatColor
} = require('../../utils/pokemon')

// Maximum possible base stat value (used for bar width calculation)
const MAX_STAT = 255

Page({
  data: {
    pokemon: null,
    loading: true,
    error: false
  },

  onLoad(options) {
    this.loadPokemon(options.id)
  },

  // ─── Data Loading ────────────────────────────────────────────────────────

  loadPokemon(id) {
    this.setData({ loading: true, error: false })
    const pokemonReq = request(`/pokemon/${id}`)
    const speciesReq = request(`/pokemon-species/${id}`).catch(() => null)

    Promise.all([pokemonReq, speciesReq])
      .then(results => {
        const data = results[0]
        const species = results[1]
        const pokemon = this.formatPokemonDetail(data, species)
        this.setData({ pokemon: pokemon, loading: false })
        wx.setNavigationBarTitle({ title: pokemon.displayName })
      })
      .catch(() => {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' })
        this.setData({ loading: false, error: true })
      })
  },

  // ─── Formatting ──────────────────────────────────────────────────────────

  formatPokemonDetail(data, species) {
    const primaryType = data.types[0].type.name
    const chineseName = species ? this.getChineseName(species) : null
    const description = species ? this.getDescription(species) : ''

    return {
      id: data.id,
      name: data.name,
      displayName: chineseName || data.name,
      chineseName: chineseName,
      formattedId: formatPokemonId(data.id),
      image: getPokemonImageUrl(data.id),
      types: data.types.map(t => ({
        name: t.type.name,
        nameCN: getTypeName(t.type.name),
        color: getTypeColor(t.type.name)
      })),
      typeColor: getTypeColor(primaryType),
      height: (data.height / 10).toFixed(1),
      weight: (data.weight / 10).toFixed(1),
      abilities: data.abilities.map(a => ({
        name: a.ability.name.replace(/-/g, ' '),
        isHidden: a.is_hidden
      })),
      stats: data.stats.map(s => ({
        name: getStatName(s.stat.name),
        value: s.base_stat,
        percentage: Math.min(Math.round((s.base_stat / MAX_STAT) * 100), 100),
        color: getStatColor(s.base_stat)
      })),
      totalStats: data.stats.reduce((sum, s) => sum + s.base_stat, 0),
      description: description
    }
  },

  getChineseName(species) {
    const names = species.names || []
    const cn = names.find(n => n.language.name === 'zh-Hans')
    if (cn) return cn.name
    const ja = names.find(n => n.language.name === 'ja')
    if (ja) return ja.name
    return null
  },

  getDescription(species) {
    const entries = species.flavor_text_entries || []
    // Prefer Simplified Chinese
    const cn = entries.find(e => e.language.name === 'zh-Hans')
    if (cn) return cn.flavor_text.replace(/\f|\n/g, ' ').trim()
    // Fall back to English
    const en = entries.find(e => e.language.name === 'en')
    if (en) return en.flavor_text.replace(/\f|\n/g, ' ').trim()
    return ''
  },

  // ─── Navigation ──────────────────────────────────────────────────────────

  goBack() {
    wx.navigateBack()
  }
})
