const BASE_URL = 'https://pokeapi.co/api/v2'

/**
 * Wrap wx.request in a Promise
 * @param {string} url - Full URL or path relative to BASE_URL
 * @returns {Promise}
 */
function request(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      method: 'GET',
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`))
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

module.exports = { request }
