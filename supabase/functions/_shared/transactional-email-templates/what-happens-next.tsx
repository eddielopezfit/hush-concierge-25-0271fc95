import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Row,
  Column,
  Section,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hush Salon & Day Spa'

interface WhatHappensNextProps {
  name?: string
}

const WhatHappensNextEmail = ({ name }: WhatHappensNextProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Here's what happens next at Hush — a quick note from Luna</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>HUSH</Text>
          <Text style={tagline}>A NOTE FROM LUNA</Text>
        </Section>

        <Heading style={h1}>
          {name ? `${name}, here's what happens next.` : 'Here\u2019s what happens next.'}
        </Heading>

        <Text style={lede}>
          Thank you for reaching out. Nothing is booked yet — and that\u2019s
          on purpose. Your first visit at Hush starts with a real conversation,
          not a calendar slot.
        </Text>

        <Hr style={hr} />

        {[
          {
            n: '01',
            title: 'Kendell will call you',
            body:
              'Our front desk will reach out personally to talk through what you\u2019re looking for, answer any questions, and match you with the right artist.',
          },
          {
            n: '02',
            title: 'We\u2019ll find a time that works for you',
            body:
              'Once we know your goals, we\u2019ll set up a time that fits your schedule — no rushed booking, no pressure.',
          },
          {
            n: '03',
            title: 'You\u2019ll get a confirmation',
            body:
              'After your appointment is set, we\u2019ll send a confirmation with everything you need to know for your visit.',
          },
        ].map((tip) => (
          <Section key={tip.n} style={tipSection}>
            <Row>
              <Column style={tipNumberCol}>
                <Text style={tipNumber}>{tip.n}</Text>
              </Column>
              <Column>
                <Text style={tipTitle}>{tip.title}</Text>
                <Text style={tipBody}>{tip.body}</Text>
              </Column>
            </Row>
          </Section>
        ))}

        <Hr style={hr} />

        <Text style={text}>
          If you\u2019d rather skip the call and just talk now, we\u2019re right
          here at <Link href="tel:+15203276753" style={inlineLink}>(520) 327-6753</Link>.
        </Text>

        <Text style={signoff}>Quietly looking forward to meeting you,</Text>
        <Text style={signature}>Luna &amp; the {SITE_NAME} family</Text>

        <Section style={footerCard}>
          <Text style={footerLine}>
            <Link href="tel:+15203276753" style={footerLink}>
              (520) 327-6753
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
  component: WhatHappensNextEmail,
  subject: 'Here\u2019s what happens next at Hush',
  displayName: 'What happens next',
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
  fontSize: '28px',
  fontWeight: 500,
  color: '#1a1714',
  margin: '0 0 18px',
  lineHeight: '1.25',
}

const lede = {
  fontSize: '16px',
  color: '#3d3a35',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 8px',
}

const text = {
  fontSize: '15px',
  color: '#4a4640',
  lineHeight: '1.7',
  margin: '0 0 20px',
}

const inlineLink = {
  color: '#9a7a3a',
  textDecoration: 'none',
  fontWeight: 500,
}

const hr = {
  border: 'none',
  borderTop: '1px solid #e8e4dd',
  margin: '28px 0',
}

const tipSection = {
  marginBottom: '22px',
}

const tipNumberCol = {
  width: '54px',
  verticalAlign: 'top' as const,
}

const tipNumber = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '20px',
  color: '#9a7a3a',
  margin: 0,
  letterSpacing: '0.05em',
  fontWeight: 500,
}

const tipTitle = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#1a1714',
  margin: '0 0 4px',
}

const tipBody = {
  fontSize: '14px',
  color: '#4a4640',
  lineHeight: '1.6',
  margin: 0,
}

const signoff = {
  fontSize: '14px',
  color: '#666',
  margin: '20px 0 4px',
}

const signature = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '18px',
  color: '#9a7a3a',
  fontStyle: 'italic',
  margin: '0 0 32px',
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