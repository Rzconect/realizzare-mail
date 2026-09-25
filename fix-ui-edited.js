const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const regexMap = /displayText = displayText\.replace\(\/\^\\\[QUOTE:\(\.\*\?\)\\\|\(\.\*\?\)\\\|\(\.\*\?\)\\\]\\n\/, ''\);\s*\}/;

const replacementMap = `displayText = displayText.replace(/^\\[QUOTE:(.*?)\\|(.*?)\\|(.*?)\\]\\n/, '');
                }
                
                let isEdited = false;
                if (displayText.endsWith('[EDITADA]')) {
                  isEdited = true;
                  displayText = displayText.substring(0, displayText.length - 9);
                }`;

c = c.replace(regexMap, replacementMap);

const regexReturn = /quotedText,\s*time: new Date\(m\.created_at\)\.toLocaleTimeString/;

const replacementReturn = `quotedText,
                  isEdited,
                  time: new Date(m.created_at).toLocaleTimeString`;
                  
c = c.replace(regexReturn, replacementReturn);

const regexUI = /<div className="text-xs text-slate-400 mt-1 flex justify-end">\{msg\.time\}<\/div>/g;
const replacementUI = `<div className="text-xs text-slate-400 mt-1 flex justify-end gap-1 items-center">
                        {msg.isEdited && <span className="italic mr-1 text-[10px]">Editada</span>}
                        {msg.time}
                      </div>`;
c = c.replace(regexUI, replacementUI);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed UI edit display');
