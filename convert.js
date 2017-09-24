module.exports = (url,urlCount)=>{
if(! /https?:\/\/www\..+\.com/.test(url)) url = null
  return {url:url,shortUrl:'https://amazingbin.glitch.me/short/'+urlCount}
}