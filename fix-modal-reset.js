const fs = require('fs');
let c = fs.readFileSync('src/components/crm/DealModal.tsx', 'utf8');

const replacement = `  useEffect(() => {
    if (isOpen && deal) {
      setTimelineEvents([]);
      setContactData(null);
      const fetchAllData = async () => {`;

const target = `  useEffect(() => {
    if (isOpen && deal) {
      const fetchAllData = async () => {`;

c = c.replace(target, replacement);

fs.writeFileSync('src/components/crm/DealModal.tsx', c);
console.log('done');
