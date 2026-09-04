import DatePickerField from './DatePickerField'

export default function DateRangeField({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  label,
  maxDate,
  className = '',
}) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-0">
        <DatePickerField
          value={startDate}
          onChange={onStartChange}
          placeholder="Dari tanggal"
          compact
          maxDate={maxDate || endDate || undefined}
          className="flex-1 min-w-0"
        />
        <div className="px-2 pb-2 text-sm font-medium shrink-0" style={{ color: 'var(--color-slate-muted)' }}>&#8212;</div>
        <DatePickerField
          value={endDate}
          onChange={onEndChange}
          placeholder="Sampai tanggal"
          compact
          minDate={startDate || undefined}
          maxDate={maxDate}
          className="flex-1 min-w-0"
        />
      </div>
    </div>
  )
}
