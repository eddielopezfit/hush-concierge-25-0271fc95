/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hush Salon'
const SITE_URL = 'https://hush-salon.lovable.app'

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
          <Text style={tagline}>Salon · Spa · Sanctuary</Text>
        </Section>
        <Heading style={h1}>
          {name ? `Welcome, ${name}.` : 'Welcome.'}
        </Heading>
        <Text style={text}>
          We're so glad you found us. For more than two decades, Hush has been a sanctuary
          for guests who want to look and feel like the best version of themselves.
        </Text>
        <Text style={text}>
          From signature color and balayage to lashes, skin, nails, and massage —
          our team is here to take care of you, head to toe.
        </Text>
        <Section style={ctaWrap}>
          <Button href={SITE_URL} style={button}>
            Explore Hush
          </Button>
        </Section>
        <Text style={subtle}>
          Questions? Call our front desk at <strong>(520) 327-6753</strong> —
          Tuesday through Saturday.
        </Text>
        <Text style={footer}>With love,<br />The Hush Rockstars</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Hush Salon',
  displayName: 'Welcome email',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }
const container = { padding: '40px 32px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid #e8e2d4' }
const brand = { fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', color: '#1a1a1a', margin: '0' }
const tagline = { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#c9a55e', margin: '8px 0 0' }
const h1 = { fontSize: '28px', fontWeight: 400, color: '#1a1a1a', margin: '40px 0 24px', letterSpacing: '-0.01em' }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.7', margin: '0 0 18px' }
const ctaWrap = { textAlign: 'center' as const, margin: '36px 0' }
const button = { backgroundColor: '#c9a55e', color: '#1a1a1a', padding: '14px 36px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', display: 'inline-block' }
const subtle = { fontSize: '13px', color: '#6b6b6b', lineHeight: '1.6', margin: '32px 0 0', textAlign: 'center' as const }
const footer = { fontSize: '13px', color: '#6b6b6b', margin: '32px 0 0', textAlign: 'center' as const, fontStyle: 'italic' as const }