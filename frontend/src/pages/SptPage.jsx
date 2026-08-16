import { useState, useEffect, useMemo } from 'react'
import client from '../api/client'
import { formatRupiah, formatDate } from '../utils/formatters'
import { buildSptPrintHtml } from '../utils/sptPdfBuilder'
import { GUIDE_STEPS, contohData } from '../data/sptTutorial'
import toast from 'react-hot-toast'
import {
  User, Wallet, Receipt, Home, Users, FileCheck, Calculator,
  Save, Printer, Trash2, Plus, FileSpreadsheet, History, Landmark, Info,
  BookOpen, ArrowRight, Zap,
} from 'lucide-react'

const STATUS_KAWIN = [
  { value: 'KK', label: 'Kawin — Kewajiban Pajak Gabung (KK)' },
  { value: 'HB', label: 'Kawin — Hidup Berpisah (HB)' },
  { value: 'PH', label: 'Kawin — Pisah Harta & Penghasilan (PH)' },
  { value: 'MT', label: 'Kawin — Istri Pilih Kewajiban Terpisah (MT)' },
]

const JENIS_POTONG = ['21', '22', '23', '24', '26', 'DTP']

const RESTITUSI = [
  { value: '', label: 'Tidak ada' },
  { value: 'KOMPENSASI', label: 'Kompenasasi (diperhitungkan dgn utang pajak)' },
  { value: 'SKPPKP_17C', label: 'Restitusi — SKPPKP Pasal 17C' },
  { value: 'SKPPKP_17D', label: 'Restitusi — SKPPKP Pasal 17D' },
]

const clone = (v) => JSON.parse(JSON.stringify(v))

function emptyData(formType = '1770') {
  return {
    identitas: {
      npwp: '', nama: '', jenis_usaha: '', pekerjaan_utama: '', klu: '',
      no_telepon: '', no_faks: '', status_kawin: 'KK', npwp_pasangan: '',
      alamat: '', kelurahan_kecamatan: '', pembetulan_ke: 0,
      tahun_pajak: new Date().getFullYear() - 1, jenis_form: formType,
    },
    penghasilan: {
      metode: 'pembukuan',
      usaha: {
        peredaran_usaha: 0, hpp: 0, laba_rugi_bruto: 0, biaya_usaha: 0,
        penghasilan_neto_komersial: 0, penyesuaian_positif: {},
        jumlah_penyesuaian_positif: 0, penyesuaian_negatif: {},
        jumlah_penyesuaian_negatif: 0,
      },
      usaha_pencatatan: { jenis_usaha: '', norma_persen: 0, peredaran_usaha: 0 },
      pekerjaan: [],
      dalam_negeri_lainnya: [],
      bukan_objek: [],
      luar_negeri: 0,
      zakat: 0,
      kompensasi_kerugian: 0,
      pengembalian_pph_24: 0,
      final: [],
    },
    kredit_pajak: { dalam_negeri: 0, pemotongan: [], pph_dibayar_sendiri_25: 0, stp_pph_25: 0 },
    harta: [],
    utang: [],
    tanggungan: [],
    permohonan: { restitusi: '', angsuran_25: '1_12' },
  }
}

function mergeDefaults(d) {
  const base = emptyData(d?.identitas?.jenis_form || '1770')
  const merged = {
    ...base,
    ...clone(d || {}),
    identitas: { ...base.identitas, ...(d?.identitas || {}) },
    penghasilan: {
      ...base.penghasilan,
      ...(d?.penghasilan || {}),
      usaha: { ...base.penghasilan.usaha, ...(d?.penghasilan?.usaha || {}) },
      usaha_pencatatan: { ...base.penghasilan.usaha_pencatatan, ...(d?.penghasilan?.usaha_pencatatan || {}) },
    },
    kredit_pajak: { ...base.kredit_pajak, ...(d?.kredit_pajak || {}) },
    permohonan: { ...base.permohonan, ...(d?.permohonan || {}) },
  }
  return merged
}

function sumDict(dict) {
  return Object.values(dict || {}).reduce((s, v) => s + (Number(v) || 0), 0)
}

function setPath(data, path, value) {
  if (path.length === 1) return { ...data, [path[0]]: value }
  const [head, ...rest] = path
  return { ...data, [head]: setPath(data[head] ?? {}, rest, value) }
}

function buildPayload(data, formType) {
  const p = clone(data)
  const usaha = p.penghasilan.usaha
  usaha.laba_rugi_bruto = (usaha.peredaran_usaha || 0) - (usaha.hpp || 0)
  usaha.penghasilan_neto_komersial = usaha.laba_rugi_bruto - (usaha.biaya_usaha || 0)
  usaha.jumlah_penyesuaian_positif = sumDict(usaha.penyesuaian_positif)
  usaha.jumlah_penyesuaian_negatif = sumDict(usaha.penyesuaian_negatif)
  p.identitas.jenis_form = formType
  return p
}

function Field({ label, children, className }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function NumField({ value, onChange, placeholder, className }) {
  return (
    <input
      type="number" min="0" step="any"
      value={value === 0 || value === undefined || value === null ? '' : value}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className={className || 'input-field'}
      placeholder={placeholder || '0'}
    />
  )
}

function SelectField({ value, onChange, options }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="input-field">
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function ItemEditor({ title, items, fields, onChange, addDefault }) {
  const set = (i, key, val) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  return (
    <div className="mt-3 space-y-3">
      {items.length === 0 && (
        <p className="text-xs" style={{ color: '#64748B' }}>Belum ada data. Klik <span className="font-semibold" style={{ color: '#93C5FD' }}>+ Tambah</span> untuk menambah.</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fields.map((f) => (
              <Field key={f.key} label={f.label} className={f.className}>
                {f.type === 'number'
                  ? <NumField value={it[f.key]} onChange={(v) => set(i, f.key, v)} placeholder={f.placeholder} />
                  : f.type === 'select'
                    ? <SelectField value={it[f.key]} onChange={(v) => set(i, f.key, v)} options={f.options} />
                    : <input
                        type={f.type === 'date' ? 'date' : 'text'}
                        value={it[f.key] ?? ''}
                        onChange={(e) => set(i, f.key, e.target.value)}
                        className="input-field"
                        placeholder={f.placeholder}
                      />}
              </Field>
            ))}
          </div>
          <button type="button" onClick={() => remove(i)} className="btn-ghost text-xs mt-2" style={{ color: '#F87171' }}>
            <Trash2 size={12} className="inline mr-1" />Hapus
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { ...addDefault }])} className="btn-secondary text-xs">
        <Plus size={14} /> Tambah {title}
      </button>
    </div>
  )
}

function PenyesuaianEditor({ title, values, onChange }) {
  const entries = Object.entries(values || {})
  const total = sumDict(values)
  const setVal = (label, v) => onChange({ ...values, [label]: v })
  const setLabel = (old, next) => {
    const { [old]: v, ...rest } = values
    onChange({ ...rest, [next]: v })
  }
  const remove = (label) => {
    const { [label]: _omit, ...rest } = values
    onChange(rest)
  }
  return (
    <div className="mt-3">
      <div className="space-y-2">
        {entries.map(([label, v]) => (
          <div key={label} className="flex gap-2 items-center">
            <input
              type="text" value={label}
              onChange={(e) => setLabel(label, e.target.value)}
              className="input-field !py-2"
              placeholder="Uraian penyesuaian"
            />
            <div className="w-40 shrink-0">
              <NumField value={v} onChange={(nv) => setVal(label, nv)} />
            </div>
            <button type="button" onClick={() => remove(label)} className="p-2 rounded-xl hover:bg-red-500/10" style={{ color: '#F87171' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange({ ...values, [`${title} ${entries.length + 1}`]: 0 })} className="btn-secondary text-xs mt-2">
        <Plus size={14} /> Tambah {title}
      </button>
      <div className="mt-2 text-xs font-semibold flex items-center justify-between rounded-xl px-3 py-2" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <span style={{ color: '#94A3B8' }}>Jumlah {title}</span>
        <span className="font-mono" style={{ color: '#93C5FD' }}>{formatRupiah(total)}</span>
      </div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, desc, children }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-2xl p-3" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <Icon size={18} style={{ color: '#93C5FD' }} />
        </div>
        <div>
          <h3 className="font-bold" style={{ color: '#F1F5F9' }}>{title}</h3>
          {desc && <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

const SECTIONS = [
  { id: 'identitas', label: 'Identitas WP', icon: User },
  { id: 'penghasilan', label: 'Penghasilan', icon: Wallet },
  { id: 'kredit', label: 'Kredit Pajak', icon: Receipt },
  { id: 'harta', label: 'Harta & Utang', icon: Home },
  { id: 'tanggungan', label: 'Tanggungan', icon: Users },
  { id: 'permohonan', label: 'Permohonan', icon: FileCheck },
  { id: 'hasil', label: 'Hasil & Cetak', icon: Calculator },
]

const PREVIEW_1770 = [
  ['1', 'Penghasilan neto usaha / pekerjaan bebas', 'angka_1'],
  ['2', 'Penghasilan neto dari pekerjaan', 'angka_2'],
  ['3', 'Penghasilan neto dalam negeri lainnya', 'angka_3'],
  ['4', 'Penghasilan neto luar negeri', 'angka_4'],
  ['5', 'Jumlah penghasilan neto (1+2+3+4)', 'angka_5'],
  ['6', 'Zakat / sumbangan keagamaan wajib', 'angka_6'],
  ['7', 'Neto setelah zakat (5-6)', 'angka_7'],
  ['8', 'Kompensasi kerugian', 'angka_8'],
  ['9', 'Neto setelah kompensasi (7-8)', 'angka_9'],
  ['10', 'Penghasilan Tidak Kena Pajak (PTKP)', 'angka_10'],
  ['11', 'Penghasilan Kena Pajak (9-10)', 'angka_11'],
  ['12', 'PPh terutang (Pasal 17)', 'angka_12'],
  ['13', 'Pengembalian / pengurangan PPh 24', 'pengembalian_pph_24'],
  ['14', 'Jumlah PPh terutang (12+13)', 'jumlah_pph_terutang'],
  ['15', 'Kredit pajak (dipotong pihak lain + PPh 24)', 'angka_15'],
  ['16a', 'PPh yang harus dibayar sendiri (14-15)', 'angka_16'],
  ['16b', 'PPh yang lebih dipotong/dipungut', 'pph_lebih_dipotong'],
  ['17a', 'PPh Pasal 25 yang dibayar sendiri', 'angka_17'],
  ['17b', 'STP PPh Pasal 25', 'stp_pph_25'],
  ['18', 'Jumlah kredit PPh 25 (17a+17b)', 'jumlah_kredit_pph_25'],
  ['19a', 'PPh kurang bayar (Pasal 29)', 'angka_19a'],
  ['19b', 'PPh lebih bayar (28A)', 'angka_19b'],
  ['21', 'Angsuran PPh 25 tahun berikutnya', 'angka_21'],
]

const PREVIEW_1770S = [
  ['1', 'Penghasilan neto dari pekerjaan', 'angka_2'],
  ['2', 'Penghasilan neto dalam negeri lainnya', 'angka_3'],
  ['3', 'Penghasilan neto luar negeri', 'angka_4'],
  ['4', 'Jumlah penghasilan neto (1+2+3)', 'angka_5'],
  ['5', 'Zakat / sumbangan keagamaan wajib', 'angka_6'],
  ['6', 'Neto setelah zakat (4-5)', 'angka_7'],
  ['7', 'Penghasilan Tidak Kena Pajak (PTKP)', 'angka_10'],
  ['8', 'Penghasilan Kena Pajak (6-7)', 'angka_11'],
  ['9', 'PPh terutang (Pasal 17)', 'angka_12'],
  ['10', 'Pengembalian / pengurangan PPh 24', 'pengembalian_pph_24'],
  ['11', 'Jumlah PPh terutang (9+10)', 'jumlah_pph_terutang'],
  ['12', 'Kredit pajak (dipotong pihak lain)', 'angka_15'],
  ['13a', 'PPh yang harus dibayar sendiri (11-12)', 'angka_16'],
  ['13b', 'PPh yang lebih dipotong/dipungut', 'pph_lebih_dipotong'],
  ['14a', 'PPh Pasal 25 yang dibayar sendiri', 'angka_17'],
  ['14b', 'STP PPh Pasal 25', 'stp_pph_25'],
  ['15', 'Jumlah kredit PPh 25 (14a+14b)', 'jumlah_kredit_pph_25'],
  ['16a', 'PPh kurang bayar (Pasal 29)', 'angka_19a'],
  ['16b', 'PPh lebih bayar (28A)', 'angka_19b'],
  ['18', 'Angsuran PPh 25 tahun berikutnya', 'angka_21'],
]

export default function SptPage() {
  const [section, setSection] = useState('identitas')
  const [formType, setFormType] = useState('1770')
  const [data, setData] = useState(() => emptyData('1770'))
  const [calc, setCalc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState([])
  const [draftId, setDraftId] = useState(null)
  const [guideOpen, setGuideOpen] = useState(true)

  const up = (path, value) => setData((d) => setPath(d, path, value))

  const loadDrafts = async () => {
    try {
      const { data } = await client.get('/spt')
      setDrafts(data.items || [])
    } catch {
      // abaikan
    }
  }

  useEffect(() => { loadDrafts() }, [])

  const changeFormType = (ft) => {
    setFormType(ft)
    up(['identitas', 'jenis_form'], ft)
    setCalc(null)
  }

  const hitung = async (overrideData) => {
    setLoading(true)
    try {
      const src = overrideData || data
      const ft = overrideData?.identitas?.jenis_form || formType
      const { data: res } = await client.post('/spt/hitung', {
        form_type: ft,
        data: buildPayload(src, ft),
      })
      setCalc(res)
      toast.success('Perhitungan berhasil')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menghitung')
    } finally {
      setLoading(false)
    }
  }

  const simpan = async () => {
    setSaving(true)
    try {
      const payload = {
        form_type: formType,
        tahun_pajak: Number(data.identitas.tahun_pajak) || new Date().getFullYear() - 1,
        status: 'DRAFT',
        data: buildPayload(data, formType),
      }
      if (draftId) {
        await client.put(`/spt/${draftId}`, payload)
        toast.success('Draft diperbarui')
      } else {
        const { data: res } = await client.post('/spt', payload)
        setDraftId(res.id)
        toast.success('Draft tersimpan')
      }
      await loadDrafts()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menyimpan draft')
    } finally {
      setSaving(false)
    }
  }

  const cetak = async () => {
    if (!calc) await hitung()
    if (!calc) return
    const html = buildSptPrintHtml(buildPayload(data, formType), calc, formType)
    const w = window.open('', '_blank')
    if (!w) {
      toast.error('Blokir popup terdeteksi — izinkan popup untuk mencetak.')
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.addEventListener('load', () => w.print(), { once: true })
    setTimeout(() => w.print(), 800)
  }

  const hapusDraft = async (id) => {
    if (!window.confirm('Hapus draft SPT ini?')) return
    try {
      await client.delete(`/spt/${id}`)
      if (id === draftId) {
        setDraftId(null)
        setData(emptyData(formType))
        setCalc(null)
      }
      setDrafts((d) => d.filter((x) => x.id !== id))
      toast.success('Draft dihapus')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menghapus')
    }
  }

  const muatDraft = (d) => {
    const merged = mergeDefaults(d.data)
    setData(merged)
    setFormType(merged.identitas.jenis_form || d.form_type || '1770')
    setDraftId(d.id)
    setCalc(null)
    setSection('hasil')
    toast.success('Draft dimuat')
  }

  const muatContoh = async (ft = formType, { hitungLangsung = false } = {}) => {
    const sample = mergeDefaults(contohData(ft))
    setData(sample)
    setFormType(ft)
    setDraftId(null)
    setCalc(null)
    if (hitungLangsung) {
      await hitung(sample)
      setSection('hasil')
    } else {
      setSection('identitas')
    }
    toast.success(`Data contoh ${ft === '1770S' ? '1770S (Karyawan)' : '1770 (Usaha)'} dimuat`)
  }

  const fillSection = (sectionId, ft = formType) => {
    const sample = contohData(ft)
    switch (sectionId) {
      case 'identitas': up(['identitas'], sample.identitas); break
      case 'penghasilan': up(['penghasilan'], sample.penghasilan); break
      case 'kredit': up(['kredit_pajak'], sample.kredit_pajak); break
      case 'harta':
        up(['harta'], sample.harta)
        up(['utang'], sample.utang)
        break
      case 'tanggungan': up(['tanggungan'], sample.tanggungan); break
      case 'permohonan': up(['permohonan'], sample.permohonan); break
      case 'hasil': break
      default: break
    }
    toast.success(`Contoh isian '${GUIDE_STEPS.find((g) => g.id === sectionId)?.title || sectionId}' diterapkan`)
  }

  const usaha = data.penghasilan.usaha
  const netoUsaha = useMemo(
    () => (usaha.peredaran_usaha || 0) - (usaha.hpp || 0) - (usaha.biaya_usaha || 0),
    [usaha.peredaran_usaha, usaha.hpp, usaha.biaya_usaha]
  )

  const previewRows = formType === '1770S' ? PREVIEW_1770S : PREVIEW_1770

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">
          <span className="gradient-text">SPT Tahunan PPh OP</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
          Isi formulir 1770 / 1770S — hitung otomatis, simpan draft, dan cetak ke PDF.
        </p>
      </div>

      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <Info size={16} style={{ color: '#FBBF24' }} className="shrink-0 mt-0.5" />
        <p className="text-xs" style={{ color: '#D6C08A' }}>
          Alat bantu isian & hitung SPT — BUKAN pengganti e-Form/e-Filing resmi DJP. Validasi ke konsultan pajak sebelum pelaporan.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ===== In-page sidebar ===== */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4 lg:sticky lg:top-0">
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-3">
              <History size={14} style={{ color: '#93C5FD' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Bagian Form</span>
            </div>
            <nav className="space-y-1">
              {SECTIONS.map((s) => {
                const active = section === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                      active ? 'font-semibold text-[#93C5FD]' : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#E2E8F0]'
                    }`}
                    style={active ? { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' } : undefined}
                  >
                    <s.icon size={16} className={active ? 'text-[#60A5FA]' : ''} />
                    <span className="text-left">{s.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet size={14} style={{ color: '#93C5FD' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Draft Tersimpan</span>
            </div>
            <button type="button" onClick={muatContoh} className="btn-ghost w-full text-xs justify-start !px-2 mb-2">
              <Plus size={12} /> Muat data contoh
            </button>
            <div className="space-y-2">
              {drafts.length === 0 && (
                <p className="text-xs" style={{ color: '#64748B' }}>Belum ada draft.</p>
              )}
              {drafts.map((d) => (
                <div key={d.id} className="group flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5" style={{ border: '1px solid var(--color-border-subtle)' }}>
                  <button type="button" onClick={() => muatDraft(d)} className="flex-1 text-left min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: '#F1F5F9' }}>SPT {d.form_type} {d.tahun_pajak}</div>
                    <div className="text-[10px]" style={{ color: '#64748B' }}>{formatDate(d.updated_at)}</div>
                  </button>
                  <button type="button" onClick={() => hapusDraft(d.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#F87171' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ===== Form content ===== */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <GuidePanel
            activeId={section}
            formType={formType}
            open={guideOpen}
            onToggle={() => setGuideOpen((o) => !o)}
            onSelect={(id) => { setSection(id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            onFillSection={(id) => { fillSection(id); setSection(id) }}
            onDemo={(ft) => muatContoh(ft, { hitungLangsung: true })}
          />
          {section === 'identitas' && (
            <IdentitasSection formType={formType} data={data} up={up} onChangeFormType={changeFormType} />
          )}
          {section === 'penghasilan' && (
            <PenghasilanSection formType={formType} data={data} up={up} netoUsaha={netoUsaha} />
          )}
          {section === 'kredit' && <KreditSection data={data} up={up} />}
          {section === 'harta' && <HartaSection data={data} up={up} />}
          {section === 'tanggungan' && <TanggunganSection data={data} up={up} />}
          {section === 'permohonan' && <PermohonanSection data={data} up={up} />}
          {section === 'hasil' && (
            <HasilSection
              formType={formType} data={data} calc={calc} previewRows={previewRows}
              loading={loading} saving={saving} hitung={hitung} simpan={simpan} cetak={cetak}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ========================================================================
   Panduan Interaktif (GuidePanel)
   ======================================================================== */

function GuidePanel({ activeId, formType, open, onToggle, onSelect, onFillSection, onDemo }) {
  const idx = Math.max(0, GUIDE_STEPS.findIndex((g) => g.id === activeId))
  const step = GUIDE_STEPS[idx]
  const next = GUIDE_STEPS[idx + 1]
  return (
    <div className="card !p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen size={15} style={{ color: '#93C5FD' }} />
          <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Panduan Pengisian</span>
          <span className="badge !text-[9px]">LANGKAH {idx + 1}/{GUIDE_STEPS.length}</span>
        </div>
        <button type="button" onClick={onToggle} className="btn-ghost !px-2 !py-1 text-xs">
          {open ? 'Tutup' : 'Buka'}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-4">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#6EE7B7' }}>
              <Zap size={12} /> Coba demo: isi seluruh form otomatis + hitung langsung
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => onDemo('1770S')}>Demo 1770S (Karyawan)</button>
              <button type="button" className="btn-secondary text-xs" onClick={() => onDemo('1770')}>Demo 1770 (Usaha)</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
            <nav className="space-y-1">
              {GUIDE_STEPS.map((g, i) => {
                const active = g.id === activeId
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onSelect(g.id)}
                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-all duration-300 ${active ? 'font-semibold' : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#E2E8F0]'}`}
                    style={active ? { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93C5FD' } : undefined}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: active ? '#3B82F6' : 'rgba(148,163,184,0.15)', color: active ? '#fff' : '#94A3B8' }}>
                      {i + 1}
                    </span>
                    <span className="truncate">{g.title}</span>
                  </button>
                )
              })}
            </nav>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>{step.title}</div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#94A3B8' }}>{step.ringkas}</p>
              </div>

              <div className="space-y-2">
                {step.langkah.map((l, i) => (
                  <div key={i} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: '#CBD5E1' }}>{l.field}</span>
                      {l.contoh && (
                        <code className="text-[10px] font-mono rounded px-1.5 py-0.5" style={{ background: 'rgba(59,130,246,0.12)', color: '#93C5FD' }}>{l.contoh}</code>
                      )}
                    </div>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#64748B' }}>{l.cara}</p>
                  </div>
                ))}
              </div>

              {step.tips?.length > 0 && (
                <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#FBBF24' }}>Tips</div>
                  <ul className="space-y-1">
                    {step.tips.map((t, i) => (
                      <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: '#D6C08A' }}>
                        <span className="mt-0.5 shrink-0">•</span><span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[10px] italic" style={{ color: '#64748B' }}>
                Referensi: <span style={{ color: '#94A3B8' }}>{step.referensi}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className="btn-secondary text-xs" onClick={() => onFillSection(step.id)}>
                  <Zap size={12} /> Isi otomatis bagian ini
                </button>
                {next && (
                  <button type="button" className="btn-primary text-xs" onClick={() => onSelect(next.id)}>
                    Lanjut: {next.title} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ========================================================================
   Bagian: Identitas
   ======================================================================== */

function IdentitasSection({ formType, data, up, onChangeFormType }) {
  const id = data.identitas
  return (
    <SectionCard title="Jenis Form & Identitas" icon={User} desc="Pilih formulir dan isi data Wajib Pajak">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => onChangeFormType('1770')}
          className="rounded-2xl p-5 text-left transition-all duration-300"
          style={formType === '1770'
            ? { background: 'rgba(59,130,246,0.12)', border: '2px solid #3B82F6' }
            : { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-lg" style={{ color: formType === '1770' ? '#93C5FD' : '#CBD5E1' }}>1770</span>
            {formType === '1770' && <span className="badge !text-[10px]">DIPILIH</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Wiraswasta / usaha, pekerjaan bebas, lebih dari satu pemberi kerja. Lampiran I–IV.</p>
        </button>
        <button
          type="button"
          onClick={() => onChangeFormType('1770S')}
          className="rounded-2xl p-5 text-left transition-all duration-300"
          style={formType === '1770S'
            ? { background: 'rgba(59,130,246,0.12)', border: '2px solid #3B82F6' }
            : { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-lg" style={{ color: formType === '1770S' ? '#93C5FD' : '#CBD5E1' }}>1770S</span>
            {formType === '1770S' && <span className="badge !text-[10px]">DIPILIH</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Karyawan — penghasilan dari satu/lebih pemberi kerja. Lampiran S-I & S-II.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Tahun Pajak">
          <NumField value={id.tahun_pajak} onChange={(v) => up(['identitas', 'tahun_pajak'], v)} placeholder="2025" />
        </Field>
        <Field label="NPWP">
          <input type="text" value={id.npwp} onChange={(e) => up(['identitas', 'npwp'], e.target.value)} className="input-field" placeholder="00.000.000.0-000.000" />
        </Field>
        <Field label="Nama Wajib Pajak">
          <input type="text" value={id.nama} onChange={(e) => up(['identitas', 'nama'], e.target.value)} className="input-field" placeholder="Nama sesuai KTP/NPWP" />
        </Field>
        <Field label="Status Perkawinan">
          <SelectField value={id.status_kawin} onChange={(v) => up(['identitas', 'status_kawin'], v)} options={STATUS_KAWIN} />
        </Field>
        <Field label="NPWP Istri/Suami">
          <input type="text" value={id.npwp_pasangan} onChange={(e) => up(['identitas', 'npwp_pasangan'], e.target.value)} className="input-field" placeholder="00.000.000.0-000.000" />
        </Field>
        <Field label="Pembetulan Ke-">
          <NumField value={id.pembetulan_ke} onChange={(v) => up(['identitas', 'pembetulan_ke'], v)} />
        </Field>
        <Field label="Jenis Usaha">
          <input type="text" value={id.jenis_usaha} onChange={(e) => up(['identitas', 'jenis_usaha'], e.target.value)} className="input-field" placeholder="cth: Toko Kelontong" />
        </Field>
        <Field label="Pekerjaan Utama">
          <input type="text" value={id.pekerjaan_utama} onChange={(e) => up(['identitas', 'pekerjaan_utama'], e.target.value)} className="input-field" placeholder="cth: Karyawan" />
        </Field>
        <Field label="Klasifikasi Lapangan Usaha (KLU)">
          <input type="text" value={id.klu} onChange={(e) => up(['identitas', 'klu'], e.target.value)} className="input-field" placeholder="cth: 47911" />
        </Field>
        <Field label="No. Telepon">
          <input type="text" value={id.no_telepon} onChange={(e) => up(['identitas', 'no_telepon'], e.target.value)} className="input-field" placeholder="021-0000000" />
        </Field>
        <Field label="No. Faksimili">
          <input type="text" value={id.no_faks} onChange={(e) => up(['identitas', 'no_faks'], e.target.value)} className="input-field" placeholder="021-0000000" />
        </Field>
        <Field label="Alamat Tempat Tinggal" className="sm:col-span-2 lg:col-span-2">
          <input type="text" value={id.alamat} onChange={(e) => up(['identitas', 'alamat'], e.target.value)} className="input-field" placeholder="Jalan, RT/RW, Kelurahan" />
        </Field>
        <Field label="Kelurahan / Kecamatan">
          <input type="text" value={id.kelurahan_kecamatan} onChange={(e) => up(['identitas', 'kelurahan_kecamatan'], e.target.value)} className="input-field" placeholder="cth: Menteng / Jakarta Pusat" />
        </Field>
      </div>
    </SectionCard>
  )
}

/* ========================================================================
   Bagian: Penghasilan
   ======================================================================== */

function PenghasilanSection({ formType, data, up, netoUsaha }) {
  const ph = data.penghasilan
  const usaha = ph.usaha
  const catat = ph.usaha_pencatatan
  return (
    <SectionCard title="Penghasilan Neto" icon={Wallet} desc="Sumber penghasilan dan komponen perhitungan neto">
      <Field label="Metode Penghitungan Usaha">
        <SelectField
          value={ph.metode}
          onChange={(v) => up(['penghasilan', 'metode'], v)}
          options={[
            { value: 'pembukuan', label: 'Pembukuan' },
            { value: 'pencatatan', label: 'Pencatatan (Norma Penghitungan)' },
          ]}
        />
      </Field>

      {ph.metode === 'pembukuan' ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Peredaran Usaha (1a)">
              <NumField value={usaha.peredaran_usaha} onChange={(v) => up(['penghasilan', 'usaha', 'peredaran_usaha'], v)} />
            </Field>
            <Field label="Harga Pokok Penjualan (1b)">
              <NumField value={usaha.hpp} onChange={(v) => up(['penghasilan', 'usaha', 'hpp'], v)} />
            </Field>
            <Field label="Biaya Usaha (1d)">
              <NumField value={usaha.biaya_usaha} onChange={(v) => up(['penghasilan', 'usaha', 'biaya_usaha'], v)} />
            </Field>
          </div>
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between text-sm" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <span style={{ color: '#94A3B8' }}>Penghasilan neto komersial (1c − 1d)</span>
            <span className="font-mono font-bold" style={{ color: '#6EE7B7' }}>{formatRupiah(netoUsaha)}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#93C5FD' }}>Penyesuaian Fiskal Positif (2a–2k)</div>
              <PenyesuaianEditor title="Penyesuaian" values={usaha.penyesuaian_positif} onChange={(v) => up(['penghasilan', 'usaha', 'penyesuaian_positif'], v)} />
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#93C5FD' }}>Penyesuaian Fiskal Negatif (3a–3c)</div>
              <PenyesuaianEditor title="Penyesuaian" values={usaha.penyesuaian_negatif} onChange={(v) => up(['penghasilan', 'usaha', 'penyesuaian_negatif'], v)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Jenis Usaha">
            <input type="text" value={catat.jenis_usaha} onChange={(e) => up(['penghasilan', 'usaha_pencatatan', 'jenis_usaha'], e.target.value)} className="input-field" />
          </Field>
          <Field label="Norma Penghitungan (%)">
            <NumField value={catat.norma_persen} onChange={(v) => up(['penghasilan', 'usaha_pencatatan', 'norma_persen'], v)} />
          </Field>
          <Field label="Peredaran Usaha">
            <NumField value={catat.peredaran_usaha} onChange={(v) => up(['penghasilan', 'usaha_pencatatan', 'peredaran_usaha'], v)} />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Field label="Penghasilan Neto Luar Negeri (4)">
          <NumField value={ph.luar_negeri} onChange={(v) => up(['penghasilan', 'luar_negeri'], v)} />
        </Field>
        <Field label="Zakat / Sumbangan Keagamaan (6)">
          <NumField value={ph.zakat} onChange={(v) => up(['penghasilan', 'zakat'], v)} />
        </Field>
        {formType === '1770' && (
          <Field label="Kompensasi Kerugian (8)">
            <NumField value={ph.kompensasi_kerugian} onChange={(v) => up(['penghasilan', 'kompensasi_kerugian'], v)} />
          </Field>
        )}
        <Field label="Pengembalian / Pengurangan PPh 24 (13)">
          <NumField value={ph.pengembalian_pph_24} onChange={(v) => up(['penghasilan', 'pengembalian_pph_24'], v)} />
        </Field>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold mb-2" style={{ color: '#CBD5E1' }}>Pekerjaan (Lampiran I bagian C)</h4>
          <ItemEditor
            title="pekerjaan"
            items={ph.pekerjaan}
            onChange={(v) => up(['penghasilan', 'pekerjaan'], v)}
            addDefault={{ nama_pemberi_kerja: '', npwp_pemberi_kerja: '', penghasilan_neto: 0 }}
            fields={[
              { key: 'nama_pemberi_kerja', label: 'Nama Pemberi Kerja', placeholder: 'PT Maju Jaya' },
              { key: 'npwp_pemberi_kerja', label: 'NPWP Pemberi Kerja', placeholder: '00.000.000.0-000.000' },
              { key: 'penghasilan_neto', label: 'Penghasilan Neto (Rp)', type: 'number' },
            ]}
          />
        </div>

        <div>
          <h4 className="text-sm font-bold mb-2" style={{ color: '#CBD5E1' }}>Dalam Negeri Lainnya (Lampiran I bagian D)</h4>
          <ItemEditor
            title="penghasilan lainnya"
            items={ph.dalam_negeri_lainnya}
            onChange={(v) => up(['penghasilan', 'dalam_negeri_lainnya'], v)}
            addDefault={{ jenis: '', penghasilan_bruto: 0, penghasilan_neto: 0 }}
            fields={[
              { key: 'jenis', label: 'Jenis Penghasilan', placeholder: 'Sewa rumah, royalti, dll' },
              { key: 'penghasilan_bruto', label: 'Penghasilan Bruto (Rp)', type: 'number' },
              { key: 'penghasilan_neto', label: 'Penghasilan Neto (Rp)', type: 'number' },
            ]}
          />
        </div>

        <div>
          <h4 className="text-sm font-bold mb-2" style={{ color: '#CBD5E1' }}>Bukan Objek Pajak (1770-III bagian B)</h4>
          <ItemEditor
            title="penghasilan bukan objek"
            items={ph.bukan_objek}
            onChange={(v) => up(['penghasilan', 'bukan_objek'], v)}
            addDefault={{ jenis: '', jumlah: 0 }}
            fields={[
              { key: 'jenis', label: 'Jenis Penghasilan', placeholder: 'Warisan, hibah, dll' },
              { key: 'jumlah', label: 'Jumlah (Rp)', type: 'number' },
            ]}
          />
        </div>

        <div>
          <h4 className="text-sm font-bold mb-2" style={{ color: '#CBD5E1' }}>PPh Final / Bersifat Final (1770-III bagian A)</h4>
          <ItemEditor
            title="penghasilan final"
            items={ph.final}
            onChange={(v) => up(['penghasilan', 'final'], v)}
            addDefault={{ jenis: '', dasar_pengenaan: 0, pph_terutang: 0 }}
            fields={[
              { key: 'jenis', label: 'Jenis Penghasilan', placeholder: 'Bunga deposito, sewa, dll' },
              { key: 'dasar_pengenaan', label: 'Dasar Pengenaan (Rp)', type: 'number' },
              { key: 'pph_terutang', label: 'PPh Terutang (Rp)', type: 'number' },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  )
}

/* ========================================================================
   Bagian: Kredit Pajak
   ======================================================================== */

function KreditSection({ data, up }) {
  const kp = data.kredit_pajak
  return (
    <SectionCard title="Kredit Pajak" icon={Receipt} desc="PPh yang sudah dipotong/dibayar untuk dikreditkan">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="PPh Pasal 24 (Kredit Pajak Luar Negeri)">
          <NumField value={kp.dalam_negeri} onChange={(v) => up(['kredit_pajak', 'dalam_negeri'], v)} />
        </Field>
        <Field label="PPh Pasal 25 yang Dibayar Sendiri (17a)">
          <NumField value={kp.pph_dibayar_sendiri_25} onChange={(v) => up(['kredit_pajak', 'pph_dibayar_sendiri_25'], v)} />
        </Field>
        <Field label="STP PPh Pasal 25 (17b)">
          <NumField value={kp.stp_pph_25} onChange={(v) => up(['kredit_pajak', 'stp_pph_25'], v)} />
        </Field>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-bold mb-2" style={{ color: '#CBD5E1' }}>Daftar Pemotongan/Pemungutan (1770-II bagian A)</h4>
        <ItemEditor
          title="bukti potong"
          items={kp.pemotongan}
          onChange={(v) => up(['kredit_pajak', 'pemotongan'], v)}
          addDefault={{ nama: '', npwp: '', no_bukti: '', tanggal: '', jenis: '21', jumlah: 0 }}
          fields={[
            { key: 'nama', label: 'Nama Pemotong', placeholder: 'PT Maju Jaya' },
            { key: 'npwp', label: 'NPWP Pemotong', placeholder: '00.000.000.0-000.000' },
            { key: 'no_bukti', label: 'No. Bukti Potong' },
            { key: 'tanggal', label: 'Tanggal', type: 'date' },
            { key: 'jenis', label: 'Jenis Pajak', type: 'select', options: JENIS_POTONG.map((j) => ({ value: j, label: `PPh Pasal ${j}` })) },
            { key: 'jumlah', label: 'Jumlah PPh (Rp)', type: 'number' },
          ]}
        />
      </div>
    </SectionCard>
  )
}

/* ========================================================================
   Bagian: Harta & Utang
   ======================================================================== */

function HartaSection({ data, up }) {
  return (
    <SectionCard title="Harta & Utang" icon={Home} desc="Lampiran IV — kondisi harta, utang pada akhir tahun pajak">
      <h4 className="text-sm font-bold mb-2" style={{ color: '#CBD5E1' }}>Harta pada Akhir Tahun</h4>
      <ItemEditor
        title="harta"
        items={data.harta}
        onChange={(v) => up(['harta'], v)}
        addDefault={{ kode: '', nama: '', tahun_perolehan: new Date().getFullYear(), harga_perolehan: 0, keterangan: '' }}
        fields={[
          { key: 'kode', label: 'Kode Harta', placeholder: '031' },
          { key: 'nama', label: 'Jenis/Nama Harta', placeholder: 'Rumah' },
          { key: 'tahun_perolehan', label: 'Tahun Perolehan', type: 'number' },
          { key: 'harga_perolehan', label: 'Harga Perolehan (Rp)', type: 'number' },
          { key: 'keterangan', label: 'Keterangan', placeholder: 'Tempat tinggal' },
        ]}
      />

      <h4 className="text-sm font-bold mb-2 mt-8" style={{ color: '#CBD5E1' }}>Utang pada Akhir Tahun</h4>
      <ItemEditor
        title="utang"
        items={data.utang}
        onChange={(v) => up(['utang'], v)}
        addDefault={{ kode: '', nama_pemberi: '', alamat_pemberi: '', tahun_peminjaman: new Date().getFullYear(), jumlah: 0 }}
        fields={[
          { key: 'kode', label: 'Kode Utang', placeholder: '211' },
          { key: 'nama_pemberi', label: 'Nama Pemberi Pinjaman', placeholder: 'Bank ABC' },
          { key: 'alamat_pemberi', label: 'Alamat Pemberi' },
          { key: 'tahun_peminjaman', label: 'Tahun Peminjaman', type: 'number' },
          { key: 'jumlah', label: 'Jumlah Utang (Rp)', type: 'number' },
        ]}
      />
    </SectionCard>
  )
}

/* ========================================================================
   Bagian: Tanggungan
   ======================================================================== */

function TanggunganSection({ data, up }) {
  return (
    <SectionCard title="Susunan Anggota Keluarga" icon={Users} desc="Tanggungan untuk perhitungan PTKP & Lampiran IV bagian D">
      <ItemEditor
        title="tanggungan"
        items={data.tanggungan}
        onChange={(v) => up(['tanggungan'], v)}
        addDefault={{ nama: '', nik: '', hubungan: 'Anak', pekerjaan: '' }}
        fields={[
          { key: 'nama', label: 'Nama Anggota Keluarga', placeholder: 'Anak 1' },
          { key: 'nik', label: 'NIK' },
          { key: 'hubungan', label: 'Hubungan Keluarga', placeholder: 'Suami/Istri/Anak' },
          { key: 'pekerjaan', label: 'Pekerjaan', placeholder: 'Pelajar' },
        ]}
      />
    </SectionCard>
  )
}

/* ========================================================================
   Bagian: Permohonan
   ======================================================================== */

function PermohonanSection({ data, up }) {
  const pm = data.permohonan
  return (
    <SectionCard title="Permohonan" icon={FileCheck} desc="Pilihan restitusi dan cara hitung angsuran PPh 25">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Permohonan Lebih Bayar">
          <SelectField value={pm.restitusi} onChange={(v) => up(['permohonan', 'restitusi'], v)} options={RESTITUSI} />
        </Field>
        <Field label="Angsuran PPh 25 Tahun Berikutnya">
          <SelectField
            value={pm.angsuran_25}
            onChange={(v) => up(['permohonan', 'angsuran_25'], v)}
            options={[
              { value: '1_12', label: '1/12 x angka 16 (1770) / angka 13a (1770S)' },
              { value: 'separate', label: 'Perhitungan tersendiri (lampiran)' },
            ]}
          />
        </Field>
      </div>
      <p className="text-xs mt-4 rounded-xl p-3" style={{ color: '#94A3B8', background: 'rgba(255,255,255,0.04)' }}>
        Permohonan restitusi hanya relevan bila terjadi lebih bayar (angka 19.b / 16.b). Kompensasi = lebih bayar diperhitungkan dengan utang pajak tahun berikutnya.
      </p>
    </SectionCard>
  )
}

/* ========================================================================
   Bagian: Hasil & Cetak
   ======================================================================== */

function HasilSection({ formType, data, calc, previewRows, loading, saving, hitung, simpan, cetak }) {
  return (
    <SectionCard title="Hasil Perhitungan & Cetak" icon={Calculator} desc="Preview perhitungan alur Formulir Induk sesuai form terpilih">
      <div className="flex flex-wrap gap-3 mb-6">
        <button type="button" onClick={hitung} disabled={loading} className="btn-primary">
          <Calculator size={16} /> {loading ? 'Menghitung...' : 'Hitung & Preview'}
        </button>
        <button type="button" onClick={simpan} disabled={saving} className="btn-secondary">
          <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Draft'}
        </button>
        <button type="button" onClick={cetak} disabled={!calc} className="btn-secondary" style={!calc ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
          <Printer size={16} /> Cetak / Simpan PDF
        </button>
      </div>

      {!calc ? (
        <div className="rounded-2xl p-8 text-center" style={{ border: '1px dashed var(--color-border-soft)' }}>
          <Landmark size={32} style={{ color: '#64748B' }} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            Belum ada perhitungan. Isi form lalu klik <span className="font-semibold text-[#93C5FD]">Hitung & Preview</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border-subtle)' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(59,130,246,0.08)', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Ringkasan Formulir Induk {formType} — {data.identitas.tahun_pajak}</span>
              <span className="badge !text-[10px]">PPh {formType === '1770S' ? '1770S' : '1770'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {previewRows.map(([no, label, key]) => {
                    const val = calc[key] ?? 0
                    const isTotal = key === 'angka_5' || key === 'angka_7' || key === 'angka_9' || key === 'angka_11' || key === 'jumlah_pph_terutang' || key === 'jumlah_kredit_pph_25'
                    const isFinal = key === 'angka_19a' || key === 'angka_19b'
                    return (
                      <tr key={key} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: '#64748B' }}>{no}</td>
                        <td className={`px-4 py-2.5 ${isTotal ? 'font-bold' : ''}`} style={{ color: isTotal ? '#93C5FD' : '#CBD5E1' }}>
                          {label}
                          {isFinal && val > 0 && <span className="badge !text-[9px] ml-2">{key === 'angka_19a' ? 'KURANG BAYAR' : 'LEBIH BAYAR'}</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono" style={{ color: isFinal && val > 0 ? (key === 'angka_19a' ? '#F87171' : '#6EE7B7') : isTotal ? '#F1F5F9' : '#CBD5E1' }}>
                          {formatRupiah(val)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#93C5FD' }}>PTKP</div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: '#94A3B8' }}>Status</span>
                <span className="font-semibold" style={{ color: '#F1F5F9' }}>{calc.ptkp_detail?.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: '#94A3B8' }}>Tanggungan</span>
                <span className="font-semibold" style={{ color: '#F1F5F9' }}>{calc.ptkp_detail?.jumlah_tanggungan}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#94A3B8' }}>Nilai PTKP</span>
                <span className="font-mono font-bold" style={{ color: '#93C5FD' }}>{formatRupiah(calc.ptkp_detail?.nilai_ptkp)}</span>
              </div>
              <p className="text-[10px] mt-3 italic" style={{ color: '#64748B' }}>{calc.ptkp_detail?.uraian}</p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#93C5FD' }}>PPh Pasal 17</div>
              {(calc.pph_pasal_17_detail?.rincian || []).map((r) => (
                <div key={r.lapisan} className="flex items-center justify-between text-sm mb-1.5">
                  <span style={{ color: '#94A3B8' }}>{r.lapisan} × {Math.round(r.tarif * 100)}%</span>
                  <span className="font-mono" style={{ color: '#CBD5E1' }}>{formatRupiah(r.pph)}</span>
                </div>
              ))}
              {!calc.pph_pasal_17_detail?.rincian?.length && (
                <p className="text-sm" style={{ color: '#64748B' }}>PKP ≤ 0 — tidak ada PPh terutang.</p>
              )}
            </div>
          </div>

          {(calc.catatan || []).length > 0 && (
            <div className="space-y-2">
              {(calc.catatan || []).map((c, i) => (
                <div key={i} className="rounded-xl px-4 py-2.5 text-sm" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', color: '#D6C08A' }}>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}
