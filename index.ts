import { resolve, join } from 'path';
import { readFileSync, writeFileSync } from 'fs'
import { promises } from 'dns';
const { readdir } = require('fs').promises;

var replaced = 0;
var searched = 0;

async function run(){
  console.log("starting tools");

  async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
  }

  const files = await getFiles(process.argv[2]);

  console.log(`found ${files.length} files`);

  const component = process.argv[3];

  const compComma = '(\\w*,\\s*)';
  const comp = '(\\w*\\s*)'

  const oldImport = new RegExp(`(import \\{\\s*${compComma}*)(${component},?\\s*)(${compComma}*${comp}*\\} from 'libraries\\/components')`, 'g');

  files.forEach(file =>{
    searched++;
    const txt = readFileSync(file, 'utf-8');

    const location = txt.search(oldImport);
    if(location >= 0 ){
      //remove the imported item
      const step1 = txt.replace(oldImport, '$1$4')

      //get rid of empty imports
      const step2 = step1.replace(/(import \{(\s*)\} from 'libraries\/components';?)/g, '');

      //add it to existing imports
      var step3 = ''; 
      if(step2.search(/import \{((\s*\w*\s*)|(\s*\w*,\s*)+)\} from '@iqies\/iqies-ui-components';?/) >= 0)
        step3 = step2.replace(/(import \{)(((\s*\w*\s*)|(\s*\w*,\s*)+)\} from '@iqies\/iqies-ui-components';?)/, `$1\n  ${component}, $2`);  
      else {
        // create a new import before the exisiting one
        step3 = step2.slice(0, location) + `import { ${component} } from '@iqies/iqies-ui-components';\n` + step2.slice(location)
      }
      writeFileSync(file, step3);
      replaced++;
      console.log(`repaced in ${file}`);
    }
    
  })
}

run().then(()=>{
  console.log(`searched in ${searched} files`);
  console.log(`replaced in ${replaced} files`);
})


