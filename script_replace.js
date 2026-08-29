const fs = require('fs');
const path = 'src/app/dashboard/campaigns/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* Right Column: Simulated Inbox Inbox Preview */}';
const endMarker = '</div>\n        )}\n\n        {/* ========================================== */}\n        {/* STEP 2:';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log('Not found!');
  process.exit(1);
}

const replacement = `{/* Right Column: Simulated Inbox Preview */}
            <div className="lg:col-span-5 flex justify-center items-start">
              <SimulatedInboxPreview 
                subjectLine={subjectLine} 
                preheader={preheader} 
                senderName={senderName} 
                renderMockTags={renderMockTags} 
              />
            </div>`;

content = content.substring(0, startIndex) + replacement + '\n\n          ' + content.substring(endIndex);

// Also, fix the borders in the left column
content = content.replace(
  '<div className="lg:col-span-7 bg-white border border-slate-202 rounded-3xl p-6 shadow-sm space-y-5">',
  '<div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">'
);

fs.writeFileSync(path, content, 'utf8');
console.log('done');