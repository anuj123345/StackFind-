const STATS = [
  { value: "500+", label: "AI Tools" },
  { value: "10",   label: "Categories" },
  { value: "₹",    label: "INR Pricing" },
  { value: "47+",  label: "Made in India" },
]

export function StatsBar() {
  return (
    <div className="relative z-10 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <div className="card-bezel">
          <div className="card-inner">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.04]">
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center py-6 px-4 gap-1">
                  <span
                    className="text-2xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/35 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
