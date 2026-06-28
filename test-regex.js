const response = `<genwebArtifact id="project-import" title="Project Files">
<genwebAction type="file" filePath="src/App.js">
import React from 'react';
</genwebAction>
</genwebArtifact>`;

const xmlMatch = response.match(/<genwebArtifact[^>]*>([\s\S]*?)<\/genwebArtifact>/);
const xmlContent = xmlMatch ? xmlMatch[1] : response;
console.log('xmlContent:', !!xmlContent);

const actionRegex = /<genwebAction([^>]*)>([\s\S]*?)<\/genwebAction>/g;
let match;
let count = 0;
while ((match = actionRegex.exec(xmlContent)) !== null) {
  count++;
}
console.log('count:', count);
