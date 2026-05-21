export type ISODate = string // 'YYYY-MM-DD'

export interface DateRange {
  start: Date
  end: Date
}

export interface DayCellMeta {
  date: Date
  iso: ISODate
  inCurrentMonth: boolean
  isDisabled: boolean
}

export interface PickerProps {
  modelValue: DateRange
  minDate?: Date   // default: today
  maxDate?: Date   // default: endOfMonth(addMonths(today, 12))
  locale?: string  // default: 'en-US'
}
