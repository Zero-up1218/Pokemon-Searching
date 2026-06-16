// pages/search/index.js
// 搜索页面 - 集成 API 搜索功能

const app = getApp();

Page({
  data: {
    spriteList: [],
    isLoading: false,
    searchQuery: '',
    hasError: false,
    errorMsg: ''
  },

  onLoad: function (options) {
    this.filterList = app.globalObject.spriteList;
  },

  onReady: function () {
    this.windowHeight = wx.getSystemInfoSync().windowHeight;
    this.scrollList = [];
  },

  onScroll: function (e) {
  },

  tapSprite: function (event) {
    var index = event.currentTarget.dataset.index + '';
    index = '';
    var id = event.currentTarget.dataset.id;
    if (index) {
      wx.navigateTo({
        url: '/pages/sprite/index?index=' + index
      });
    } else if (id) {
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

  toabout: function () {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },

  back: function () {
    wx.navigateBack();
  },

  clearSearch: function () {
    this.setData({
      spriteList: [],
      searchQuery: '',
      hasError: false,
      errorMsg: ''
    });
  },

  onInput: function (event) {
    var value = event.detail.value.replace(/\s/ig, '');
    
    if (this.searchStr == value) {
      return value;
    }

    // 验证输入
    if (/^\d+$/.test(value) && !/^\d{1,5}$/.test(value)) {
      return value;
    }

    this.searchStr = value;

    if (!value) {
      this.setData({
        spriteList: [],
        searchQuery: '',
        hasError: false,
        errorMsg: ''
      });
      return;
    }

    // 显示加载状态
    this.setData({
      isLoading: true,
      searchQuery: value
    });

    // 优先使用 API 搜索
    app.globalObject.searchAsync('cname,id,name', value)
      .then((results) => {
        this.setData({
          spriteList: results || [],
          isLoading: false,
          hasError: false,
          errorMsg: ''
        });
        console.log('Search results:', results);
      })
      .catch((err) => {
        console.error('Search failed:', err);
        // 降级到本地搜索
        const localResults = this.search('cname,id', value);
        this.setData({
          spriteList: localResults,
          isLoading: false,
          hasError: false,
          errorMsg: ''
        });
      });
  },

  /**
   * 本地搜索方法（备用）
   */
  search: function (key, queryString) {
    var results = [];
    var keys = key.split(',');
    for (var i = 0, size = this.filterList.length; i < size; i++) {
      var item = this.filterList[i];
      for (var j = 0, jsize = keys.length; j < jsize; j++) {
        if (item[keys[j]] && item[keys[j]].toString().toLowerCase().indexOf(queryString.toLowerCase()) >= 0) {
          results.push(item);
          break;
        }
      }
    }
    return results;
  }
})
