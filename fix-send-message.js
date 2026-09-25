const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

c = c.replace(/const \[messageText, setMessageText\] = useState\(""\);/, 'const [messageText, setMessageText] = useState("");\n  const [replyingTo, setReplyingTo] = useState<any>(null);\n  const [editingMessage, setEditingMessage] = useState<any>(null);');

const sendRegex = /const handleSendMessage = async \(e: React\.FormEvent\) => \{[\s\S]*?if \(!messageText\.trim\(\) \|\| !activeChatId\) return;[\s\S]*?const chat = chats\.find\(c => c\.id === activeChatId\);[\s\S]*?if \(!chat\) return;/;

c = c.replace(sendRegex, `const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    if (editingMessage) {
      // Handle Edit
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map((m: any) => m.id === editingMessage.id ? { ...m, text: messageText } : m)
          };
        }
        return c;
      }));
      
      supabase.from('whatsapp_messages').update({ content_text: messageText }).eq('id', editingMessage.id).then();
      
      setMessageText("");
      setEditingMessage(null);
      return;
    }`);

c = c.replace('const textToSend = messageText;', `let textToSend = messageText;
    if (replyingTo) {
      const shortReply = replyingTo.text.substring(0, 30) + (replyingTo.text.length > 30 ? "..." : "");
      textToSend = \`[Respondendo a: \${shortReply}]\\n\\n\` + textToSend;
      setReplyingTo(null);
    }`);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed send message in conversations/page.tsx');
