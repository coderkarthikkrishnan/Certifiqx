const fs = require('fs');
const path = 'f:/02_Projects/01 Personal/Certificate downloader/firestore.rules';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(/myUserData\(\)\.departmentId/g, 'myDeptId()');
const insertPos = text.indexOf('function myOrgId() {');
const insertBlock = `function myDeptId() {
      return myUserData().get('departmentId', myUserData().get('dept', null));
    }

    `;
text = text.slice(0, insertPos) + insertBlock + text.slice(insertPos);

fs.writeFileSync(path, text, 'utf8');
console.log('Fixed firestore.rules');
