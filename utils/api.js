// utils/api.js
// PokéAPI 服务模块

import * as cache from './cache.js';
import * as converter from './converter.js';

/**
 * 获取 Pokemon 完整信息（包括API和本地缓存）
 * @param {string|number} nameOrId - Pokemon 名称或 ID
 * @returns {Promise}
 */
export function getPokemonFullInfo(nameOrId) {
  return new Promise(async (resolve, reject) => {
    const cacheKey = `pokemon_full_${nameOrId}`;
    
    // 先检查缓存
    const cachedData = cache.getCache(cacheKey);
    if (cachedData) {
      resolve(cachedData);
      return;
    }

    try {
      // 获取基础信息
      const pokemonData = await getPokemonInfo(nameOrId);
      const id = pokemonData.id;

      // 获取物种信息
      const speciesData = await getPokemonSpecies(id);

      // 转换���据格式
      const convertedData = converter.convertPokemonData(pokemonData, speciesData);

      // 获取进化链信息
      if (speciesData && speciesData.evolution_chain) {
        const chainId = speciesData.evolution_chain.url.split('/').filter(s => s)[4];
        const evolutionData = await getEvolutionChain(chainId);
        convertedData.evolutions = converter.parseEvolutionChain(evolutionData);
      }

      // 缓存结果
      cache.setCache(cacheKey, convertedData);

      resolve(convertedData);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 获取 Pokemon 基础信息
 * @param {string|number} nameOrId - Pokemon 名称或 ID
 * @returns {Promise}
 */
export function getPokemonInfo(nameOrId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`,
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
  const cacheKey = `ability_${abilityName}`;
  
  return new Promise((resolve, reject) => {
    // 检查缓存
    const cachedData = cache.getCache(cacheKey);
    if (cachedData) {
      resolve(cachedData);
      return;
    }

    wx.request({
      url: `https://pokeapi.co/api/v2/ability/${String(abilityName).toLowerCase()}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          cache.setCache(cacheKey, res.data);
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
  const cacheKey = `pokemon_list_${limit}_${offset}`;
  
  return new Promise((resolve, reject) => {
    // 检查缓存
    const cachedData = cache.getCache(cacheKey);
    if (cachedData) {
      resolve(cachedData);
      return;
    }

    wx.request({
      url: `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          cache.setCache(cacheKey, res.data);
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
 * 搜索 Pokemon 按名称或ID
 * @param {string} query - 搜索关键词
 * @returns {Promise}
 */
export function searchPokemon(query) {
  return new Promise((resolve, reject) => {
    // 先尝试作为 ID 或名称查询
    getPokemonInfo(query)
      .then(data => {
        const result = {
          results: [{
            name: data.name,
            url: data.species.url
          }]
        };
        resolve(result);
      })
      .catch(() => {
        // 如果直接查询失败，返回空结果
        resolve({ results: [] });
      });
  });
}
