import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { type, to, data } = await request.json()

    let subject = ''
    let html = ''

    if (type === 'listing_approved') {
      subject = '✅ ประกาศรถของคุณได้รับการอนุมัติแล้ว — AllCar Services'
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">AllCar Services</h2>
          <h3>ประกาศรถของคุณได้รับการอนุมัติแล้วครับ! 🎉</h3>
          <p>ประกาศ <strong>${data.title}</strong> ของคุณได้รับการอนุมัติและแสดงบนเว็บไซต์แล้วครับ</p>
          <a href="https://all-car-services.vercel.app/cars/${data.id}" 
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            ดูประกาศของฉัน
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">AllCar Services — Platform รถยนต์ครบวงจร</p>
        </div>
      `
    }

    if (type === 'listing_rejected') {
      subject = '❌ ประกาศรถของคุณถูกปฏิเสธ — AllCar Services'
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">AllCar Services</h2>
          <h3>ประกาศรถของคุณถูกปฏิเสธครับ</h3>
          <p>ประกาศ <strong>${data.title}</strong> ของคุณถูกปฏิเสธ เนื่องจากไม่ผ่านเงื่อนไขของเราครับ</p>
          <p>กรุณาตรวจสอบข้อมูลและลงประกาศใหม่อีกครั้งครับ</p>
          <a href="https://all-car-services.vercel.app/cars/create"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            ลงประกาศใหม่
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">AllCar Services — Platform รถยนต์ครบวงจร</p>
        </div>
      `
    }

    if (type === 'new_message') {
      subject = '💬 คุณมีข้อความใหม่ — AllCar Services'
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">AllCar Services</h2>
          <h3>คุณมีข้อความใหม่ครับ!</h3>
          <p><strong>${data.sender}</strong> ส่งข้อความมาถึงคุณครับ</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;">"${data.content}"</p>
          </div>
          <a href="https://all-car-services.vercel.app/chat/${data.room_id}"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            ดูข้อความ
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">AllCar Services — Platform รถยนต์ครบวงจร</p>
        </div>
      `
    }

    if (type === 'garage_approved') {
      subject = '✅ อู่ของคุณได้รับการอนุมัติแล้ว — AllCar Services'
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">AllCar Services</h2>
          <h3>อู่ของคุณได้รับการอนุมัติแล้วครับ! 🎉</h3>
          <p>อู่ <strong>${data.name}</strong> ของคุณได้รับการอนุมัติและแสดงบนแผนที่แล้วครับ</p>
          <a href="https://all-car-services.vercel.app/garages/${data.id}"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            ดูอู่ของฉัน
          </a>
          <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">AllCar Services — Platform รถยนต์ครบวงจร</p>
        </div>
      `
    }

    if (!subject) {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const { data: result, error } = await resend.emails.send({
      from: 'AllCar Services <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) throw error

    return NextResponse.json({ success: true, id: result?.id })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}