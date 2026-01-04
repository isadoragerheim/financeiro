"use client";

import React, { useMemo, useState } from "react";

type Modality = "avista" | "assinaturas" | "parcelado";

const CATEGORIES = [
  "alimentação",
  "alimentação caprichada",
  "rolê",
  "vestimenta",
  "casa",
  "viagem",
  "saúde",
  "assinaturas",
  "outros",
] as const;

const PAYMENT_METHODS = [
  "dinheiro euro",
  "dinheiro real",
  "cartão de crédito AL",
  "cartão de débito AL",
  "cartão de crédito BR",
  "cartão de débito BR",
] as const;

export default function Page() {
  const [type, setType] = useState<"Entrada" | "Saída">("Saída");
  const [value, setValue] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [item, setItem] = useState<string>("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [modality, setModality] = useState<Modality>("avista");
  const [installments, setInstallments] = useState<number>(3);

  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!value || !date || !category || !paymentMethod || !modality || !type) return false;
    if (modality === "parcelado" && (installments < 2 || installments > 12)) return false;
    return true;
  }, [value, date, category, paymentMethod, modality, installments]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);

    try {
      const payload: any = {
        type,
        value,
        date, // "YYYY-MM-DD" vindo do input date
        item,
        category,
        paymentMethod,
        modality,
      };
      if (modality === "parcelado") payload.installments = installments;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        window.alert(`Erro: ${data.error || "Falha ao registrar."}`);
        return;
      }

      window.alert("Entrada registrada!");
      // limpa campos principais
      setType("Saída");
      setValue("");
      setDate("");
      setItem("");
      setModality("avista");
      setInstallments(3);
    } catch (err: any) {
      window.alert(`Erro: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Financeiro — Registrar pagamento</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value as "Entrada" | "Saída")} style={inputStyle}>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </label>
        
        <label style={{ display: "grid", gap: 6 }}>
          <span>Valor</span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 10.00"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Data</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Item (opcional)</span>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Ex: mercado, uber..."
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Categoria</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Forma de pagamento</span>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Modalidade</span>
          <select value={modality} onChange={(e) => setModality(e.target.value as Modality)} style={inputStyle}>
            <option value="avista">à vista</option>
            <option value="assinaturas">assinaturas</option>
            <option value="parcelado">parcelado</option>
          </select>
        </label>

        {modality === "parcelado" && (
          <label style={{ display: "grid", gap: 6 }}>
            <span>Número de parcelas (2 a 12)</span>
            <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} style={inputStyle}>
              {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                <option key={n} value={n}>{n}x</option>
              ))}
            </select>
          </label>
        )}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: loading ? "#f3f3f3" : "white",
            cursor: (!canSubmit || loading) ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Processando..." : "Registrar"}
        </button>
      </form>

      <p style={{ marginTop: 14, color: "#666", fontSize: 13 }}>
        Regra do parcelamento: se a compra for no dia 1–6, começa no mês da compra; se for dia 7+, começa no mês seguinte.
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 14,
};

