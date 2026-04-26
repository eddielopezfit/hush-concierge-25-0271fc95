import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hush Salon & Day Spa'

interface WelcomeProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — your sanctuary awaits</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>HUSH</Text>
          <Text style={tagline}>SALON &amp; DAY SPA</Text>
        </Section>

        <Heading style={h1}>
          {name ? `Welcome, ${name}.` : 'Welcome.'}
        </Heading>

        <Text style={lede}>
          You've just stepped inside something quietly extraordinary.
        </Text>

        <Text style={text}>
          For over twenty years, our three founders — Sheri, Danielle, and
          Kathy — have stood behind the chair, shaping a sanctuary built on
          craft, warmth, and the kind of beauty that feels like coming home.
        </Text>

        <Text style={text}>
          We are honored you're here. Whether you're after the perfect
          balayage, a transformative cut, lashes that whisper, nails that
          quietly command, or skin that finally feels like yours again —
          our Rockstars are ready.
        </Text>

        <Text style={text}>
          Our front desk will reach out personally to set up your first visit
          — no rushed booking, no pressure. Just a real conversation, then a
          time that works for you.
        </Text>

        <Hr style={hr} />

        <Text style={signoff}>With warmth,</Text>
        <Text style={signature}>The Hush Family</Text>

        <Section style={footerCard}>
          <Text style={footerLine}>
            <Link href="tel:+15203276753" style={footerLink}>
              (520) 327-6753
            </Link>
            {'  ·  '}
            <Link href="https://hush-salon.lovable.app" style={footerLink}>
              hush-salon.lovable.app
            </Link>
          </Text>
          <Text style={footerHours}>
            Tue &amp; Thu 9–7  ·  Wed &amp; Fri 9–5  ·  Sat 9–4
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Hush — your sanctuary awaits',
  displayName: 'Welcome to Hush',
  previewData: { name: 'Jordan' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: '40px 0',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0 24px',
}

const header = {
  textAlign: 'center' as const,
  padding: '8px 0 32px',
  borderBottom: '1px solid #e8e4dd',
  marginBottom: '36px',
}

const brand = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '0.4em',
  color: '#9a7a3a',
  margin: 0,
  lineHeight: '1.1',
}

const tagline = {
  fontSize: '10px',
  letterSpacing: '0.35em',
  color: '#999',
  margin: '6px 0 0',
  textTransform: 'uppercase' as const,
}

const h1 = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '30px',
  fontWeight: 500,
  color: '#1a1714',
  margin: '0 0 18px',
  lineHeight: '1.2',
}

const lede = {
  fontSize: '17px',
  color: '#3d3a35',
  fontStyle: 'italic',
  lineHeight: '1.5',
  margin: '0 0 28px',
}

const text = {
  fontSize: '15px',
  color: '#4a4640',
  lineHeight: '1.7',
  margin: '0 0 20px',
}

const hr = {
  border: 'none',
  borderTop: '1px solid #e8e4dd',
  margin: '36px 0 24px',
}

const signoff = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 4px',
}

const signature = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '18px',
  color: '#9a7a3a',
  fontStyle: 'italic',
  margin: '0 0 36px',
}

const footerCard = {
  backgroundColor: '#faf8f5',
  padding: '20px 24px',
  borderRadius: '6px',
  textAlign: 'center' as const,
}

const footerLine = {
  fontSize: '13px',
  color: '#4a4640',
  margin: '0 0 6px',
}

const footerLink = {
  color: '#9a7a3a',
  textDecoration: 'none',
  fontWeight: 500,
}

const footerHours = {
  fontSize: '11px',
  color: '#999',
  margin: 0,
  letterSpacing: '0.05em',
}