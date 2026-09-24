const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/\{openSections\.cursos && \(\s*\{profile\.enrollments/g, '{openSections.cursos && (<>{profile.enrollments');

// The closing tag was replaced but let's make sure it is valid:
// {profile.enrollments && ... ) : ( <p>...</p> )} )}</div> --> Should be <p>...</p> )}</>)}</div>
c = c.replace(/Nenhuma matrícula encontrada\.<\/p>\s*\)\}\s*\}\)\s*<\/div>/g, 'Nenhuma matrícula encontrada.</p>)}</>)}</div>');
c = c.replace(/Nenhuma matrícula encontrada\.<\/p>\s*\)\}\s*<\/div>/g, 'Nenhuma matrícula encontrada.</p>)}</>)}</div>');

// Same for transacoes
c = c.replace(/\{openSections\.transacoes && \(\s*\{profile\.purchases/g, '{openSections.transacoes && (<>{profile.purchases');
c = c.replace(/Nenhuma transaǜo encontrada\.<\/div>\s*\)\}\s*<\/div>/g, 'Nenhuma transaǜo encontrada.</div>)}</>)}</div>');
c = c.replace(/Nenhuma transação encontrada\.<\/div>\s*\)\}\s*<\/div>/g, 'Nenhuma transação encontrada.</div>)}</>)}</div>');


// Same for timeline
c = c.replace(/\{openSections\.timeline && \(\s*\{synthesizedTimeline\.length/g, '{openSections.timeline && (<>{synthesizedTimeline.length');
c = c.replace(/Nenhum evento registrado\.<\/p>\s*\)\}\s*\)\}\s*<\/div>/g, 'Nenhum evento registrado.</p>)}</>)}</div>');


fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed syntax correctly');
