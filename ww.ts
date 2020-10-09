import { resolve, join } from 'path';
import { readFileSync, createWriteStream } from 'fs';
import axios from "axios";

const filepath = '/Users/andrew.harrison/Documents/wwHtml.rtf'

const txt = readFileSync(filepath, 'utf-8');

// console.log(txt);

const urls = txt.match(/url\('(\w|\.|\:|\/|-)+/g);

const trimed = urls.map((v)=> v.substring(5, v.length - 5)+'v.jpg')
console.log(trimed);


const dir = resolve('./images');


trimed.forEach((v, index)=>{
  axios({
    method: "GET",
    url: v,
    responseType: "stream"
  }).then((res)=>{  
    res.data.pipe(createWriteStream(dir+'/'+index+'.jpg'))
  })
})
