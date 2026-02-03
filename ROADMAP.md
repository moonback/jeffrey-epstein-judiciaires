# 🗺️ Roadmap: DOJ Forensic Analyzer

This roadmap outlines the evolution of the platform from its current MVP state to a full-featured forensic suite.

## ✅ Phase 1: MVP (Completed)
- [x] Functional React 19 / Vite infrastructure.
- [x] AI analysis engine via OpenRouter (Gemini 2.5 Flash Lite).
- [x] Local storage with IndexedDB.
- [x] Multi-tab investigative interface.
- [x] Dynamic Data Card view for analysis results.
- [x] Interactive Chat Assistant.
- [x] Basic Searchable Database view.

## 🚧 Phase 2: Enhanced Visualization (Current)
- [ ] **Network Graph Improvements**: Interactive nodes with entity details on click.
- [ ] **Advanced Timeline**: Scaleable timeline with event clustering.
- [ ] **Cross-Document Analysis**: Identify links between different independent analyses.
- [ ] **Entity Profiling**: dedicated view for "who's who" across all indexed documents.

## 🚀 Phase 3: V1.0 - Forensic Power Tools
- [ ] **PDF Direct Processing**: Upload local PDFs for AI-assisted extraction (instead of URL-only).
- [ ] **Export Suite**: Export to PDF, CSV, and Markdown for professional reports.
- [ ] **Collaboration Mode**: Shared Supabase workspaces for multi-user investigations.
- [ ] **OCR Integration**: Built-in OCR for scanned legal documents.
- [ ] **Automatic Conflict Detection**: Flag discrepancies between different source documents.

## 🔮 Phase 4: Long-Term Vision
- [ ] **Custom Model Fine-tuning**: Use extracted data to fine-tune a specialized legal LLM.
- [ ] **Audio/Video Forensics**: Process hearing recordings and video evidence.
- [ ] **Dark Web Integration**: Link DOJ disclosures with leaked archives or OSINT databases.
- [ ] **Global Search API**: Connect to other public legal databases (PACER, etc.).

---

## 📈 Current Priority
*   **Performance Optimization**: Reducing latency in the Network Graph.
*   **UI Polish**: Refining the "Investigation Planner" for better user onboarding.
*   **Data Integrity**: Improving JSON parsing reliability for complex AI responses.
