"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Search,
  Upload,
  FolderPlus,
  Grid,
  List,
  MoreVertical,
  Download,
  Trash2,
  FolderOpen,
  Filter,
  Eye,
  FileImage,
  ArrowLeft,
  Move,
  X,
  Folder,
  Copy,
  Check,
  ExternalLink,
  Link as LinkIcon
} from "lucide-react";

export default function ContentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Image detail & copy link modal state
  const [selectedImageForModal, setSelectedImageForModal] = useState<any | null>(null);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);

  // Folders state
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // New folder modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Move file dialog state
  const [movingFileId, setMovingFileId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFolders = localStorage.getItem("realizzare_media_folders");
      const storedFiles = localStorage.getItem("realizzare_media_files");

      const defaultFolders = [
        { id: "f-default", name: "Biblioteca Padrão", date: "12/07/2026" },
        { id: "f-banners", name: "Banners Black Friday", date: "05/07/2026" }
      ];

      const defaultFiles = [
        { id: "img-1", name: "logo_realizzare_main.png", size: "24.5 KB", date: "12/07/2026", type: "PNG", dimensions: "300x90", url: "https://media.realizzarecursos.com.br/uploads/logo_realizzare_main.png", folderId: "f-default" },
        { id: "img-2", name: "banner_black_friday_2026.jpg", size: "342 KB", date: "05/07/2026", type: "JPEG", dimensions: "1200x630", url: "https://media.realizzarecursos.com.br/uploads/banner_black_friday_2026.jpg", folderId: "f-banners" },
        { id: "img-3", name: "instructor_avatar_leonardo.png", size: "85.2 KB", date: "28/06/2026", type: "PNG", dimensions: "400x400", url: "https://media.realizzarecursos.com.br/uploads/instructor_avatar_leonardo.png", folderId: "f-default" },
        { id: "img-4", name: "background_email_newsletter.jpg", size: "112.4 KB", date: "20/06/2026", type: "JPEG", dimensions: "800x400", url: "https://media.realizzarecursos.com.br/uploads/background_email_newsletter.jpg", folderId: "f-default" }
      ];

      let foldersList = defaultFolders;
      if (storedFolders) {
        try {
          foldersList = JSON.parse(storedFolders);
        } catch (e) {
          foldersList = defaultFolders;
        }
      }
      if (!foldersList.some(f => f.id === "f-id-visual" || f.name.toLowerCase() === "id visual")) {
        foldersList = [...foldersList, { id: "f-id-visual", name: "ID Visual", date: "16/08/2026" }];
      }
      setFolders(foldersList);
      localStorage.setItem("realizzare_media_folders", JSON.stringify(foldersList));

      let filesList = defaultFiles;
      if (storedFiles) {
        try {
          filesList = JSON.parse(storedFiles);
        } catch (e) {
          filesList = defaultFiles;
        }
      }
      const hasFavicon = filesList.some(f => f.name === "logo_favicon.png" || f.id === "img-favicon");
      const hasRLogo = filesList.some(f => f.name === "r_logo_icon.png" || f.id === "img-r-logo");
      
      const newFilesToAdd = [];
      if (!hasFavicon) {
        newFilesToAdd.push({
          id: "img-favicon",
          name: "logo_favicon.png",
          size: "204 KB",
          date: "16/08/2026",
          type: "PNG",
          dimensions: "1024x1024",
          url: "/favicon.png",
          folderId: "f-id-visual"
        });
      }
      if (!hasRLogo) {
        newFilesToAdd.push({
          id: "img-r-logo",
          name: "r_logo_icon.png",
          size: "273 KB",
          date: "16/08/2026",
          type: "PNG",
          dimensions: "1024x1024",
          url: "/r-logo.png",
          folderId: "f-id-visual"
        });
      }
      
      if (newFilesToAdd.length > 0) {
        filesList = [...filesList, ...newFilesToAdd];
      }
      setFiles(filesList);
      localStorage.setItem("realizzare_media_files", JSON.stringify(filesList));
      setIsLoaded(true);
    }
  }, []);

  const saveFolders = (updated: any[]) => {
    setFolders(updated);
    localStorage.setItem("realizzare_media_folders", JSON.stringify(updated));
  };

  const saveFiles = (updated: any[]) => {
    setFiles(updated);
    localStorage.setItem("realizzare_media_files", JSON.stringify(updated));
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData("text/plain", fileId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("text/plain");
    if (!fileId) return;
    
    // Move file to target folder
    const updated = files.map((file) => {
      if (file.id === fileId) {
        return { ...file, folderId: targetFolderId };
      }
      return file;
    });
    saveFiles(updated);
    alert(`Imagem movida para a pasta com sucesso!`);
  };

  // Move file manually
  const handleMoveFile = (fileId: string, folderId: string | null) => {
    const updated = files.map((file) => {
      if (file.id === fileId) {
        return { ...file, folderId };
      }
      return file;
    });
    saveFiles(updated);
    setMovingFileId(null);
    alert(`Imagem movida com sucesso!`);
  };

  // Filtered files
  const filteredFiles = files.filter((file) => {
    // Search match
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Folder match
    if (selectedFolderId) {
      return matchesSearch && file.folderId === selectedFolderId;
    }
    // Only show loose files (no folderId) in the main root view
    return matchesSearch && !file.folderId;
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Conteúdos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Biblioteca de mídias e banco de dados de imagens para suas campanhas e templates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewFolderName("");
              setShowFolderModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-slate-350 bg-white rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-slate-500" />
            <span>Nova Pasta</span>
          </button>
          <button
            onClick={() => {
              const name = prompt("Digite o nome da imagem a simular upload:");
              if (!name) return;
              const newFile = {
                id: `img-${Date.now()}`,
                name: name.endsWith(".png") || name.endsWith(".jpg") ? name : name + ".png",
                size: "45.0 KB",
                date: new Date().toLocaleDateString("pt-BR"),
                type: "PNG",
                url: "",
                folderId: selectedFolderId
              };
              saveFiles([...files, newFile]);
              alert("Imagem simulada e adicionada à biblioteca!");
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-xs"
          >
            <Upload className="h-4 w-4" />
            <span>Fazer Upload</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb / Back button when folder is selected */}
      {selectedFolderId && (
        <button
          onClick={() => setSelectedFolderId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para todas as pastas</span>
        </button>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar imagens ou arquivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* View buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Filtros avançados de mídias estarão disponíveis em breve.")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-650 transition-all cursor-pointer"
          >
            <Filter className="h-4 w-4 text-slate-400" />
            <span>Filtros</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200" />

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-indigo-50 text-indigo-650" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-indigo-50 text-indigo-650" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid/List View */}
      {viewMode === "grid" ? (
        <div className="space-y-8">
          {/* Folders Section - only show when no folder is selected or viewing root */}
          {!selectedFolderId && (
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pastas de Mídia</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {folders.map((folder) => {
                  const folderFilesCount = files.filter(f => f.folderId === folder.id).length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, folder.id)}
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/10 transition-all flex flex-col gap-3 relative group cursor-pointer border-t-4 border-t-indigo-500 animate-scaleIn"
                    >
                      <div className="h-32 bg-indigo-50/30 rounded-2xl flex items-center justify-center text-indigo-650 relative group-hover:scale-95 transition-transform">
                        <FolderOpen className="h-10 w-10" />
                        <span className="absolute top-2 right-2 text-[9px] bg-indigo-100 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-black uppercase">
                          Área de Drop
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{folder.name}</span>
                          <span className="text-[11px] text-slate-450 mt-0.5 block">{folderFilesCount} imagens • Modificado em {folder.date}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remover pasta "${folder.name}"? As imagens nela continuarão existindo.`)) {
                              saveFolders(folders.filter(f => f.id !== folder.id));
                              saveFiles(files.map(f => f.folderId === folder.id ? { ...f, folderId: null } : f));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Images / Files Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {selectedFolderId ? `Imagens na pasta: ${folders.find(f => f.id === selectedFolderId)?.name}` : "Imagens Soltas / Todas"}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{filteredFiles.length} imagens</span>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="border border-dashed border-slate-250 bg-slate-50/20 rounded-3xl p-12 text-center text-slate-400 text-xs">
                Nenhum arquivo encontrado nesta pasta ou com a busca atual.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id)}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col gap-3 relative group cursor-grab active:cursor-grabbing hover:scale-[1.01]"
                  >
                    <div
                      onClick={() => setSelectedImageForModal(file)}
                      className="h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 relative overflow-hidden cursor-pointer group-hover:bg-slate-100/70 transition-colors"
                    >
                      {file.url ? (
                        <img src={file.url} alt={file.name} className="h-16 object-contain" />
                      ) : (
                        <FileImage className="h-10 w-10 text-slate-350" />
                      )}
                      
                      {/* Hover Overlay with Copy Link button */}
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="px-3 py-1.5 bg-white text-slate-900 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ver Link & Detalhes</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div
                        onClick={() => setSelectedImageForModal(file)}
                        className="overflow-hidden text-left flex-1 min-w-0 pr-1 cursor-pointer"
                      >
                        <span className="font-bold text-slate-800 block text-xs truncate hover:text-indigo-600" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-550 mt-0.5 block">{file.size} • {file.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const linkToCopy = file.url || `https://media.realizzarecursos.com.br/uploads/${file.name}`;
                            navigator.clipboard.writeText(linkToCopy);
                            alert(`✅ Link copiado!\n${linkToCopy}`);
                          }}
                          className="p-1.5 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Copiar Link para E-mail"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {/* Quick Move Button */}
                        <button
                          onClick={() => setMovingFileId(file.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Mover de pasta"
                        >
                          <Move className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remover imagem "${file.name}" permanentemente?`)) {
                              saveFiles(files.filter((f) => f.id !== file.id));
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-450 hover:text-red-500 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider bg-slate-50/50 select-none">
                <th className="py-3 px-5">Nome do Arquivo</th>
                <th className="py-3 px-5">Pasta</th>
                <th className="py-3 px-5">Tamanho</th>
                <th className="py-3 px-5">Tipo</th>
                <th className="py-3 px-5">Modificado Em</th>
                <th className="py-3 px-5 text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-800 flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{file.name}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-slate-500 font-semibold">
                      {folders.find(f => f.id === file.folderId)?.name || "Nenhuma"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-550">{file.size}</td>
                  <td className="py-4 px-5">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[9px]">
                      {file.type}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-500">{file.date}</td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setMovingFileId(file.id)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title="Mover para pasta"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remover imagem "${file.name}" permanentemente?`)) {
                            saveFiles(files.filter((f) => f.id !== file.id));
                          }
                        }}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Placeholder */}
      <div className="border border-dashed border-slate-350 rounded-3xl p-8 text-center bg-slate-50/30 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xs font-extrabold text-slate-850">Dica de Produtividade</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Arraste e solte qualquer imagem diretamente sobre os cartões das pastas acima para movê-las.
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL: NOVA PASTA                                     */}
      {/* ==================================================== */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-805">Criar Nova Pasta</h3>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFolderName.trim()) return;

                const newFolder = {
                  id: `f-${Date.now()}`,
                  name: newFolderName.trim(),
                  date: new Date().toLocaleDateString("pt-BR")
                };

                saveFolders([...folders, newFolder]);
                setShowFolderModal(false);
                alert(`Pasta "${newFolderName}" criada com sucesso!`);
              }}
              className="space-y-4 pt-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nome da Pasta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha de Natal"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: SELECIONAR PASTA DESTINO                       */}
      {/* ==================================================== */}
      {movingFileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-805">Mover Imagem para...</h3>
              <button
                onClick={() => setMovingFileId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 pt-4 max-h-[300px] overflow-y-auto">
              {/* Raiz Option */}
              <button
                onClick={() => handleMoveFile(movingFileId, null)}
                className="w-full text-left p-3 hover:bg-indigo-50 border border-slate-200 rounded-xl flex items-center gap-2 transition-colors group cursor-pointer"
              >
                <Folder className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Todas / Raiz (Nenhuma pasta)</span>
              </button>

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveFile(movingFileId, folder.id)}
                  className="w-full text-left p-3 hover:bg-indigo-50 border border-slate-200 rounded-xl flex items-center gap-2 transition-colors group cursor-pointer"
                >
                  <FolderOpen className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">{folder.name}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end text-xs font-bold">
              <button
                type="button"
                onClick={() => setMovingFileId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DETALHES DA IMAGEM E COPIAR LINK              */}
      {/* ==================================================== */}
      {selectedImageForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-5 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 truncate max-w-md">{selectedImageForModal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedImageForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Left image preview, Right link info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Left Column: Image Preview Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden group shadow-inner">
                {selectedImageForModal.url ? (
                  <img
                    src={selectedImageForModal.url}
                    alt={selectedImageForModal.name}
                    className="max-h-52 object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <FileImage className="h-16 w-16 text-slate-600" />
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold">
                    {selectedImageForModal.dimensions || "1200x630"}
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-slate-300 rounded text-[10px] font-bold uppercase">
                    {selectedImageForModal.type || "PNG"}
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-slate-300 rounded text-[10px] font-bold">
                    {selectedImageForModal.size || "142 KB"}
                  </span>
                </div>
              </div>

              {/* Right Column: Web Link & Quick Actions */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Link Direto para Uso em E-mails (URL Web)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedImageForModal.url || `https://media.realizzarecursos.com.br/uploads/${selectedImageForModal.name}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-mono text-[11px] text-slate-800 focus:outline-none select-all"
                    />
                    <button
                      onClick={() => {
                        const linkToCopy = selectedImageForModal.url || `https://media.realizzarecursos.com.br/uploads/${selectedImageForModal.name}`;
                        navigator.clipboard.writeText(linkToCopy);
                        setCopiedLinkToast(true);
                        setTimeout(() => setCopiedLinkToast(false), 3000);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
                    >
                      {copiedLinkToast ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-300 animate-bounce" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  {copiedLinkToast && (
                    <span className="text-[10px] font-bold text-emerald-600 mt-1 block animate-fadeIn">
                      ✓ Link copiado para a área de transferência! Pronto para colar no editor HTML.
                    </span>
                  )}
                </div>

                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 space-y-1">
                  <span className="font-bold text-indigo-900 block">Dica para Edição de E-mail HTML:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Cole este URL na tag <code className="bg-white px-1 py-0.5 rounded border border-indigo-200 text-indigo-700 font-mono">&lt;img src="..." /&gt;</code> do seu template para garantir carregamento instantâneo.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={selectedImageForModal.url || `#`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Visualizar na Web</span>
                  </a>
                  <button
                    onClick={() => setSelectedImageForModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
