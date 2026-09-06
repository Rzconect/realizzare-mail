const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/campaigns/create/page.tsx', 'utf-8');

// 1. targetListStr generation (saving)
content = content.replace(
  'const targetListStr = (listNames || "Nenhuma lista selecionada") + "||IDS||" + selectedIncludeLists.join(",");',
  'const targetListStr = (listNames || "Nenhuma lista selecionada") + "||IDS||" + selectedIncludeLists.join(",") + "||EXCLUDE_IDS||" + selectedExcludeLists.join(",");'
);

// 2. target_list loading
const oldLoadTarget = `            if (found.target_list && found.target_list.includes("||IDS||")) {
              const idsPart = found.target_list.split("||IDS||")[1];
              if (idsPart) {
                setSelectedIncludeLists(idsPart.split(",").filter(Boolean));
              }
            }`;
const newLoadTarget = `            if (found.target_list && found.target_list.includes("||IDS||")) {
              const [mainPart, excludePart] = found.target_list.split("||EXCLUDE_IDS||");
              const idsPart = mainPart.split("||IDS||")[1];
              if (idsPart) {
                setSelectedIncludeLists(idsPart.split(",").filter(Boolean));
              }
              if (excludePart) {
                setSelectedExcludeLists(excludePart.split(",").filter(Boolean));
              }
            }`;
content = content.replace(oldLoadTarget, newLoadTarget);

// 3. Navigation "Voltar" and "Continuar"
const oldBackBtn = `onClick={() => setWizardStep((s) => s - 1)}`;
const newBackBtn = `onClick={() => { saveDraftToDatabase(true).then(() => setWizardStep((s) => s - 1)) }}`;
content = content.replace(oldBackBtn, newBackBtn);

const oldContinueBtn = `onClick={() => setWizardStep((s) => s + 1)}`;
const newContinueBtn = `onClick={() => { saveDraftToDatabase(true).then(() => setWizardStep((s) => s + 1)) }}`;
content = content.replace(oldContinueBtn, newContinueBtn);

// 4. Step 1 "Voltar" link -> button
const oldLinkBack = `<Link
              href="/dashboard/campaigns"
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-md text-xs font-bold transition-all"
            >
              Voltar
            </Link>`;
const newLinkBack = `<button
              type="button"
              onClick={() => { saveDraftToDatabase(true).then(() => window.location.href = "/dashboard/campaigns") }}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-md text-xs font-bold transition-all cursor-pointer"
            >
              Voltar
            </button>`;
content = content.replace(oldLinkBack, newLinkBack);

// 5. SelectContactsModal (Contatos diretos limit to 10 instead of 20)
// The modal was slicing 20. But I changed the dropdown exclude to slice 10. Wait, the modal is showSelectContactsModal.
// Let's replace .slice(0, contactSearchQuery.trim() ? undefined : 20) to 10
content = content.replace(/\.slice\(0, contactSearchQuery\.trim\(\) \? undefined : 20\)/g, ".slice(0, contactSearchQuery.trim() ? undefined : 10)");

fs.writeFileSync('src/app/dashboard/campaigns/create/page.tsx', content, 'utf-8');
console.log('Done patch 5.');
