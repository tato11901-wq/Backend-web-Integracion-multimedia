const fs = require('fs');
const path = require('path');
const basePath = 'c:/Users/Usuario/Documents/GitHub/Backend-web-Integracion-multimedia/Front/Imaginatio Web Front/src/assets/Recursos planta';
const dirs = fs.readdirSync(basePath).filter(d => fs.statSync(path.join(basePath, d)).isDirectory() && !d.startsWith('Sprites') && d !== 'willy-cajeto');

let imports = '';
let registry = '';

for (const dir of dirs) {
  const dirPath = path.join(basePath, dir, '2D');
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    const f1 = files.find(f => f.includes('fase1') && f.endsWith('.png'));
    const f2 = files.find(f => f.includes('fase2') && f.endsWith('.png'));
    const f3 = files.find(f => f.includes('fase3') && f.endsWith('.png'));
    const f4 = files.find(f => f.includes('fase4') && f.endsWith('.png'));
    
    if (f1 && f2 && f3 && f4) {
      const safeName = dir.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      imports += `import ${safeName}_seed from '../assets/Recursos planta/${dir}/2D/${f1}';\n`;
      imports += `import ${safeName}_small_bush from '../assets/Recursos planta/${dir}/2D/${f2}';\n`;
      imports += `import ${safeName}_large_bush from '../assets/Recursos planta/${dir}/2D/${f3}';\n`;
      imports += `import ${safeName}_ent from '../assets/Recursos planta/${dir}/2D/${f4}';\n\n`;
      
      const plantId = dir; // Usar el nombre de la carpeta como ID de la especie
      registry += `  '${plantId}': createPlantConfig(\n`;
      registry += `    { seed: ${safeName}_seed.src, small_bush: ${safeName}_small_bush.src, large_bush: ${safeName}_large_bush.src, ent: ${safeName}_ent.src },\n`;
      registry += `    { seed: 1.0, small_bush: 1.0, large_bush: 1.0, ent: 1.0 } // FIXME: Ajustar escalas si es necesario\n`;
      registry += `  ),\n`;
    } else {
      console.log('Missing phases in:', dir);
    }
  } else {
    console.log('No 2D folder in:', dir);
  }
}
fs.writeFileSync('c:/Users/Usuario/Documents/GitHub/Backend-web-Integracion-multimedia/Front/Imaginatio Web Front/src/scratch_plants.txt', imports + '||||' + registry);
