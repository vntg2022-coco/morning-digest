import { Resend } from 'resend'

export async function sendEmail({ to, subject, html, text, headers }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
  if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM is not set')

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject, html, text, headers })
  if (error) throw new Error(`Resend failed: ${error.message}`)
  return data
}
