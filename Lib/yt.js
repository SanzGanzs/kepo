const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
result = [];
hasil = [];
module.exports = class youtube {
  constructor(all={}){
    this.ttl = all.ttl || 3
    this.query = all.q || ""
    this.url = all.url
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
    if (typeof result === 'object') throw new Error("search dulu coeg atau pake url")
    scrap.yta(this.url || result)
    .then(res => resolve(res))
    .catch(reject)
  })
}
}
