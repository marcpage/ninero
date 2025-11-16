# ninero

Project Niñero

## Running backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.backend.main:app --reload &
open http://127.0.0.1:8000/docs
```

## Running frontend

```bash
 cd src/frontend
 npm install
 npm audit fix --force
 npm run dev
 ```

## Endpoints to support

```text
INFO:     127.0.0.1:59572 - "GET /apple-touch-icon-precomposed.png HTTP/1.1" 404 Not Found
INFO:     127.0.0.1:59573 - "GET /apple-touch-icon.png HTTP/1.1" 404 Not Found
INFO:     127.0.0.1:59574 - "GET /favicon.ico HTTP/1.1" 404 Not Found
```
