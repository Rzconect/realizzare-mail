const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(
  'Nenhuma transação encontrada.</p>\n                          )}\n                        </div>',
  'Nenhuma transação encontrada.</p>\n                          )}\n                          </>)}\n                        </div>'
);

c = c.replace(
  'Nenhum evento registrado.</p>\n                            )}\n                          </div>',
  'Nenhum evento registrado.</p>\n                            )}\n                            </>)}\n                          </div>'
);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed syntax 4');
