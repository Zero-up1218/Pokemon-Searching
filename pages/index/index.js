const { request } = require('../../utils/api')
const {
  getTypeColor,
  getTypeName,
  getPokemonImageUrl,
  formatPokemonId
} = require('../../utils/pokemon')

const PAGE_SIZE = 20

Page({
  data: {
    pokemonList: [],
    searchQuery: '',
    loading: false,
    loadingMore: false,
    offset: 0,
    hasMore: true,
    searching: false
  },

  onLoad() {
    this.loadPokemonList()
  },

  // ─── Data Loading ────────────────────────────────────────────────────────

  loadPokemonList() {
    if (this.data.loading) return
    this.setData({ loading: true, pokemonList: [], offset: 0, hasMore: true })
    return request(`/pokemon?limit=${PAGE_SIZE}&offset=0`)
      .then(res => this.enrichPokemonList(res.results).then(list => {
        this.setData({
          pokemonList: list,
          offset: PAGE_SIZE,
          hasMore: res.count > PAGE_SIZE,
          loading: false
        })
      }))
      .catch(() => {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' })
        this.setData({ loading: false })
      })
  },

  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore || this.data.searching) return
    this.setData({ loadingMore: true })
    const offset = this.data.offset
    return request(`/pokemon?limit=${PAGE_SIZE}&offset=${offset}`)
      .then(res => this.enrichPokemonList(res.results).then(list => {
        this.setData({
          pokemonList: this.data.pokemonList.concat(list),
          offset: offset + PAGE_SIZE,
          hasMore: offset + PAGE_SIZE < res.count,
          loadingMore: false
        })
      }))
      .catch(() => {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' })
        this.setData({ loadingMore: false })
      })
  },

  enrichPokemonList(results) {
    const promises = results.map(item => {
      const id = this.extractIdFromUrl(item.url)
      return request(`/pokemon/${id}`).then(data => this.formatPokemon(data))
    })
    return Promise.all(promises)
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────

  extractIdFromUrl(url) {
    const parts = url.split('/')
    return parts[parts.length - 2]
  },

  formatPokemon(data) {
    const primaryType = data.types[0].type.name
    return {
      id: data.id,
      name: data.name,
      formattedId: formatPokemonId(data.id),
      image: getPokemonImageUrl(data.id),
      types: data.types.map(t => ({
        name: t.type.name,
        nameCN: getTypeName(t.type.name),
        color: getTypeColor(t.type.name)
      })),
      typeColor: getTypeColor(primaryType)
    }
  },

  // ─── Search ───────────────────────────────────────────────────────────────

  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value })
  },

  onSearchConfirm() {
    const query = this.data.searchQuery.trim().toLowerCase()
    if (!query) {
      this.onSearchClear()
      return
    }
    this.setData({ loading: true, searching: true, pokemonList: [], hasMore: false })
    request(`/pokemon/${query}`)
      .then(data => {
        const pokemon = this.formatPokemon(data)
        this.setData({ pokemonList: [pokemon], loading: false })
      })
      .catch(() => {
        wx.showToast({ title: '未找到该宝可梦', icon: 'none' })
        this.setData({ loading: false, pokemonList: [] })
      })
  },

  onSearchClear() {
    this.setData({ searchQuery: '', searching: false })
    this.loadPokemonList()
  },

  // ─── Navigation ──────────────────────────────────────────────────────────

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  // ─── Scroll ───────────────────────────────────────────────────────────────

  onReachBottom() {
    this.loadMore()
  },

  onPullDownRefresh() {
    this.setData({ searchQuery: '', searching: false })
    this.loadPokemonList().then(() => wx.stopPullDownRefresh())
  }
})
