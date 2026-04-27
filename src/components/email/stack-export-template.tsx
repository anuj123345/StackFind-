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
}: StackExportEmailProps) => (
  <Html>
    <Head />
    <Preview>Your StackFind Project Blueprint: {idea}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://gtquimbiaugnvgxhuixg.supabase.co/storage/v1/object/public/assets/logo-indigo.png"
            width="42"
            height="42"
            alt="StackFind"
          />
          <Heading style={heading}>Project Blueprint</Heading>
        </Section>

        <Section style={ideaSection}>
          <Text style={ideaLabel}>PROJECT IDEA</Text>
          <Text style={ideaText}>"{idea}"</Text>
        </Section>

        <Hr style={hr} />

        <Section style={stackSection}>
          <Text style={sectionTitle}>Curated Tech Stack</Text>
          {techStack.map((tool, index) => {
            const domain = tool.url ? new URL(tool.url).hostname : '';
            const logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            
            return (
              <Section key={index} style={toolCard}>
                <Row>
                  <Column style={{ width: '48px' }}>
                    <Img
                      src={logo}
                      width="32"
                      height="32"
                      style={toolLogo}
                    />
                  </Column>
                  <Column>
                    <Link href={tool.url} style={toolLink}>
                      <Text style={toolName}>{tool.name}</Text>
                    </Link>
                    <Text style={toolMeta}>
                      {tool.category} • {tool.price}
                    </Text>
                  </Column>
                </Row>
              </Section>
            );
          })}
        </Section>

        <Hr style={hr} />

        <Section style={planSection}>
          <Text style={sectionTitle}>Execution Plan</Text>
          <Text style={planText}>{plan}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Generated with StackFind. Find the best tools for your next project.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  border: '1px solid #e6ebf1',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  marginTop: '12px',
};

const ideaSection = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '6px',
  marginBottom: '32px',
};

const ideaLabel = {
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.05em',
  color: '#64748b',
  marginBottom: '8px',
};

const ideaText = {
  fontSize: '18px',
  color: '#334155',
  fontStyle: 'italic',
  margin: '0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '16px',
};

const stackSection = {
  marginBottom: '32px',
};

const toolCard = {
  border: '1px solid #f1f5f9',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '8px',
};

const toolLogo = {
  borderRadius: '4px',
};

const toolLink = {
  textDecoration: 'none',
};

const toolName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#4f46e5',
  margin: '0',
};

const toolMeta = {
  fontSize: '13px',
  color: '#64748b',
  margin: '4px 0 0',
};

const planSection = {
  marginBottom: '32px',
};

const planText = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#475569',
  whiteSpace: 'pre-wrap' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  marginTop: '32px',
};
