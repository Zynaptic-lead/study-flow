export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1E40AF] rounded-full animate-spin" />
    </div>
  );
}