// utils/converter.js
// 数据转换模块 - 将 PokéAPI 数据转换为本地格式

/**
 * 将 PokéAPI Pokemon 数据转换为本地格式
 * @param {object} apiData - 来自 PokéAPI 的 Pokemon 数据
 * @param {object} speciesData - 来自 PokéAPI 的物种数据
 * @returns {object} 转换后的 Pokemon 对象
 */
export function convertPokemonData(apiData, speciesData) {
  if (!apiData) return null;

  const id = String(apiData.id).padStart(3, '0');
  
  // 提取中文名称和描述
  let cname = apiData.name;
  let description = '';
  
  if (speciesData && speciesData.names) {
    const cnName = speciesData.names.find(n => n.language.name === 'zh-Hans');
    if (cnName) cname = cnName.name;
  }
  
  if (speciesData && speciesData.flavor_text_entries) {
    const cnDesc = speciesData.flavor_text_entries.find(f => f.language.name === 'zh-Hans');
    if (cnDesc) description = cnDesc.flavor_text.replace(/\f/g, ' ');
  }

  // 提取属性
  const types = apiData.types.map(t => t.type.name);
  const abilities = apiData.abilities.map(a => a.ability.name);

  // 提取基础数值
  const baseStats = {};
  apiData.stats.forEach(stat => {
    const statMap = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SPA',
      'special-defense': 'SPD',
      'speed': 'SPE'
    };
    baseStats[statMap[stat.stat.name]] = stat.base_stat;
  });

  // 获取官方图片
  const spriteUrl = apiData.sprites?.other?.['official-artwork']?.front_default || 
                    apiData.sprites?.front_default || '';

  return {
    id: id,
    name: apiData.name,
    cname: cname,
    description: description,
    type: types,
    ability: abilities,
    height: apiData.height,
    weight: apiData.weight,
    baseStats: baseStats,
    spriteUrl: spriteUrl,
    captureRate: speciesData?.capture_rate || 0,
    generation: speciesData?.generation?.name?.toUpperCase() || '',
    isMegaEvolution: false,
    order: apiData.order
  };
}

/**
 * 获取进化链信息
 * @param {object} chainData - 进化链数据
 * @returns {array} 进化数据数组
 */
export function parseEvolutionChain(chainData) {
  const evolutions = [];
  
  if (!chainData || !chainData.chain) {
    return evolutions;
  }

  function traverse(chainNode) {
    if (!chainNode) return;
    
    const species = chainNode.species;
    if (species) {
      evolutions.push({
        id: String(species.url.split('/').filter(s => s)[4]).padStart(3, '0'),
        name: species.name
      });
    }
    
    if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
      chainNode.evolves_to.forEach(child => traverse(child));
    }
  }

  traverse(chainData.chain);
  return evolutions;
}
