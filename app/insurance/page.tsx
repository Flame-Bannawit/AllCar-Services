import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ประกันรถยนต์ — AllCar Services',
  description: 'เปรียบเทียบประกันรถยนต์จากบริษัทชั้นนำ ราคาดี คุ้มครองครบ',
}

const insurances = [
  {
    company: 'เมืองไทยประกันภัย',
    logo: '🏢',
    type: 'ชั้น 1',
    price: 'เริ่มต้น ฿8,500/ปี',
    coverage: ['รถตัวเอง', 'รถคู่กรณี', 'บุคคลภายนอก', 'ไฟไหม้-โจรกรรม'],
    highlight: 'ซ่อมอู่ในเครือทั่วไทย',
    color: 'blue',
    url: 'https://www.muangthai.co.th',
  },
  {
    company: 'วิริยะประกันภัย',
    logo: '🛡️',
    type: 'ชั้น 1',
    price: 'เริ่มต้น ฿9,200/ปี',
    coverage: ['รถตัวเอง', 'รถคู่กรณี', 'บุคคลภายนอก', 'ไฟไหม้-โจรกรรม'],
    highlight: 'บริการ 24 ชั่วโมง รถยก รถสำรอง',
    color: 'green',
    url: 'https://www.viriyah.co.th',
  },
  {
    company: 'ทิพยประกันภัย',
    logo: '🌟',
    type: 'ชั้น 2+',
    price: 'เริ่มต้น ฿4,500/ปี',
    coverage: ['รถตัวเอง (ชนยานพาหนะ)', 'รถคู่กรณี', 'บุคคลภายนอก', 'ไฟไหม้-โจรกรรม'],
    highlight: 'ราคาคุ้มค่า เคลมง่าย',
    color: 'purple',
    url: 'https://www.dhipaya.co.th',
  },
  {
    company: 'กรุงเทพประกันภัย',
    logo: '🏙️',
    type: 'ชั้น 3+',
    price: 'เริ่มต้น ฿2,800/ปี',
    coverage: ['รถตัวเอง (ชนยานพาหนะ)', 'รถคู่กรณี', 'บุคคลภายนอก'],
    highlight: 'ราคาประหยัด เหมาะรถเก่า',
    color: 'amber',
    url: 'https://www.bki.co.th',
  },
]

const colorMap: Record<string, string> = {
  blue:   'border-blue-200 bg-blue-50',
  green:  'border-green-200 bg-green-50',
  purple: 'border-purple-200 bg-purple-50',
  amber:  'border-amber-200 bg-amber-50',
}

const badgeMap: Record<string, string> = {
  blue:   'bg-blue-600 text-white',
  green:  'bg-green-600 text-white',
  purple: 'bg-purple-600 text-white',
  amber:  'bg-amber-500 text-white',
}

const btnMap: Record<string, string> = {
  blue:   'bg-blue-600 hover:bg-blue-700 text-white',
  green:  'bg-green-600 hover:bg-green-700 text-white',
  purple: 'bg-purple-600 hover:bg-purple-700 text-white',
  amber:  'bg-amber-500 hover:bg-amber-600 text-white',
}

export default function InsurancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8 text-center">
        <p className="text-4xl mb-3">🛡️</p>
        <h1 className="text-2xl font-bold mb-2">เปรียบเทียบประกันรถยนต์</h1>
        <p className="text-blue-100">เลือกแผนประกันที่เหมาะกับคุณ จากบริษัทชั้นนำในไทยครับ</p>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-amber-800 text-sm font-medium mb-2">💡 เคล็ดลับเลือกประกันรถ</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-amber-700">
          <p>🚗 รถใหม่/แพง → เลือกชั้น 1</p>
          <p>🚘 รถอายุ 3-7 ปี → เลือกชั้น 2+ หรือ 3+</p>
          <p>🚙 รถเก่า/ราคาต่ำ → เลือกชั้น 3</p>
        </div>
      </div>

      {/* Insurance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {insurances.map(ins => (
          <div key={ins.company} className={`rounded-xl border-2 p-5 ${colorMap[ins.color]}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-2xl">{ins.logo}</span>
                <h3 className="font-bold text-gray-900 mt-1">{ins.company}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeMap[ins.color]}`}>
                ประกัน{ins.type}
              </span>
            </div>

            <p className="text-xl font-bold text-gray-900 mb-3">{ins.price}</p>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-1">ความคุ้มครอง</p>
              <div className="space-y-1">
                {ins.coverage.map(c => (
                  <div key={c} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <span className="text-green-500">✓</span>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-gray-600">⭐ {ins.highlight}</p>
            </div>

            <a
              href={ins.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition ${btnMap[ins.color]}`}
            >
              ดูรายละเอียด →
            </a>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">คำถามที่พบบ่อย</h2>
        <div className="space-y-4">
          {[
            { q: 'ประกันชั้น 1 กับชั้น 2+ ต่างกันยังไง?', a: 'ชั้น 1 คุ้มครองรถตัวเองทุกกรณี ส่วนชั้น 2+ คุ้มครองรถตัวเองเฉพาะกรณีชนกับยานพาหนะอื่นครับ' },
            { q: 'ต้องซื้อประกันรถทุกปีไหม?', a: 'พ.ร.บ. บังคับทุกปีครับ ส่วนประกันภาคสมัครใจขึ้นอยู่กับต้องการครับ แต่แนะนำให้ทำทุกปีเพื่อความปลอดภัย' },
            { q: 'เคลมประกันได้กี่ครั้งต่อปี?', a: 'ขึ้นอยู่กับเงื่อนไขของแต่ละบริษัทครับ ส่วนใหญ่ไม่จำกัดจำนวนครั้ง แต่ถ้าเคลมบ่อยอาจมีผลต่อเบี้ยปีถัดไป' },
          ].map(faq => (
            <div key={faq.q} className="border-b pb-4 last:border-0">
              <p className="font-medium text-gray-900 text-sm mb-1">❓ {faq.q}</p>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-4">อ่านเพิ่มเติมเกี่ยวกับประกันรถยนต์</p>
        <Link
          href="/blog/car-insurance-guide"
          className="inline-block border border-blue-600 text-blue-600 px-6 py-2 rounded-lg text-sm hover:bg-blue-50 transition"
        >
          อ่านคู่มือประกันรถยนต์ →
        </Link>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        * ราคาเป็นราคาโดยประมาณ กรุณาติดต่อบริษัทประกันโดยตรงเพื่อรับใบเสนอราคาที่แม่นยำครับ
      </p>
    </div>
  )
}