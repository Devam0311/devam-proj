const files = [
  {
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      { name: 'App.js', type: 'file', path: '/src/App.js', content: 'old' }
    ]
  }
];

const steps = [
  { type: 2, path: 'src/App.js', code: 'new code', status: 'pending' },
  { type: 2, path: 'src/App.css', code: 'new css', status: 'pending' }
];

let originalFiles = [...files];
let updateHappened = false;

steps.filter(({ status }) => status === "pending").map(step => {
  updateHappened = true;
  if (step.type === 2) {
    let parsedPath = step.path?.split("/") ?? [];
    let currentFileStructure = [...originalFiles];
    const finalAnswerRef = currentFileStructure;
    let currentFolder = "";

    while (parsedPath.length) {
      currentFolder = `${currentFolder}/${parsedPath[0]}`;
      const currentFolderName = parsedPath[0];
      parsedPath = parsedPath.slice(1);

      if (!parsedPath.length) {
        const file = currentFileStructure.find(x => x.path === currentFolder);
        if (!file) {
          currentFileStructure.push({
            name: currentFolderName,
            type: 'file',
            path: currentFolder,
            content: step.code
          });
        } else {
          file.content = step.code;
        }
      } else {
        const folder = currentFileStructure.find(x => x.path === currentFolder);
        if (!folder) {
          currentFileStructure.push({
            name: currentFolderName,
            type: 'folder',
            path: currentFolder,
            children: []
          });
        }
        currentFileStructure = currentFileStructure.find(x => x.path === currentFolder).children;
      }
    }
    originalFiles = finalAnswerRef;
  }
});

console.log(JSON.stringify(originalFiles, null, 2));
