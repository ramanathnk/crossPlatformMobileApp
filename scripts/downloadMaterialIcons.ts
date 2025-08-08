import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';

interface MaterialIcon {
  name: string;
  codepoint: string;
}

const ICONS: MaterialIcon[] = [
  { name: 'visibility', codepoint: 'E8F4' },      // eye
  { name: 'visibility_off', codepoint: 'E8F5' },
  { name: 'settings', codepoint: 'E8B8' },
  { name: 'home', codepoint: 'E88A' },
  { name: 'pending_actions', codepoint: 'F1BB' },
  { name: 'group', codepoint: 'E7EF' },
  { name: 'concierge', codepoint: 'F561' },
];

const ICON_STYLE = 'materialicons'; // or 'materialiconsoutlined', etc.
const OUTPUT_DIR = path.resolve(__dirname, '../assets/material-icons');

async function downloadIcon(icon: MaterialIcon): Promise<void> {
  const url = `https://fonts.gstatic.com/s/i/${ICON_STYLE}/${icon.name}/v1/24px.svg`;
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const svgBuffer = Buffer.from(response.data);

    await fs.ensureDir(OUTPUT_DIR);
    await fs.writeFile(`${OUTPUT_DIR}/${icon.name}.svg`, svgBuffer);
    console.log(`Downloaded: ${icon.name}.svg`);
  } catch (error) {
    console.error(`Failed to download ${icon.name}:`, (error as Error).message);
  }
}

async function main(): Promise<void> {
  for (const icon of ICONS) {
    await downloadIcon(icon);
  }
}

main();