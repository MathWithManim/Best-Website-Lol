const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
    <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary/50 dark:text-[#f4d5ad]/50">
      {label}...
    </span>
  </div>
);

export default Spinner;
