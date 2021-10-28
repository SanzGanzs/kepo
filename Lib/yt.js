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
async download() {
  return new Promise((resolve, reject) => {
    var url = this.url || result[0].link
    if (!url) throw new Error("no link")
    scrap.yta(url)
    .then(res => {
      scrap.ytv(url).then(resu => {
        resolve({
          title: result[0].link,
          img: result[0].thumbnail,
          id: result[0].id,
          audio: res[0].audio,
          audio_size: res[0].filesize,
          video: resu[0].video,
          video_size: resu[0].filesize
        })
      })
    })
  })
}
}
