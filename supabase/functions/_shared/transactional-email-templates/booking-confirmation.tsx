/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hush Salon'

interface BookingProps {
  name?: string
  service?: string
  artist?: string
  date?: string
  time?: string
  notes?: string
}

const BookingConfirmationEmail = ({
  name,
  service,
  artist,
  date,
  time,
  notes,
}: BookingProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your appointment at {SITE_NAME} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>HUSH</Text>
          <Text style={tagline}>Appointment Confirmed</Text>
        </Section>
        <Heading style={h1}>
          {name ? `You're booked, ${name}.` : `You're booked.`}
        </Heading>
        <Text style={text}>
          We can't wait to see you. Here are your appointment details:
        </Text>

        <Section style={detailsCard}>
          {service && (
            <Section style={row}>
              <Text style={label}>Service</Text>
              <Text style={value}>{service}</Text>
            </Section>
          )}
          {artist && (
            <Section style={row}>
              <Text style={label}>With</Text>
              <Text style={value}>{artist}</Text>
            </Section>
          )}
          {date && (
            <Section style={row}>
              <Text style={label}>Date</Text>
              <Text style={value}>{date}</Text>
            </Section>
          )}
          {time && (
            <Section style={row}>
              <Text style={label}>Time</Text>
              <Text style={value}>{time}</Text>
            </Section>
          )}
          {notes && (
            <Section style={row}>
              <Text style={label}>Notes</Text>
              <Text style={value}>{notes}</Text>
            </Section>
          )}
        </Section>

        <Hr style={hr} />
        <Text style={subtle}>
          <strong>Need to reschedule?</strong> Please give us 24 hours notice.
          Call <strong>(520) 327-6753</strong> and our front desk will take care of you.
        </Text>
        <Text style={subtle}>
          <strong>First visit?</strong> Plan to arrive 5 minutes early. Free parking is available out front.
        </Text>
        <Text style={footer}>See you soon,<br />The Hush Rockstars</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: (data: Record<string, any>) =>
    data?.date ? `Hush appointment confirmed — ${data.date}` : 'Your Hush appointment is confirmed',
  displayName: 'Booking confirmation',
  previewData: {
    name: 'Jane',
    service: 'Balayage + Cut',
    artist: 'Sheri',
    date: 'Saturday, May 4',
    time: '10:00 AM',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }
const container = { padding: '40px 32px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid #e8e2d4' }
const brand = { fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', color: '#1a1a1a', margin: '0' }
const tagline = { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#c9a55e', margin: '8px 0 0' }
const h1 = { fontSize: '28px', fontWeight: 400, color: '#1a1a1a', margin: '40px 0 16px', letterSpacing: '-0.01em' }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.7', margin: '0 0 24px' }
const detailsCard = { backgroundColor: '#faf7f0', border: '1px solid #e8e2d4', borderRadius: '6px', padding: '24px 28px', margin: '8px 0 24px' }
const row = { margin: '0 0 14px' }
const label = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#8a7a5a', margin: '0 0 2px', fontWeight: 600 }
const value = { fontSize: '16px', color: '#1a1a1a', margin: '0', fontWeight: 500 }
const hr = { borderColor: '#e8e2d4', margin: '24px 0' }
const subtle = { fontSize: '13px', color: '#6b6b6b', lineHeight: '1.6', margin: '0 0 14px' }
const footer = { fontSize: '13px', color: '#6b6b6b', margin: '32px 0 0', textAlign: 'center' as const, fontStyle: 'italic' as const }