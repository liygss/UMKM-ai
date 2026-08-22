import { useState, useMemo } from 'react'
import { buildPages, PREVIEW_CSS } from '../utils/sptFormGenerators.js'

export default function SptPreview({ formType, data, calc, lang = 'bilingual', onDownloadPdf }) {
  const [currentLang, setCurrentLang] = useState(lang)
  
  const pages = useMemo(() => buildPages(formType, data, calc, currentLang), [formType, data, calc, currentLang])
  
  return (
    <div className="sp-preview-container">
      <div className="toolbar" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Language Mode:</label>
          <select 
            value={currentLang} 
            onChange={(e) => setCurrentLang(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', minWidth: '180px' }}
          >
            <option value="bilingual">Bilingual (ID + EN)</option>
            <option value="id">Indonesia Only</option>
            <option value="en">English Only</option>
          </select>
          <button 
            onClick={onDownloadPdf}
            disabled={!calc}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: !calc ? 'not-allowed' : 'pointer', opacity: !calc ? 0.5 : 1 }}
          >
            Download PDF
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Preview - Page {pages.length} halaman
        </div>
      </div>
      
      <div className="sp-pages-container">
        {pages.map((pageHtml, i) => (
          <div key={i} className="sp-preview-page" dangerouslySetInnerHTML={{ __html: pageHtml }} />
        ))}
      </div>
      
      <style>{`
        ${PREVIEW_CSS}
      `}</style>
    </div>
  )
}
