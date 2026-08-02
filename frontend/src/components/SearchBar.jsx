import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "Buscar...", value, onChange }) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search size={18} />
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition duration-200 outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-sm"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
