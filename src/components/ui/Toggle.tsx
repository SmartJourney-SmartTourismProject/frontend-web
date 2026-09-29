export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      // Flexbox positions the thumb (justify-start/-end within the track's
      // own padding) instead of an absolute + fixed-pixel translate - the
      // old version could put the thumb outside the track under anything
      // that shifts the effective px-per-rem ratio, since a `translate-x-*`
      // arbitrary value doesn't rescale with the track the way this does.
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? 'justify-end bg-brand-gradient' : 'justify-start bg-gray-200'
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}
