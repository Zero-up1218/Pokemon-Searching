// data/globalobject.js
// 全局数据对象 - 集成 PokéAPI 服务

import spriteList from './sprites/spriteList.js';
import * as apiService from '../utils/api.js';

var globalObject = {
  // 本地精灵列表（备用）
  spriteList: spriteList,

  /**
   * 从 API 获取 Pokemon 详细信息
   * @param {string|number} idOrName - Pokemon ID 或名称
   * @returns {Promise}
   */
  getPokemonFromAPI: function (idOrName) {
    return apiService.getPokemonFullInfo(idOrName);
  },

  /**
   * ID 查询精灵 - 优先使用 API，备用本地数据
   * @param {string|number} id - Pokemon ID
   * @returns {Promise}
   */
  getItemByIdAsync: function (id) {
    return new Promise((resolve, reject) => {
      // 先尝试从 API 获取
      this.getPokemonFromAPI(id)
        .then(item => {
          resolve(item);
        })
        .catch(() => {
          // API 失败则使用本地数据
          const item = this.getItemById(id);
          if (item) {
            resolve(item);
          } else {
            reject(new Error('Pokemon not found'));
          }
        });
    });
  },

  /**
   * ID 查询精灵 - 同步方法（本地数据）
   * @param {string|number} id - Pokemon ID
   * @returns {object}
   */
  getItemById: function (id) {
    for (var i = 0, size = this.spriteList.length; i < size; i++) {
      var item = this.spriteList[i];
      if (id == item.id) {
        return item;
      }
    }
  },

  /**
   * 按能力查询精灵
   * @param {string} ability - 能力名称
   * @returns {Promise}
   */
  getItemsByAbilityAsync: function (ability) {
    return new Promise(async (resolve) => {
      const results = [];
      
      try {
        // 获取 API 中具有该能力的所有 Pokemon
        const abilityInfo = await apiService.getAbilityInfo(ability);
        
        if (abilityInfo && abilityInfo.pokemon) {
          for (let pokemonRef of abilityInfo.pokemon) {
            try {
              const pokemon = await this.getPokemonFromAPI(pokemonRef.pokemon.name);
              results.push(pokemon);
            } catch (e) {
              console.warn(`Failed to fetch ${pokemonRef.pokemon.name}:`, e);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch ability info from API:', e);
      }

      // 备用：本地搜索
      if (results.length === 0) {
        resolve(this.getItemsByAbility(ability));
      } else {
        resolve(results);
      }
    });
  },

  /**
   * 按能力查询精灵 - 本地方法
   * @param {string} ability - 能力名称
   * @returns {array}
   */
  getItemsByAbility: function (ability) {
    if (!ability) return null;
    var results = [];
    for (var i = 0, size = this.spriteList.length; i < size; i++) {
      var item = this.spriteList[i];
      if (item.ability && item.ability.length && item.ability.indexOf(ability) >= 0) {
        results.push(item);
      }
    }
    return results;
  },

  /**
   * 多属性搜索精灵 - 异步版本（API 优先）
   * @param {string} key - 查询字段，逗号分隔
   * @param {string} queryString - 查询值
   * @returns {Promise}
   */
  searchAsync: function (key, queryString) {
    return new Promise(async (resolve) => {
      try {
        // 尝试通过 API 搜索
        const apiResult = await apiService.searchPokemon(queryString);
        
        if (apiResult && apiResult.results && apiResult.results.length > 0) {
          const results = [];
          for (let result of apiResult.results) {
            try {
              const pokemon = await this.getPokemonFromAPI(result.name);
              results.push(pokemon);
            } catch (e) {
              console.warn(`Failed to fetch ${result.name}:`, e);
            }
          }
          if (results.length > 0) {
            resolve(results);
            return;
          }
        }
      } catch (e) {
        console.warn('API search failed:', e);
      }

      // 备用：本地搜索
      resolve(this.search(key, queryString));
    });
  },

  /**
   * 多属性查询精灵 - 本地方法
   * @param {string} key - 查询字段，逗号分隔
   * @param {string} queryString - 查询值
   * @returns {array}
   */
  search: function (key, queryString) {
    var results = [];
    var keys = key.split(',');
    for (var i = 0, size = this.spriteList.length; i < size; i++) {
      var item = this.spriteList[i];
      for (var j = 0, jsize = keys.length; j < jsize; j++) {
        if (item[keys[j]] && item[keys[j]].toLowerCase().indexOf(queryString.toLowerCase()) >= 0) {
          results.push(item);
          break;
        }
      }
    }
    return results;
  },

  /**
   * 过滤精灵 - 支持 API 数据
   * @param {object} queryObject - 过滤条件
   * @returns {Promise}
   */
  filterAsync: function (queryObject) {
    return new Promise(async (resolve) => {
      try {
        // 从 API 获取所有 Pokemon 列表
        const list = await apiService.getPokemonList(1000, 0);
        
        if (list && list.results) {
          const results = [];
          for (let item of list.results) {
            try {
              const pokemon = await this.getPokemonFromAPI(item.name);
              // 应用过滤条件
              if (this.matchesFilter(pokemon, queryObject)) {
                results.push(pokemon);
              }
            } catch (e) {
              console.warn(`Failed to fetch ${item.name}:`, e);
            }
          }
          if (results.length > 0) {
            resolve(results);
            return;
          }
        }
      } catch (e) {
        console.warn('API filter failed:', e);
      }

      // 备用：本地过滤
      resolve(this.filter(queryObject));
    });
  },

  /**
   * 检查 Pokemon 是否匹配过滤条件
   * @param {object} pokemon - Pokemon 对象
   * @param {object} queryObject - 过滤条件
   * @returns {boolean}
   */
  matchesFilter: function (pokemon, queryObject) {
    if (!queryObject) return true;

    const qtype = queryObject.type;
    const qgeneration = queryObject.generation;

    // 检查类型
    if (qtype && qtype.length) {
      let typeMatch = false;
      for (let t of qtype) {
        if (pokemon.type && pokemon.type.indexOf(t) >= 0) {
          typeMatch = true;
          break;
        }
      }
      if (!typeMatch) return false;
    }

    // 检查代数
    if (qgeneration && qgeneration.length) {
      let genMatch = false;
      for (let g of qgeneration) {
        if (pokemon.generation === g) {
          genMatch = true;
          break;
        }
      }
      if (!genMatch) return false;
    }

    return true;
  },

  /**
   * 本地过滤精灵
   * @param {object} queryObject - 过滤条件
   * @returns {array}
   */
  filter: function (queryObject) {
    if (!queryObject) {
      return this.spriteList;
    }
    var results = [];
    var qarea = queryObject.area;
    var qtype = queryObject.type;
    var qgeneration = queryObject.generation;
    var qeggGroup = queryObject.eggGroup;
    for (let i = 0, size = this.spriteList.length; i < size; i++) {
      var sprite = this.spriteList[i];
      var area = sprite.area;
      var type = sprite.type;
      var generation = sprite.generation;
      var eggGroup = sprite.eggGroup;
      var isAreaOk = qarea && qarea.length ? false : true;
      var isTypeOk = qtype && qtype.length ? false : true;
      var isGenerationOk = qgeneration && qgeneration.length ? false : true;
      var isEggGroupOk = qeggGroup && qeggGroup.length ? false : true;
      if (!isAreaOk) {
        for (let j = 0, l = qarea.length; j < l; j++) {
          if (area.indexOf(qarea[j]) >= 0) {
            isAreaOk = true;
          } else {
            isAreaOk = false;
            break;
          }
        }
      }
      if (isAreaOk && !isTypeOk) {
        for (let j = 0, l = qtype.length; j < l; j++) {
          if (type.indexOf(qtype[j]) >= 0) {
            isTypeOk = true;
          } else {
            isTypeOk = false;
            break;
          }
        }
      }
      if (isAreaOk && isTypeOk && !isGenerationOk) {
        for (let j = 0, l = qgeneration.length; j < l; j++) {
          if (generation == qgeneration[j]) {
            isGenerationOk = true;
            break;
          } else {
            isGenerationOk = false;
          }
        }
      }
      if (isAreaOk && isTypeOk && isGenerationOk && !isEggGroupOk) {
        for (let j = 0, l = qeggGroup.length; j < l; j++) {
          if (eggGroup.indexOf(qeggGroup[j]) >= 0) {
            isEggGroupOk = true;
          } else {
            isEggGroupOk = false;
            break;
          }
        }
      }
      if (isAreaOk && isTypeOk && isGenerationOk && isEggGroupOk) {
        results.push(sprite);
      }
    }
    return results;
  }
};

module.exports = globalObject;
