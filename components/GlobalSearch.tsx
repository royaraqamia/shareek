'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, FileText, ShoppingBag, Receipt, Users, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { globalSearchAction, SearchResultItem } from '@/features/search/actions';
import { useDebounce } from '@/utils/hooks/useDebounce';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      const res = await globalSearchAction(debouncedQuery);
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setResults([]);
      }
      setIsSearching(false);
    }
    
    performSearch();
  }, [debouncedQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleItemClick = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const getIcon = (type: SearchResultItem['type']) => {
    switch(type) {
      case 'TASK': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'PRODUCT': return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'TRANSACTION': return <Receipt className="w-4 h-4 text-blue-500" />;
      case 'CONTACT': return <Users className="w-4 h-4 text-purple-500" />;
      case 'USER': return <UserRound className="w-4 h-4 text-slate-500" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeName = (type: SearchResultItem['type']) => {
    switch(type) {
      case 'TASK': return 'مهمة';
      case 'PRODUCT': return 'عنصر';
      case 'TRANSACTION': return 'معاملة';
      case 'CONTACT': return 'جهة اتصال';
      case 'USER': return 'مستخدم';
      default: return 'نتيجة';
    }
  };

  return (
    <div ref={searchRef} className="relative z-50">
      {/* Mobile Search Button triggers full width input on mobile if needed, but for simplicity, we will just use a standardized input */}
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        isOpen ? "w-64 md:w-80" : "w-10 sm:w-60"
      )}>
        <Search className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input 
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="بحث شامل..."
          className={cn(
            "h-9 pr-9 text-sm font-medium transition-all cursor-text",
            "bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-full",
            !isOpen && "sm:w-full w-10 sm:px-3 px-0 border-transparent sm:border-slate-200 bg-transparent sm:bg-slate-50 text-transparent sm:text-slate-900 placeholder:text-transparent sm:placeholder:text-slate-500 cursor-pointer sm:cursor-text",
            isOpen && "w-full pl-8"
          )}
        />
        {query && isOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-1 w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            onClick={handleClear}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full min-w-[300px] left-0 sm:left-auto sm:right-0 bg-white rounded-xl shadow-xl border border-slate-200/60 overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {isSearching ? (
                <div className="flex items-center justify-center p-6 text-slate-500 gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  جاري البحث...
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {results.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleItemClick(item.href)}
                      className="w-full flex flex-col items-start gap-1 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-right"
                    >
                      <div className="flex items-center gap-2.5 w-full">
                        <div className="bg-white border border-slate-100 p-1.5 rounded-md shadow-sm shrink-0">
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium shrink-0">{getTypeName(item.type)}</span>
                            {item.subtitle && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                <span className="truncate">{item.subtitle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">لا توجد نتائج</p>
                  <p className="text-xs text-slate-500 mt-1">لم نتمكن من العثور على أي بيانات تطابق "{query}"</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 border-t border-slate-100 p-2.5 flex justify-between items-center text-xs text-slate-500 rounded-b-xl">
              <span className="font-medium text-slate-400">بحث سريع</span>
              {results.length > 0 && <span>{results.length} نتيجة</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
