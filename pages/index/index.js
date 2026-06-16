// pages/index/index.js
// 首页 - 集成 API 数据加载

const app = getApp();

Page({
  data: {
    isFilter: '',
    filter: '',
    spriteList: [],
    pageNo: 0,
    pageSize: 50,
    maxPageNo: 19,
    isLoading: false,
    useAPI: true,
    error: null
  },

  onShareAppMessage: function (e) {
  },

  onLoad: function (options) {
    this.isLoading = true;
    
    wx.showLoading({
      mask: true,
      title: '数据加载中'
    });

    if (options.isFilter && options.filter) {
      // 筛选后的列表 - 使用 API
      this.loadFilteredList(JSON.parse(options.filter), options.isFilter);
    } else {
      // 未筛选的列表 - 优先使用 API
      this.loadInitialList();
    }
  },

  /**
   * 加载初始列表
   */
  loadInitialList: function () {
    // 优先尝试从 API 加载
    app.globalObject.getPokemonList(1000, 0)
      .then((data) => {
        if (data && data.results) {
          // 从 API 结果中提取 ID 并加载详细信息
          this.loadPokemonDetails(data.results);
        } else {
          this.useLocalData();
        }
      })
      .catch((err) => {
        console.warn('API list load failed, using local data:', err);
        this.useLocalData();
      });
  },

  /**
   * 使用本地数据
   */
  useLocalData: function () {
    this.filterList = app.globalObject.spriteList;
    var last = this.data.pageNo * this.data.pageSize + this.data.pageSize - 1;
    this.setData({
      spriteList: this.filterList.slice(0, last),
      isFilter: '',
      filter: '',
      maxPageNo: Math.ceil(this.filterList.length / this.data.pageSize),
      useAPI: false
    });
    wx.hideLoading();
    this.isLoading = false;
  },

  /**
   * 从 API 结果加载详细信息
   */
  loadPokemonDetails: function (pokemonList) {
    const results = [];
    let loadedCount = 0;

    pokemonList.slice(0, 100).forEach((pokemon, index) => {
      app.globalObject.getPokemonFromAPI(pokemon.name)
        .then((detail) => {
          results.push(detail);
          loadedCount++;

          // 当加载完成时更新列表
          if (loadedCount === Math.min(pokemonList.length, 100)) {
            this.filterList = results;
            var last = this.data.pageNo * this.data.pageSize + this.data.pageSize - 1;
            this.setData({
              spriteList: this.filterList.slice(0, last),
              isFilter: '',
              filter: '',
              maxPageNo: Math.ceil(this.filterList.length / this.data.pageSize),
              useAPI: true
            });
            wx.hideLoading();
            this.isLoading = false;
          }
        })
        .catch(() => {
          loadedCount++;
          // 继续加载，即使个别失败
          if (loadedCount === Math.min(pokemonList.length, 100)) {
            if (results.length === 0) {
              this.useLocalData();
            } else {
              this.filterList = results;
              var last = this.data.pageNo * this.data.pageSize + this.data.pageSize - 1;
              this.setData({
                spriteList: this.filterList.slice(0, last),
                isFilter: '',
                filter: '',
                maxPageNo: Math.ceil(this.filterList.length / this.data.pageSize),
                useAPI: true
              });
              wx.hideLoading();
              this.isLoading = false;
            }
          }
        });
    });
  },

  /**
   * 加载筛选列表
   */
  loadFilteredList: function (filterObj, isFilter) {
    app.globalObject.filterAsync(filterObj)
      .then((results) => {
        this.filterList = results || [];
        var last = this.data.pageNo * this.data.pageSize + this.data.pageSize - 1;
        this.setData({
          spriteList: this.filterList.slice(0, last),
          isFilter: isFilter,
          filter: JSON.stringify(filterObj),
          maxPageNo: Math.ceil(this.filterList.length / this.data.pageSize)
        });
        wx.hideLoading();
        this.isLoading = false;
      })
      .catch((err) => {
        console.warn('Filter failed, using local data:', err);
        // 降级到本地过滤
        this.filterList = app.globalObject.filter(filterObj);
        var last = this.data.pageNo * this.data.pageSize + this.data.pageSize - 1;
        this.setData({
          spriteList: this.filterList.slice(0, last),
          isFilter: isFilter,
          filter: JSON.stringify(filterObj),
          maxPageNo: Math.ceil(this.filterList.length / this.data.pageSize)
        });
        wx.hideLoading();
        this.isLoading = false;
      });
  },

  onReady: function () {
    wx.hideLoading();
    this.isLoading = false;
    this.windowHeight = wx.getSystemInfoSync().windowHeight;
    this.scrollList = [];
  },

  onScroll: function (e) {
    if (this.data.pageNo >= this.data.maxPageNo) return;
    if (this.isLoading) return;

    var detail = e.detail;
    if (!this.scrollHeight) {
      this.scrollHeight = detail.scrollHeight;
    } else if (this.scrollHeight != detail.scrollHeight) {
      this.scrollHeight = detail.scrollHeight;
    } else {
      if (this.scrollList.indexOf(detail.scrollHeight) === -1 && detail.scrollHeight - detail.scrollTop - this.windowHeight < 500) {
        this.scrollList.push(detail.scrollHeight);
        this.isLoading = true;
        wx.showLoading({
          mask: true,
          title: '数据加载中'
        });
        this.data.pageNo++;
        var last = this.data.pageNo * this.data.pageSize + this.data.pageSize - 1;
        this.setData({
          spriteList: this.filterList.slice(0, last)
        });
        var me = this;
        setTimeout(function () {
          wx.hideLoading();
          me.isLoading = false;
        }, 1000);
      }
    }
  },

  tapSprite: function (event) {
    var id = event.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: '/pages/sprite/index?id=' + id
      });
    }
  },

  tapFilter: function (event) {
    wx.navigateTo({
      url: '/pages/filter/index?isFilter=' + this.data.isFilter + '&filter=' + this.data.filter
    });
  },

  onFocus: function (event) {
    wx.navigateTo({
      url: '/pages/search/index'
    });
  }
})
