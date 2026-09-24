const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex = /\s*\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;

const replacement = `
                  )}
                </div>
                </>
              )}
            </div>
          </div>
        </section>`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Closed the tab block');
