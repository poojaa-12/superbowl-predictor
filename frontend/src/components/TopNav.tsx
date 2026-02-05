import { NavLink } from '@/components/NavLink';

export function TopNav() {
  return (
    <nav className="relative z-20 w-full">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-2">
        <NavLink
          to="/"
          end
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
          activeClassName="bg-gradient-to-r from-[#69BE28]/20 to-[#C60C30]/20 text-white border-white/20 shadow-lg shadow-white/5"
        >
          Predict
        </NavLink>
        <NavLink
          to="/explore"
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
          activeClassName="bg-gradient-to-r from-[#69BE28]/20 to-[#C60C30]/20 text-white border-white/20 shadow-lg shadow-white/5"
        >
          Explore the Data
        </NavLink>
      </div>
    </nav>
  );
}
