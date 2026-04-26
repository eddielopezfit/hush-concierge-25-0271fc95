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
  Row,
  Column,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hush Salon & Day Spa'

interface FirstVisitProps {
  name?: string
}

const FirstVisitGuideEmail = ({ name }: FirstVisitProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>A few quiet notes to make your first visit feel like home</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>HUSH</Text>
          <Text style={tagline}>A NOTE FROM LUNA</Text>
        </Section>

        <Heading style={h1}>
          {name ? `${name}, before you arrive…` : 'Before you arrive…'}
        </Heading>

        <Text style={lede}>
          A few quiet notes — so your first visit feels less like an
          appointment and more like coming home.
        </Text>

        <Hr style={hr} />

        {[
          {
            n: '01',
            title: 'Arrive ten minutes early',
            body:
              'Settle in with a coffee, tea, or sparkling water. We want you unhurried — that first breath sets the tone.',
          },
          {
            n: '02',
            title: 'Come as you are',
            body:
              'No need to dress up. Wear what makes you comfortable. Your Rockstar will guide everything else.',
          },
          {
            n: '03',
            title: 'Bring inspiration — or don\u2019t',
            body:
              'Photos help. So does a blank slate. Either way, we\u2019ll start with a real conversation about you, not a checklist.',
          },
          {
            n: '04',
            title: 'Parking & arrival',
            body:
              'Free parking right out front. The entrance is the warm-lit door — you\u2019ll know it when you see it.',
          },
          {
            n: '05',
            title: 'A note on cancellations',
            body:
              'Life happens. We ask for 24 hours\u2019 notice when possible — and a quick call to (520) 327-6753 is all it takes.',
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
          If anything at all comes up between now and your visit — a
          question, a change, a quiet doubt — just call us. We\u2019re here.
        </Text>

        <Text style={signoff}>Quietly looking forward to meeting you,</Text>
        <Text style={signature}>Luna &amp; the Hush Family</Text>

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
  component: FirstVisitGuideEmail,
  subject: 'Prepare for your first visit at Hush',
  displayName: 'Prepare for Your First Visit',
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
  lineHeight: '1.5',
  margin: '0 0 8px',
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