"use client";

import { useState, useMemo } from "react";

const DECLINE_CODES: { code: string; description: string }[] = [
  {
    code: "missing_token",
    description:
      "The bearer token required for authorization was not found in the request. Ensure that a valid Authorization header with a Bearer token is included.",
  },
  {
    code: "invalid_token",
    description:
      "The authentication token provided is either invalid or has expired. Please obtain a new token and try again.",
  },
  {
    code: "invalid_api_key",
    description:
      "The API key provided is invalid. Please check that both the public key and secret key are correct and properly configured.",
  },
  {
    code: "unauthorized",
    description:
      "You do not have authorization to access this resource. Please check your API keys and ensure they are correctly configured.",
  },
  {
    code: "insufficient_permissions",
    description:
      "The provided credentials do not have enough permissions to perform this action. Ensure that the API key or token has the required access levels.",
  },
  {
    code: "invalid_refresh_token",
    description:
      "The refresh token provided is invalid. Please ensure that you are using a valid and unexpired refresh token.",
  },
  {
    code: "idempotency_key_reuse",
    description:
      "The Idempotency-Key provided has already been used to send the same request. Please use a unique key for each request to ensure idempotency.",
  },
  {
    code: "idempotency_key_not_found",
    description:
      "The Idempotency-Key was not found in the request headers. Please include a unique Idempotency-Key to ensure idempotency of the request.",
  },
  {
    code: "invoice_not_found",
    description:
      "No invoice was found for the provided ID. Please verify the invoice ID and try again.",
  },
  {
    code: "payment_request_not_found",
    description:
      "No payment request was found for the provided ID. Please verify the payment request ID and try again.",
  },
  {
    code: "wallet_not_found",
    description:
      "No wallet found for the requested currency. Ensure that you have received this currency or made a deposit before proceeding.",
  },
  {
    code: "insufficient_balance",
    description:
      "Your balance is too low to cover the requested amount plus the transaction fee. Please ensure you have enough funds.",
  },
  {
    code: "payout_not_found",
    description:
      "No payout was found for the provided ID. Please verify the payout ID and try again.",
  },
  {
    code: "internal_server_error",
    description:
      "An error occurred on Cicapay's side. Please try again later or contact our customer service for assistance.",
  },
  {
    code: "invalid_field_type",
    description:
      "The field type in your request body is invalid. Please carefully check the key and ensure it matches the expected type.",
  },
  {
    code: "invalid_field_value",
    description:
      "The value provided for a field is invalid. Please verify the field values and ensure they conform to the required format or constraints.",
  },
  {
    code: "value_too_large",
    description:
      "The value provided for a field is too long. Check the error param to identify which field exceeds the allowed size.",
  },
];

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(59,130,246,0.25)",
          color: "inherit",
          borderRadius: "3px",
          padding: "0 2px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

export function DeclineCodeTable() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DECLINE_CODES;
    return DECLINE_CODES.filter((row) => row.code.toLowerCase().includes(q));
  }, [query]);

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <style>{`
        .dct-search-wrap {
          position: relative;
          margin-bottom: 1rem;
          max-width: 360px;
        }
        .dct-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #52525b;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .dct-search {
          width: 100%;
          background: var(--color-fd-card, #18181b);
          border: 1px solid var(--color-fd-border, rgba(255,255,255,0.08));
          border-radius: 8px;
          padding: 0.55rem 0.85rem 0.55rem 2.25rem;
          font-size: 0.875rem;
          font-family: 'SFMono-Regular', 'Consolas', monospace;
          color: var(--color-fd-foreground, #fafafa);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dct-search:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .dct-search::placeholder { color: #52525b; font-family: inherit; }
        .dct-clear {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #52525b;
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: color 0.1s;
        }
        .dct-clear:hover { color: var(--color-fd-foreground, #fafafa); }

        .dct-table-wrap {
          border: 1px solid var(--color-fd-border, rgba(255,255,255,0.08));
          border-radius: 10px;
          overflow: hidden;
        }
        .dct-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .dct-table thead tr {
          background: var(--color-fd-card, #18181b);
          border-bottom: 1px solid var(--color-fd-border, rgba(255,255,255,0.08));
        }
        .dct-table th {
          padding: 0.65rem 1rem;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #52525b;
        }
        .dct-table th:first-child { width: 38%; }
        .dct-table tbody tr {
          border-bottom: 1px solid var(--color-fd-border, rgba(255,255,255,0.05));
          transition: background 0.1s;
        }
        .dct-table tbody tr:last-child { border-bottom: none; }
        .dct-table tbody tr:hover {
          background: var(--color-fd-card, rgba(255,255,255,0.03));
        }
        .dct-table td {
          padding: 0.75rem 1rem;
          vertical-align: top;
          color: var(--color-fd-foreground, #d4d4d8);
        }
        .dct-code {
          font-family: 'SFMono-Regular', 'Consolas', monospace;
          font-size: 0.8rem;
          color: #60a5fa;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 5px;
          padding: 0.15em 0.5em;
          white-space: nowrap;
        }
        .dct-desc {
          color: var(--color-fd-muted-foreground, #71717a);
          font-size: 0.85rem;
          line-height: 1.55;
        }
        .dct-empty {
          padding: 2.5rem 1rem;
          text-align: center;
          color: #52525b;
          font-size: 0.85rem;
        }
        .dct-count {
          font-size: 0.72rem;
          color: #52525b;
          margin-bottom: 0.75rem;
          font-variant-numeric: tabular-nums;
        }
      `}</style>

      {/* Search */}
      <div className="dct-search-wrap">
        <span className="dct-search-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          className="dct-search"
          placeholder="Search by code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        {query && (
          <button
            className="dct-clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="dct-count">
        {filtered.length === DECLINE_CODES.length
          ? `${DECLINE_CODES.length} codes`
          : `${filtered.length} of ${DECLINE_CODES.length} codes`}
      </p>

      {/* Table */}
      <div className="dct-table-wrap">
        <table className="dct-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={2} className="dct-empty">
                  No decline code matching <strong>"{query}"</strong>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.code}>
                  <td>
                    <span className="dct-code">
                      {highlight(row.code, query)}
                    </span>
                  </td>
                  <td className="dct-desc">{row.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
