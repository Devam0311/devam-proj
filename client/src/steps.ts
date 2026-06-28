import { Step, StepType } from './types/index';

/*
 * Parse input XML and convert it into steps.
 * Eg: Input - 
 * <genwebArtifact id=\"project-import\" title=\"Project Files\">
 *  <genwebAction type=\"file\" filePath=\"eslint.config.js\">
 *      import js from '@eslint/j s';\nimport globals from 'globals';\n
 *  </genwebAction>
 * <genwebAction type="shell">
 *      node index.js
 * </genwebAction>
 * </genwebArtifact>
 * 
 * Output - 
 * [{
 *      title: "Project Files",
 *      status: "Pending" 
 * }, {
 *      title: "Create eslint.config.js",
 *      type: StepType.CreateFile,
 *      code: "import js from '@eslint/js';\nimport globals from 'globals';\n"
 * }, {
 *      title: "Run command",
 *      code: "node index.js",
 *      type: StepType.RunScript
 * }]
 * 
 * The input can have strings in the middle they need to be ignored
 */


// export function parseXml(response: string): Step[] {
//     // Extract the XML content between <genwebArtifact> tags
//     const xmlMatch = response.match(/<genwebArtifact[^>]*>([\s\S]*?)<\/genwebArtifact>/);
    
//     if (!xmlMatch) {
//       return [];
//     }
  
//     const xmlContent = xmlMatch[1];
//     const steps: Step[] = [];
//     let stepId = 1;
  
//     // Extract artifact title
//     const titleMatch = response.match(/title="([^"]*)"/);
//     const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';
  
//     // Add initial artifact step
//     steps.push({
//       id: stepId++,
//       title: artifactTitle,
//       description: '',
//       type: StepType.CreateFolder,
//       status: 'pending'
//     });
  
//     // Regular expression to find genwebAction elements
//     const actionRegex = /<genwebAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/genwebAction>/g;
    
//     let match;
//     while ((match = actionRegex.exec(xmlContent)) !== null) {
//       const [, type, filePath, content] = match;
  
//       if (type === 'file') {
//         // File creation step
//         steps.push({
//           id: stepId++,
//           title: `Create ${filePath || 'file'}`,
//           description: '',
//           type: StepType.CreateFile,
//           status: 'pending',
//           code: content.trim(),
//           path: filePath
//         });
//       } else if (type === 'shell') {
//         // Shell command step
//         steps.push({
//           id: stepId++,
//           title: 'Run command',
//           description: '',
//           type: StepType.RunScript,
//           status: 'pending',
//           code: content.trim()
//         });
//       }
//     }
  
//     return steps;
//   }

export function parseXml(response: string, startId: number = 1): Step[] {
  console.log("[parseXml] Input length:", response.length);

  // Normalize: replace boltArtifact/boltAction with genwebArtifact/genwebAction
  let normalized = response
    .replace(/<boltArtifact/g, '<genwebArtifact')
    .replace(/<\/boltArtifact>/g, '</genwebArtifact>')
    .replace(/<boltAction/g, '<genwebAction')
    .replace(/<\/boltAction>/g, '</genwebAction>');

  // Extract the XML content between <genwebArtifact> tags
  const xmlMatch = normalized.match(/<genwebArtifact[^>]*>([\s\S]*?)<\/genwebArtifact>/);
  
  const xmlContent = xmlMatch ? xmlMatch[1] : normalized;
  console.log("[parseXml] Found artifact wrapper:", !!xmlMatch);

  const steps: Step[] = [];
  let stepId = startId;

  // Extract artifact title
  const titleMatch = normalized.match(/title=["']([^"']*)["']/);
  const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';

  // Add initial artifact step
  steps.push({
      id: stepId++,
      title: artifactTitle,
      description: '',
      type: StepType.CreateFolder,
      status: 'pending'
  });

  // Regular expression to find genwebAction elements robustly
  const actionRegex = /<genwebAction([^>]*)>([\s\S]*?)<\/genwebAction>/g;

  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
      const attributes = match[1];
      const content = match[2];

      const typeMatch = attributes.match(/type\s*=\s*["']([^"']*)["']/);
      const fileMatch = attributes.match(/filePath\s*=\s*["']([^"']*)["']/);
      
      const type = typeMatch ? typeMatch[1] : null;
      const filePath = fileMatch ? fileMatch[1] : null;

      if (type === 'file') {
          // File creation step
          steps.push({
              id: stepId++,
              title: `Create ${filePath || 'file'}`,
              description: '',
              type: StepType.CreateFile,
              status: 'pending',
              code: content.trim(),
              path: filePath
          });
      } else if (type === 'shell') {
          // Shell command step
          steps.push({
              id: stepId++,
              title: 'Run command',
              description: '',
              type: StepType.RunScript,
              status: 'pending',
              code: content.trim()
          });
      }
  }

  console.log("[parseXml] Total steps parsed:", steps.length);
  return steps;
}
