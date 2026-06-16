// utils/api.js
// PokéAPI 服务模块

/**
 * 获取 Pokemon 基础信息
 * @param {string} nameOrId - Pokemon 名称或 ID
 * @returns {Promise}
 */
export function getPokemonInfo(nameOrId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Network Error: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 获取 Pokemon 物种信息（包括进化链、描述等）
 * @param {number} id - Pokemon ID
 * @returns {Promise}
 */
export function getPokemonSpecies(id) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://pokeapi.co/api/v2/pokemon-species/${id}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Network Error: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 获取进化链信息
 * @param {number} evolutionChainId - 进化链 ID
 * @returns {Promise}
 */
export function getEvolutionChain(evolutionChainId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://pokeapi.co/api/v2/evolution-chain/${evolutionChainId}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Network Error: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 获取属性详情
 * @param {string} abilityName - 属性名称
 * @returns {Promise}
 */
export function getAbilityInfo(abilityName) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://pokeapi.co/api/v2/ability/${abilityName.toLowerCase()}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Network Error: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 搜索 Pokemon 列表
 * @param {number} limit - 返回数量限制
 * @param {number} offset - 偏移量
 * @returns {Promise}
 */
export function getPokemonList(limit = 50, offset = 0) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Network Error: ${err.errMsg}`));
      }
    });
  });
}
