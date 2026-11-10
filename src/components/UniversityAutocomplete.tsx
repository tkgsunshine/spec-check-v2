'use client';

import { useState, useEffect, useRef } from 'react';
import { UniversityMasterItem } from '@/lib/datasets/japan-stats';
import { Check, Search, GraduationCap, Stethoscope, Sliders } from 'lucide-react';

interface UniversityAutocompleteProps {
  value: string;
  customHensachi?: number | null;
  onChange: (value: string, isMatchedMaster: boolean, customHensachi?: number | null) => void;
}

export default function UniversityAutocomplete({ value, customHensachi: initialHensachi, onChange }: UniversityAutocompleteProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<UniversityMasterItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UniversityMasterItem | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customHensachi, setCustomHensachi] = useState<number | ''>(initialHensachi || '');
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 候補を選んだ直後の query 変更で、ドロップダウンが再度開かないようにする
  const skipNextOpenRef = useRef(false);

  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  const trimmedQuery = query.trim();
  // 入力と完全一致する候補があるか（空白の有無・大文字小文字は無視）
  const hasExactMatch =
    trimmedQuery !== '' && suggestions.some(item => normalize(item.name) === normalize(trimmedQuery));

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/masters/universities?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.universities) {
          setSuggestions(data.universities);
          if (skipNextOpenRef.current) {
            skipNextOpenRef.current = false;
          } else {
            setIsOpen(true);
          }
        }
      } catch (e) {
        console.error('Failed to fetch university suggestions', e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMaster = (item: UniversityMasterItem) => {
    setSelectedItem(item);
    setIsCustomMode(false);
    if (item.name !== query) skipNextOpenRef.current = true;
    setQuery(item.name);
    onChange(item.name, true, null);
    setIsOpen(false);
  };

  const handleSelectFreeText = () => {
    setSelectedItem(null);
    setIsCustomMode(true);
    const numH = customHensachi !== '' ? Number(customHensachi) : null;
    onChange(query.trim(), false, numH);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedItem(null);
    setIsCustomMode(false);
    onChange(val, false, null);
  };

  const handleCustomHensachiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = val !== '' ? Number(val) : '';
    setCustomHensachi(num);
    onChange(query.trim(), false, num !== '' ? Number(num) : null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full space-y-3">
      {/* 1. 大学名 検索・選択プルダウン (上) */}
      <div className="relative">
        <div className="relative flex items-center">
          <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => trimmedQuery && !selectedItem && setIsOpen(true)}
            placeholder="大学名を入力 (例: 早稲田大学, 東京大学)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 pointer-events-none" />
        </div>

        {/* Autocomplete Dropdown List (完全ソリッド遮蔽背景) */}
        {isOpen && (suggestions.length > 0 || !hasExactMatch) && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-[100] max-h-64 overflow-y-auto divide-y divide-slate-800/60">
            {suggestions.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectMaster(item)}
                className="w-full px-4 py-3 text-left hover:bg-indigo-600/20 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">
                      {item.name}
                    </span>
                    {item.isMedicalSchool && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-extrabold">
                        <Stethoscope className="w-3 h-3 text-rose-400" /> 医学部
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {item.location} ・ {item.establishmentType === 'NATIONAL' ? '国立' : item.establishmentType === 'PUBLIC' ? '公立' : '私立'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-300">
                    偏差値 {item.hensachi}
                  </span>
                </div>
              </button>
            ))}

            {!hasExactMatch && (
            <button
              type="button"
              onClick={handleSelectFreeText}
              className="w-full px-4 py-3 text-left hover:bg-indigo-600/20 transition-all flex items-center justify-between text-indigo-300 font-bold text-xs"
            >
              <span>一覧に該当がない場合「{query}」を直接入力</span>
              <span className="text-[10px] font-semibold underline text-indigo-400">決定</span>
            </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Master Status Badge */}
      {selectedItem && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{selectedItem.name} （偏差値: {selectedItem.hensachi.toFixed(1)}）</span>
          </div>
          <span className="text-[10px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-700/50">
            マスタ判定済
          </span>
        </div>
      )}

      {/* 2. 手動偏差値設定 (下)：一覧に該当がない大学のときだけ表示 */}
      {!selectedItem && trimmedQuery && !hasExactMatch && (isCustomMode || suggestions.length === 0) ? (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              大学偏差値を手動指定 (任意):
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9.]*"
              step="0.5"
              min="30"
              max="80"
              value={customHensachi}
              onChange={handleCustomHensachiChange}
              placeholder="例: 55.0"
              className="w-32 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <span className="text-[11px] text-slate-400">
              ※プルダウン一覧にない大学の場合、偏差値を直接入力できます
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
