# Glass RAG Chatbot

A modern, glassmorphism-styled Retrieval-Augmented Generation (RAG) chatbot built with Next.js, Supabase, and Ollama. This application allows users to upload documents (PDF, DOCX, TXT), processes them into vector embeddings, and enables intelligent chat interactions with the document content using local AI models.

## ✨ Features

- **📄 Multi-Format Document Upload**: Support for PDF, DOCX, and TXT files.
- **🧠 Local AI Processing**: Uses **Ollama** for privacy-focused, local embedding generation and chat completion.
  - **Embeddings**: `nomic-embed-text:latest`
  - **Chat Model**: `llama3.2:latest`
- **🔍 Intelligent Retrieval**: Vector search powered by **Supabase (pgvector)** to find the most relevant document chunks for every query.
- **🎨 Glassmorphism UI**: A stunning, responsive interface built with TailwindCSS and Framer Motion, featuring:
  - Dynamic background animations.
  - Glass-panel aesthetics.
  - Smooth transitions and hover effects.
- **📱 Responsive Design**: Optimized layouts for both laptops and mobile devices.
- **📝 Markdown Support**: Rich text formatting in chat responses.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **AI/ML**: [Ollama](https://ollama.com/) (Local LLM Inference)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

1.  **Node.js** (v18+)
2.  **Ollama** installed and running locally.
    *   Pull the required models:
        ```bash
        ollama pull nomic-embed-text:latest
        ollama pull llama3.2:latest
        ```
3.  **Supabase Project** with `pgvector` extension enabled.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/devaamsh2006/RAG_CHATBOT.git
    cd RAG_CHATBOT
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    OLLAMA_BASE_URL=http://127.0.0.1:11434
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `/app`: Next.js App Router pages and API routes.
  - `/api/chat`: Handles chat completion requests.
  - `/api/upload`: Handles document processing and embedding storage.
- `/components`: Reusable UI components (ChatTab, UploadTab, Navbar).
- `/lib`: Utility functions and configurations.
  - `embeddings.js`: Ollama API integration.
  - `supabase.js`: Supabase client configuration.
  - `text-processor.js`: Text extraction and chunking logic.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
