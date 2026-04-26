/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>HUSH</Text>
          <Text style={tagline}>Salon · Spa · Sanctuary</Text>
        </Section>
        <Heading style={h1}>Welcome — confirm your email</Heading>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Please confirm{' '}
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>{' '}
          to finish setting up your account.
        </Text>
        <Section style={ctaWrap}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }
const container = { padding: '40px 32px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid #e8e2d4' }
const brand = { fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', color: '#1a1a1a', margin: '0' }
const tagline = { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#c9a55e', margin: '8px 0 0' }
const h1 = { fontSize: '26px', fontWeight: 400, color: '#1a1a1a', margin: '40px 0 20px', letterSpacing: '-0.01em' }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.7', margin: '0 0 24px' }
const link = { color: '#c9a55e', textDecoration: 'underline' }
const ctaWrap = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#c9a55e', color: '#1a1a1a', padding: '14px 36px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', lineHeight: '1.6' }
