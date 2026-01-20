import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function extractEthnicity7() {
  const profilePath = join(process.cwd(), 'profile.json');
  const outputPath = join(process.cwd(), 'profile-ethnicity-7.json');
  
  // Read the profile.json file
  const data = await readFile(profilePath, 'utf-8');
  const profiles = JSON.parse(data);
  
  // Filter profiles where ethnicity is 7
  const ethnicity7Profiles = {
    items: profiles.items.filter((item: any) => {
      if (item.type === 'full_profile_v1' && item.data) {
        return item.data.ethnicity === 7;
      }
      return false;
    })
  };
  
  // Write the filtered profiles to a new file
  await writeFile(outputPath, JSON.stringify(ethnicity7Profiles, null, 2));
  
  console.log(`Extracted ${ethnicity7Profiles.items.length} profiles with ethnicity 7`);
  console.log(`Saved to: ${outputPath}`);
}

extractEthnicity7().catch(console.error);
