"use client";

import { useState, useRef } from "react";

interface HistoryEntry {
  id: string;
  amount: string;
  address: string;
  txHash: string;
  timestamp: Date;
  status: "success" | "error";
  errorMessage?: string;
}

function truncate(str: string, start = 8, end = 6) {
  if (str.length <= start + end + 3) return str;
  return `${str.slice(0, start)}…${str.slice(-end)}`;
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function FaucetWidget() {
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    if (!publicKey.trim()) return "Public API key is required.";
    if (!address.trim()) return "Wallet address is required.";
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return "Amount must be greater than 0.";
    if (amt > 1) return "Amount cannot exceed 1 BTT per request.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const response = await fetch("/api/faucet", {
      method: "POST",
      body: JSON.stringify({
        amount: parseFloat(amount),
        public_key: publicKey,
        address,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        amount: data?.amount ?? amount,
        address: data?.address ?? address,
        txHash: "-",
        timestamp: new Date(),
        status: "error",
        errorMessage: data?.message ?? "Unknown error",
      };
      setHistory((prev) => [entry, ...prev]);
      setError(data?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const entry: HistoryEntry = {
      id: data.id,
      amount: data.amount,
      address: data.address,
      txHash: data.txHash,
      timestamp: new Date(data.timestamp),
      status: data.status,
    };

    setHistory((prev) => [entry, ...prev]);
    setSuccess(`${amount} BTT sent successfully!`);
    setAmount("");
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
        margin: "2rem 0",
        fontFamily: "inherit",
      }}
      className="faucet-root"
    >
      <style>{`
        .faucet-root * { box-sizing: border-box; }

        .faucet-card {
          background: var(--color-fd-card, #18181b);
          border: 1px solid var(--color-fd-border, rgba(255,255,255,0.08));
          border-radius: 14px;
          padding: 1.5rem;
        }

        .faucet-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-fd-muted-foreground, #71717a);
          margin-bottom: 0.4rem;
        }

        .faucet-input {
          width: 100%;
          background: var(--color-fd-background, #09090b);
          border: 1px solid var(--color-fd-border, rgba(255,255,255,0.1));
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: var(--color-fd-foreground, #fafafa);
          outline: none;
          transition: border-color 0.15s;
          margin-bottom: 1rem;
        }
        .faucet-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .faucet-input::placeholder { color: #52525b; }

        .faucet-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }
        .faucet-row .faucet-input { margin-bottom: 0; flex: 1; }

        .faucet-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .faucet-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .faucet-btn:active:not(:disabled) { transform: translateY(0); }
        .faucet-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .faucet-msg {
          font-size: 0.8rem;
          border-radius: 7px;
          padding: 0.55rem 0.85rem;
          margin-top: 1rem;
        }
        .faucet-msg-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
        }
        .faucet-msg-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #4ade80;
        }

        .faucet-hint {
          font-size: 0.73rem;
          color: #52525b;
          margin-top: 0.85rem;
          line-height: 1.5;
        }
        .faucet-hint code {
          background: rgba(255,255,255,0.06);
          padding: 0.1em 0.35em;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .faucet-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 1rem;
        }

        .faucet-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 160px;
          color: #3f3f46;
          font-size: 0.8rem;
          gap: 0.5rem;
          text-align: center;
        }

        .faucet-history-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 2px;
        }
        .faucet-history-list::-webkit-scrollbar { width: 4px; }
        .faucet-history-list::-webkit-scrollbar-track { background: transparent; }
        .faucet-history-list::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }

        .faucet-history-item {
          background: var(--color-fd-background, #09090b);
          border: 1px solid var(--color-fd-border, rgba(255,255,255,0.06));
          border-radius: 9px;
          padding: 0.7rem 0.9rem;
          font-size: 0.78rem;
        }
        .faucet-history-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .faucet-badge-success {
          background: rgba(34,197,94,0.12);
          color: #4ade80;
          border-radius: 5px;
          padding: 0.15em 0.55em;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .faucet-badge-error {
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border-radius: 5px;
          padding: 0.15em 0.55em;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .faucet-time {
          color: #52525b;
          font-size: 0.7rem;
        }
        .faucet-history-row {
          display: flex;
          justify-content: space-between;
          color: #71717a;
          gap: 0.5rem;
          line-height: 1.7;
        }
        .faucet-history-row span:first-child {
          color: #52525b;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          min-width: 54px;
        }
        .faucet-history-row span:last-child {
          color: var(--color-fd-foreground, #d4d4d8);
          font-family: 'SFMono-Regular', 'Consolas', monospace;
          font-size: 0.75rem;
          text-align: right;
          word-break: break-all;
        }
        .faucet-amount-badge {
          color: #60a5fa;
          font-weight: 700;
        }

        .faucet-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: faucet-spin 0.7s linear infinite;
        }
        @keyframes faucet-spin { to { transform: rotate(360deg); } }

        @media (max-width: 700px) {
          .faucet-root {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── LEFT: Form ── */}
      <div className="faucet-card">
        <p className="faucet-section-title">Request tokens</p>

        <label className="faucet-label">Public API Key</label>
        <input
          className="faucet-input"
          placeholder="pk_test_…"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />

        <label className="faucet-label">Recipient Address</label>
        <input
          className="faucet-input"
          placeholder="0x…"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />

        <label className="faucet-label">Amount (BTT)</label>
        <div className="faucet-row">
          <input
            className="faucet-input"
            type="number"
            placeholder="0.5"
            min="0.000001"
            max="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <button
            className="faucet-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="faucet-spinner" />
                Sending…
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>

        {error && <div className="faucet-msg faucet-msg-error">{error}</div>}
        {success && (
          <div className="faucet-msg faucet-msg-success">✓ {success}</div>
        )}

        <p className="faucet-hint">
          Network: <code>bsc_testnet</code> · Token: <code>BTT</code>
          <br />
          Max <code>1 BTT</code> per request · Limit: <code>10 req/hour</code>
        </p>
      </div>

      {/* ── RIGHT: History ── */}
      <div className="faucet-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <p className="faucet-section-title" style={{ marginBottom: 0 }}>
            Transaction history
          </p>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              style={{
                background: "none",
                border: "none",
                color: "#52525b",
                fontSize: "0.7rem",
                cursor: "pointer",
                padding: "0.15rem 0.4rem",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="faucet-empty">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6M9 12h6M9 15h4" />
            </svg>
            <span>No transactions yet.</span>
            <span style={{ color: "#3f3f46" }}>Requests will appear here.</span>
          </div>
        ) : (
          <div className="faucet-history-list">
            {history.map((entry) => (
              <div key={entry.id} className="faucet-history-item">
                <div className="faucet-history-item-header">
                  <span
                    className={
                      entry.status === "success"
                        ? "faucet-badge-success"
                        : "faucet-badge-error"
                    }
                  >
                    {entry.status === "success" ? "Success" : "Failed"}
                  </span>
                  <span className="faucet-time">
                    {timeAgo(entry.timestamp)}
                  </span>
                </div>
                <div className="faucet-history-row">
                  <span>Amount</span>
                  <span className="faucet-amount-badge">
                    {entry.amount} BTT
                  </span>
                </div>
                <div className="faucet-history-row">
                  <span>Address</span>
                  <span>{truncate(entry.address)}</span>
                </div>
                {entry.status === "success" ? (
                  <div className="faucet-history-row">
                    <span>Tx Hash</span>
                    <a
                      href={`https://testnet.bscscan.com/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{truncate(entry.txHash, 10, 8)}</span>
                    </a>
                  </div>
                ) : (
                  <div className="faucet-history-row">
                    <span>Error</span>
                    <span style={{ color: "#f87171" }}>
                      {entry.errorMessage}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}