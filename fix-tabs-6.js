const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const regex = /Fim do hist[\s\S]*?eventos\)\r?\n\s*<\/div>\r?\n\s*\}\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/section>/;

const replacement = `Fim do histórico ({draft.timeline.length} eventos)
                  </div>
                )}
              </div>
              </>
              )}
            </div>
          </div>
        </section>`;

if(regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
  console.log('Successfully replaced and fixed syntax error!');
} else {
  console.log('REGEX DID NOT MATCH!');
}
