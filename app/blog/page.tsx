import Link from 'next/link'

const posts = [
  {
    slug: 'how-to-check-used-car',
    title: '10 วิธีตรวจสอบรถมือสองก่อนซื้อ ไม่ให้โดนหลอก',
    excerpt: 'ก่อนจะซื้อรถมือสองสักคัน มีหลายอย่างที่ต้องตรวจสอบครับ ตั้งแต่เอกสาร ตัวถัง เครื่องยนต์ ไปจนถึงประวัติการซ่อม',
    category: 'ซื้อรถ',
    readTime: '5 นาที',
    date: '2025-01-15',
    image: '🚗',
  },
  {
    slug: 'car-maintenance-tips',
    title: 'ดูแลรถให้อายุยืน ด้วย 8 เคล็ดลับง่ายๆ ที่ทำได้เอง',
    excerpt: 'รถยนต์เป็นสินทรัพย์ที่มีมูลค่า การดูแลรักษาอย่างสม่ำเสมอจะช่วยยืดอายุการใช้งานและประหยัดค่าซ่อมในระยะยาวครับ',
    category: 'ดูแลรถ',
    readTime: '4 นาที',
    date: '2025-01-20',
    image: '🔧',
  },
  {
    slug: 'electric-car-guide',
    title: 'รถไฟฟ้า EV คุ้มหรือไม่? สรุปข้อดีข้อเสียให้ครบ',
    excerpt: 'รถยนต์ไฟฟ้ากำลังได้รับความนิยมในไทยมากขึ้น แต่ก่อนตัดสินใจซื้อ มาดูกันว่าคุ้มค่าสำหรับคุณหรือเปล่าครับ',
    category: 'รถไฟฟ้า',
    readTime: '6 นาที',
    date: '2025-01-25',
    image: '⚡',
  },
  {
    slug: 'car-insurance-guide',
    title: 'ประกันรถยนต์ มีกี่ประเภท เลือกแบบไหนดี?',
    excerpt: 'ประกันรถยนต์มีหลายชั้น ตั้งแต่ประกันชั้น 1 ถึงชั้น 3+ แต่ละแบบคุ้มครองอะไรบ้าง และเหมาะกับใครครับ',
    category: 'ประกันรถ',
    readTime: '5 นาที',
    date: '2025-02-01',
    image: '🛡️',
  },
  {
    slug: 'how-to-sell-car',
    title: 'ขายรถมือสองยังไงให้ได้ราคาดี ไม่ถูกกดราคา',
    excerpt: 'เคล็ดลับการขายรถมือสองให้ได้ราคาที่คุ้มค่า ตั้งแต่การเตรียมรถ ถ่ายรูป ตั้งราคา ไปจนถึงการเจรจาครับ',
    category: 'ขายรถ',
    readTime: '4 นาที',
    date: '2025-02-05',
    image: '💰',
  },
  {
    slug: 'car-loan-guide',
    title: 'กู้เงินซื้อรถ ควรรู้อะไรบ้าง? ดอกเบี้ย เงินดาวน์ ค่างวด',
    excerpt: 'การกู้เงินซื้อรถมีรายละเอียดที่ต้องรู้หลายอย่าง ไม่ว่าจะเป็นอัตราดอกเบี้ย เงินดาวน์ขั้นต่ำ และการคำนวณค่างวดครับ',
    category: 'การเงิน',
    readTime: '6 นาที',
    date: '2025-02-10',
    image: '🏦',
  },
]

const categoryColor: Record<string, string> = {
  'ซื้อรถ':   'bg-blue-100 text-blue-700',
  'ดูแลรถ':   'bg-green-100 text-green-700',
  'รถไฟฟ้า':  'bg-purple-100 text-purple-700',
  'ประกันรถ': 'bg-orange-100 text-orange-700',
  'ขายรถ':    'bg-red-100 text-red-700',
  'การเงิน':  'bg-amber-100 text-amber-700',
}

export const metadata = {
  title: 'บล็อกความรู้เรื่องรถ — AllCar Services',
  description: 'รวมบทความความรู้เรื่องรถยนต์ ซื้อรถ ขายรถ ดูแลรถ ประกันรถ และอื่นๆ',
}

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">บล็อกความรู้เรื่องรถ</h1>
        <p className="text-gray-500 mt-1">รวมบทความที่เป็นประโยชน์สำหรับคนรักรถครับ</p>
      </div>

      {/* Featured */}
      <Link href={`/blog/${posts[0].slug}`} className="block mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white hover:opacity-95 transition">
          <span className="text-5xl mb-4 block">{posts[0].image}</span>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
            {posts[0].category}
          </span>
          <h2 className="text-xl font-bold mt-3 mb-2">{posts[0].title}</h2>
          <p className="text-blue-100 text-sm line-clamp-2">{posts[0].excerpt}</p>
          <p className="text-blue-200 text-xs mt-3">⏱ {posts[0].readTime} · {new Date(posts[0].date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </Link>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.slice(1).map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="bg-white rounded-xl border p-5 hover:shadow-md transition h-full">
              <span className="text-3xl block mb-3">{post.image}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[post.category]}`}>
                {post.category}
              </span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-2 leading-snug">{post.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
              <p className="text-gray-400 text-xs mt-3">⏱ {post.readTime} · {new Date(post.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}