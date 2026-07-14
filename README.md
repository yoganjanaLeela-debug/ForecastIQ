# Frontend (bonus, not part of the scored pipeline)

`ForecastIQ.jsx` is a standalone React demo dashboard (KPIs, forecast charts,
scenario simulator, budget optimizer, risk radar, AI assistant, executive
reports, a login screen, etc.) used to present the project. It is **not**
read, run, or scored by the automated testing pipeline described in the
submission guide — only `run.sh`, `requirements.txt`, `data/`, and
`pickle/model.pkl` are.

It expects to run inside an environment that provides:
- Recharts and lucide-react (`npm install recharts lucide-react`)
- A `window.storage` key-value API (used as a lightweight demo "DB" for the
  login screen). Outside that kind of environment, swap the auth calls in
  `LoginPage`/`App` for real API calls to your own backend.

To use it as a normal Vite/CRA app instead, drop it in as `src/App.jsx` and
wire up the storage calls to your own auth API.
