import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface StackExportEmailProps {
  idea: string;
  techStack: Array<{
    name: string;
    category: string;
    price: string;
    url: string;
  }>;
  plan: string;
}

export const StackExportEmail = ({
  idea,
  techStack,
  plan,
}: StackExportEmailProps) => {
  const isGenericPlan = plan.includes("No detailed build plan generated yet");
  
  return (
    <Html>
      <Head />
      <Preview>Your StackFind Project Blueprint: {idea}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <div style={logoWrapper}>
              <Img
                src="https://img.icons8.com/ios-filled/100/6366f1/flash-on.png"
                width="32"
                height="32"
                alt="SF"
                style={logoImage}
              />
            </div>
            <Heading style={heading}>StackFind Blueprint</Heading>
            <Text style={subheading}>Custom architecture for your project</Text>
          </Section>

          <Section style={ideaSection}>
            <Text style={ideaLabel}>THE VISION</Text>
            <Text style={ideaText}>"{idea}"</Text>
          </Section>

          <Section style={stackSection}>
            <div style={sectionHeader}>
              <Text style={sectionTitle}>Selected Tech Stack</Text>
              <Text style={sectionBadge}>{techStack.length} Tools</Text>
            </div>
            {techStack.map((tool, index) => {
              const domain = tool.url ? new URL(tool.url).hostname : '';
              const logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
              
              return (
                <Section key={index} style={toolCard}>
                  <Row>
                    <Column style={{ width: '56px' }}>
                      <Img
                        src={logo}
                        width="36"
                        height="36"
                        style={toolLogo}
                      />
                    </Column>
                    <Column>
                      <Link href={tool.url} style={toolLink}>
                        <Text style={toolName}>{tool.name}</Text>
                      </Link>
                      <Text style={toolMeta}>
                        <span style={categoryBadge}>{tool.category}</span>
                        <span style={priceTag}> • {tool.price}</span>
                      </Text>
                    </Column>
                  </Row>
                </Section>
              );
            })}
          </Section>

          <Section style={planSection}>
            <Text style={sectionTitle}>Execution Strategy</Text>
            <div style={planCard}>
              {isGenericPlan ? (
                <div style={planEmptyState}>
                  <Text style={planText}>{plan}</Text>
                  <Link href="https://stackfind.in/playground" style={ctaButton}>
                    Generate Full Roadmap →
                  </Link>
                </div>
              ) : (
                <Text style={planText}>{plan}</Text>
              )}
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Generated with <strong>StackFind</strong> — India's AI Tools Directory.
            </Text>
            <Row style={footerLinks}>
              <Column align="center">
                <Link href="https://stackfind.in" style={footerLink}>Website</Link>
                <span style={dot}>•</span>
                <Link href="https://stackfind.in/playground" style={footerLink}>Playground</Link>
                <span style={dot}>•</span>
                <Link href="https://stackfind.in/founders" style={footerLink}>Founders</Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const logoWrapper = {
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
};

const logoImage = {
  margin: '12px auto',
};

const heading = {
  fontSize: '28px',
  fontWeight: '900',
  color: '#1e293b',
  margin: '0',
  letterSpacing: '-0.02em',
};

const subheading = {
  fontSize: '14px',
  color: '#64748b',
  margin: '4px 0 0',
  fontWeight: '500',
};

const ideaSection = {
  backgroundColor: '#f1f5f9',
  padding: '24px 32px',
  borderRadius: '12px',
  marginBottom: '40px',
  border: '1px dashed #cbd5e1',
};

const ideaLabel = {
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.1em',
  color: '#6366f1',
  marginBottom: '8px',
  margin: '0',
};

const ideaText = {
  fontSize: '17px',
  color: '#334155',
  fontStyle: 'italic',
  lineHeight: '1.5',
  margin: '4px 0 0',
  fontWeight: '500',
};

const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '800',
  color: '#1e293b',
  margin: '0',
};

const sectionBadge = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#6366f1',
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  padding: '4px 8px',
  borderRadius: '6px',
  margin: '0',
};

const stackSection = {
  marginBottom: '40px',
};

const toolCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #f1f5f9',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '10px',
};

const toolLogo = {
  borderRadius: '8px',
  backgroundColor: '#f8fafc',
};

const toolLink = {
  textDecoration: 'none',
};

const toolName = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0',
};

const toolMeta = {
  fontSize: '12px',
  color: '#64748b',
  margin: '4px 0 0',
};

const categoryBadge = {
  color: '#6366f1',
  fontWeight: '600',
};

const priceTag = {
  color: '#94a3b8',
};

const planSection = {
  marginBottom: '40px',
};

const planCard = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  marginTop: '12px',
};

const planText = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#475569',
  whiteSpace: 'pre-wrap' as const,
  margin: '0',
};

const planEmptyState = {
  textAlign: 'center' as const,
};

const ctaButton = {
  display: 'inline-block',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  marginTop: '16px',
};

const hr = {
  borderColor: '#f1f5f9',
  margin: '40px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '13px',
  color: '#64748b',
  marginBottom: '16px',
};

const footerLinks = {
  width: '100%',
};

const footerLink = {
  fontSize: '12px',
  color: '#6366f1',
  textDecoration: 'none',
  fontWeight: '600',
};

const dot = {
  color: '#cbd5e1',
  margin: '0 8px',
};

