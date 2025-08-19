export default function SkeletonCard({ height = 80 }) {
  return (
    <div className="card mb-3" style={{height, borderRadius:16, background:'#eee', border:'none', boxShadow:'none'}}>
      <div className="placeholder-glow w-100 h-100" style={{height}}>
        <span className="placeholder col-12 h-100" style={{display:'block', borderRadius:16}}></span>
      </div>
    </div>
  );
}
