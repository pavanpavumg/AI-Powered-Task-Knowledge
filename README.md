# TaskSphere KMS v2

An AI-Powered Task Knowledge Management System built with FastAPI, MySQL, React (Vite), and a local, high-performance FAISS semantic search vector store.

---

## Technology Stack

### Backend
- **Core Framework**: FastAPI (Uvicorn)
- **Database ORM**: SQLAlchemy 2.0 connected via `pymysql` (MySQL compatible)
- **Migrations**: Alembic
- **Security / RBAC**: Password hashing via `bcrypt`, JWT signature verification via `python-jose` containing id, email, and role claims.
- **AI Vector Store**: Local CPU-bound `faiss-cpu` flat inner-product index mapping sentences to documents.
- **Embedder**: `sentence-transformers` utilizing the pre-trained `all-MiniLM-L6-v2` model (384-dimensional vectors).

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Modern, responsive glassmorphic vanilla CSS design tokens.
- **Navigation/Icons**: `lucide-react`
- **Routing**: `react-router-dom` with custom role gate guards (`ProtectedRoute`).

---

## Architecture & Neural Search Flow

When a text document (`.txt`) is uploaded by an administrator, the backend saves the file locally and routes its content to the **Embedding Service**. The document is tokenized and sliced into overlapping sliding windows of 150 words. Each text chunk is passed through the `all-MiniLM-L6-v2` sentence-transformer model on the CPU to produce a 384-dimensional vector. These vectors are L2-normalized so that cosine similarity is equivalent to a simple dot product, and indexed inside a `faiss.IndexIDMap(faiss.IndexFlatIP(384))` vector index. The binary index (`faiss_index.bin`) and a metadata sidecar mapping (`metadata_sidecar.pkl`) are serialized to disk to survive server restarts. When searching, the user query is embedded and matched against the index using dot products, returning the top matches along with dynamic snippet previews and similarity scores.

---

## Setup & Running the System

### Option A: Docker Compose (Recommended)
Make sure you have Docker and Docker Compose installed, then run from the root directory:

```bash
# Start all services (MySQL DB, Backend API, Frontend App)
docker-compose up --build
```
- **Frontend App**: Accessible at `http://localhost:5173`
- **Backend API**: Accessible at `http://localhost:8000` (docs at `http://localhost:8000/docs`)
- **MySQL DB**: Running on port `3306` inside the container network.

---

### Option B: Manual Local Execution

#### 1. Setup MySQL Database
Create a MySQL database named `tasks_db` and ensure your user has appropriate permissions:
```sql
CREATE DATABASE tasks_db;
```

#### 2. Backend Setup
Configure your environment values in a `.env` file (based on `.env.example`):
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (or the app will automatically construct tables on startup)
alembic upgrade head

# Start server
uvicorn app.main:app --port 8000 --reload
```

#### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

---

## Seed Accounts
At startup, the database automatically populates roles (`admin`, `user`) and standard credentials:
- **Administrator**: `admin@example.com` / `adminpassword`
- **Regular User**: `user@example.com` / `userpassword`
