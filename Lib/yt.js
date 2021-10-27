const fetch = require('node-fetch');
const { JSDOM } = require('jsdom')
const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
module.exports = class youtube {
  constructor(all={}){
    this.ttl = all.ttl || 3
    this.query = all.q || ""
  }
async search(){
let url = "https://www.youtube.com/results?search_query="+this.query;
  return fetch(url)
    .then(res => res.text())
    .then(body => {
      let val1 = body.search('itemSectionRenderer');
      let val2 = body.search('},{\"continuationItemRenderer');
      body = body.slice(val1, val2);
      body = "{\""+body+"}";
      body = JSON.parse(body);
      let c = 0;
      let i = 0;
      var result = [];
      while(c<this.ttl){
        if(body.itemSectionRenderer.contents[i].videoRenderer){
          var res = 
            {
              id: body.itemSectionRenderer.contents[i].videoRenderer.videoId,
             title: body.itemSectionRenderer.contents[i].videoRenderer.title.runs[0].text,
             time: body.itemSectionRenderer.contents[i].videoRenderer.lengthText.simpleText,
              link: "https://www.youtube.com/watch?v="+body.itemSectionRenderer.contents[i].videoRenderer.videoId,
              thumbnail: "https://i.ytimg.com/vi/"+body.itemSectionRenderer.contents[i].videoRenderer.videoId+"/hqdefault.jpg"
            }
          result.push(res);
          i++;
          c++;
        } else {
          i++;
        }
      }   
      return result;
    });
};
async audio() {
  return new Promise((resolve, reject) => {
    function post(url, formdata) {
      return fetch(url, {
        method: 'POST',
        headers: {
          accept: "*/*",
          'accept-language': "en-US,en;q=0.9",
          'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&')
      })
    }
    if (ytIdRegex.test(this.query)) {
      let ytId = ytIdRegex.exec(this.query)
      url = 'https://youtu.be/' + ytId[1]
      post('https://www.y2mate.com/mates/en60/analyze/ajax', {
        url,
        q_auto: 0,
        ajax: 1
      })
      .then(res => res.json())
      .then(res => {
        document = (new JSDOM(res.result)).window.document
        yaha = document.querySelectorAll('td')
        filesize = yaha[yaha.length - 23].innerHTML
        id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', '']
        thumb = document.querySelector('img').src
        title = document.querySelector('b').innerHTML
        post('https://www.y2mate.com/mates/en60/convert', {
          type: 'youtube',
          _id: id[1],
          v_id: ytId[1],
          ajax: '1',
          token: '',
          ftype: 'mp4',
          fquality: 360
        })
        .then(res => res.json())
        .then(res => {
          let KB = parseFloat(filesize) * (1000 * /MB$/.test(filesize))
          hasil = []
          video = /<a.+?href="(.+?)"/.exec(res.result)[1],
          hasil.push({video, thumb, title, filesize})
          resolve(hasil)
        }).catch(reject)
      }).catch(reject)
    } else reject('URL INVALID')
  })
} 
}
