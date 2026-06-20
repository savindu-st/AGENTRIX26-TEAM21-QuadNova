import React, { useState } from 'react';
import { BookOpen, FileText, Upload, Search, ChevronRight, Plus } from 'lucide-react';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Static files simulating what the RAG engine uses
  const documents = [
    { id: 1, title: 'Birth Certificate Correction Guidelines', type: 'Markdown', size: '12 KB', uploaded: '2023-10-12', status: 'Active' },
    { id: 2, title: 'Passport Renewal Checklist 2024', type: 'PDF', size: '1.2 MB', uploaded: '2024-01-05', status: 'Active' },
    { id: 3, title: 'Tree Felling Permit Legal Requirements', type: 'Markdown', size: '8 KB', uploaded: '2023-11-20', status: 'Active' },
    { id: 4, title: 'Driving License Medical Standards', type: 'Markdown', size: '15 KB', uploaded: '2023-09-15', status: 'Draft' },
    { id: 5, title: 'Land Deed Transfer Tax Rates', type: 'Excel', size: '45 KB', uploaded: '2024-02-10', status: 'Active' },
  ];

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Knowledge Base</h1>
          <p className="text-slate-400">Manage the official documents and guidelines used by the VisitGuard AI.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Folders / Categories */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2">Categories</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <ul className="divide-y divide-slate-800/50">
              {['All Documents', 'Civil Registration', 'Passports & Visas', 'Land & Property', 'Motor Traffic'].map((cat, i) => (
                <li key={cat}>
                  <button className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${i === 0 ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500' : 'text-slate-300 hover:bg-slate-800/50'}`}>
                    {cat}
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>

        {/* Right Column: Documents List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xl"
            />
          </div>

          {/* Document Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Document Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                          {doc.type === 'Markdown' || doc.type === 'PDF' ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <span className="text-slate-200 font-medium group-hover:text-indigo-300 transition-colors">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{doc.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{doc.size}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{doc.uploaded}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        doc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocs.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No documents found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
