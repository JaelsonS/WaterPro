"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPermissionGate } from "@/components/dashboard/DashboardLayoutClient";
import { useDashboardAuthContext } from "@/components/dashboard/DashboardAuthProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useToast } from "@/components/ui/Toast";
import { waterproApiFetch } from "@/lib/backend/waterproApi";
import type { SellerRecord } from "@/lib/dashboard/types";

type SellerFormState = {
  name: string;
  phone: string;
  email: string;
  role: string;
  active: boolean;
};

const emptyForm: SellerFormState = {
  name: "",
  phone: "",
  email: "",
  role: "sales_rep",
  active: true,
};

export default function VendedoresPage() {
  const { sessionToken, setCanManage } = useDashboardAuthContext();
  const toast = useToast();
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SellerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadSellers = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await waterproApiFetch<{ sellers: SellerRecord[] }>("/api/v1/sellers", {
        method: "GET",
        token: sessionToken,
      });
      setSellers(res.sellers ?? []);
      setCanManage(true);
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      if (err.status === 403 || err.status === 401) {
        setCanManage(false);
        return;
      }
      setError(err.message ?? "Não foi possível carregar os vendedores.");
    } finally {
      setLoading(false);
    }
  }, [sessionToken, setCanManage]);

  useEffect(() => {
    void loadSellers();
  }, [loadSellers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q),
    );
  }, [sellers, query]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(seller: SellerRecord) {
    setEditingId(seller.id);
    setForm({
      name: seller.name,
      phone: seller.phone ?? "",
      email: seller.email ?? "",
      role: seller.role ?? "sales_rep",
      active: seller.active,
    });
    setModalOpen(true);
  }

  async function saveSeller() {
    if (!sessionToken || !form.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        role: form.role.trim() || undefined,
        active: form.active,
      };

      if (editingId) {
        await waterproApiFetch(`/api/v1/sellers/${editingId}`, {
          method: "PATCH",
          token: sessionToken,
          body,
        });
        toast.push("Vendedor atualizado.", "success");
      } else {
        await waterproApiFetch("/api/v1/sellers", {
          method: "POST",
          token: sessionToken,
          body,
        });
        toast.push("Vendedor adicionado.", "success");
      }

      setModalOpen(false);
      await loadSellers();
    } catch {
      toast.push("Não foi possível guardar o vendedor.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(seller: SellerRecord) {
    if (!sessionToken) return;
    try {
      await waterproApiFetch(`/api/v1/sellers/${seller.id}`, {
        method: "PATCH",
        token: sessionToken,
        body: { active: !seller.active },
      });
      toast.push(seller.active ? "Vendedor desativado." : "Vendedor ativado.", "success");
      await loadSellers();
    } catch {
      toast.push("Não foi possível atualizar o vendedor.", "error");
    }
  }

  return (
    <DashboardPermissionGate>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-muted">{filtered.length} vendedor(es)</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              placeholder="Buscar vendedor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border border-slate-line bg-white px-3 py-2 text-sm outline-none focus:border-azure"
              aria-label="Buscar vendedor"
            />
            <MagneticButton variant="primary" className="!px-4 !py-2" onClick={openCreate}>
              Adicionar vendedor
            </MagneticButton>
          </div>
        </div>

        {loading ? <p className="text-sm text-ink-muted">A carregar vendedores…</p> : null}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            {error}
            <button type="button" className="ml-2 underline" onClick={() => void loadSellers()}>
              Tentar novamente
            </button>
          </div>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-line bg-white p-8 text-center">
            <p className="text-sm text-ink-muted">Nenhum vendedor cadastrado.</p>
            <MagneticButton variant="primary" className="mt-4 !px-4 !py-2" onClick={openCreate}>
              Adicionar vendedor
            </MagneticButton>
          </div>
        ) : null}

        {!loading && filtered.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-line bg-white">
            <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_auto] md:gap-4 md:border-b md:border-slate-line md:bg-ice md:px-4 md:py-3 md:text-xs md:font-medium md:uppercase md:text-ink-muted">
              <span>Nome</span>
              <span>Contacto</span>
              <span>Estado</span>
              <span>Ações</span>
            </div>
            <ul className="divide-y divide-slate-line">
              {filtered.map((seller) => (
                <li
                  key={seller.id}
                  className="grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div>
                    <p className="font-medium text-ink">{seller.name}</p>
                    <p className="text-xs text-ink-muted">{seller.role ?? "sales_rep"}</p>
                  </div>
                  <div className="text-sm text-ink-soft">
                    <p>{seller.email ?? "—"}</p>
                    <p>{seller.phone ?? "—"}</p>
                  </div>
                  <div>
                    <span
                      className={
                        seller.active
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                      }
                    >
                      {seller.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-sm text-azure hover:underline"
                      onClick={() => openEdit(seller)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-sm text-ink-muted hover:underline"
                      onClick={() => void toggleActive(seller)}
                    >
                      {seller.active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Fechar formulário"
            onClick={() => setModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-form-title"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-line bg-white p-6 shadow-xl"
          >
            <h2 id="seller-form-title" className="text-lg font-medium text-ink">
              {editingId ? "Editar vendedor" : "Adicionar vendedor"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="seller-name" className="mb-1 block text-xs text-ink-soft">
                  Nome *
                </label>
                <input
                  id="seller-name"
                  className="w-full rounded-xl border border-slate-line bg-ice px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="seller-email" className="mb-1 block text-xs text-ink-soft">
                  Email
                </label>
                <input
                  id="seller-email"
                  type="email"
                  className="w-full rounded-xl border border-slate-line bg-ice px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="seller-phone" className="mb-1 block text-xs text-ink-soft">
                  Telefone
                </label>
                <input
                  id="seller-phone"
                  className="w-full rounded-xl border border-slate-line bg-ice px-3 py-2 text-sm"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Vendedor ativo
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-line px-4 py-2 text-sm"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <MagneticButton
                variant="primary"
                className="!px-4 !py-2"
                disabled={saving || !form.name.trim()}
                onClick={() => void saveSeller()}
              >
                {saving ? "A guardar…" : "Guardar"}
              </MagneticButton>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPermissionGate>
  );
}
