const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

const target = `                  <div className="pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fim do histórico ({draft.timeline.length} eventos)
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>`;

const replacement = `                  <div className="pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fim do histórico ({draft.timeline.length} eventos)
                  </div>
                )}
              </div>
              </>
              )}
            </div>
          </div>
        </section>`;

c = c.replace(target, replacement);
fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', c);
console.log('Replaced by string');
