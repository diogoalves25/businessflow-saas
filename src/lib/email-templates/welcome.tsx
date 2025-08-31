import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  businessName: string;
  ownerName: string;
  plan: string;
}

export const WelcomeEmail = ({
  businessName,
  ownerName,
  plan,
}: WelcomeEmailProps) => {
  const planFeatures = {
    trial: [
      '14-day free trial',
      'Up to 10 bookings',
      '2 team members',
      'Basic scheduling',
    ],
    starter: [
      'Up to 50 bookings/month',
      '3 team members',
      'Email support',
      'Customer database',
      'Basic reporting',
    ],
    growth: [
      'Up to 200 bookings/month',
      '10 team members',
      'Priority support',
      'SMS notifications',
      'Marketing tools',
      'Advanced analytics',
    ],
    premium: [
      'Unlimited bookings',
      'Unlimited team members',
      'Dedicated support',
      'White-label options',
      'API access',
      'Custom integrations',
    ],
  };

  const features = planFeatures[plan as keyof typeof planFeatures] || planFeatures.trial;

  return (
    <Html>
      <Head />
      <Preview>Welcome to BusinessFlow - Let's grow your {businessName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Welcome to BusinessFlow! 🎉</Heading>
          </Section>
          
          <Section style={content}>
            <Text style={paragraph}>
              Hi {ownerName},
            </Text>
            
            <Text style={paragraph}>
              Congratulations on taking the first step to streamline <strong>{businessName}</strong>! 
              We're thrilled to have you join thousands of service businesses that are growing with BusinessFlow.
            </Text>

            <Section style={ctaSection}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/admin`}
              >
                Go to Your Dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            <Section>
              <Heading style={h2}>Your {plan === 'trial' ? 'Trial' : plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Includes:</Heading>
              <ul style={featureList}>
                {features.map((feature, index) => (
                  <li key={index} style={featureItem}>
                    <span style={checkmark}>✓</span> {feature}
                  </li>
                ))}
              </ul>
            </Section>

            <Hr style={hr} />

            <Section>
              <Heading style={h2}>Get Started in 3 Easy Steps:</Heading>
              
              <Section style={stepSection}>
                <table style={stepsTable}>
                  <tbody>
                    <tr>
                      <td style={stepNumber}>1</td>
                      <td style={stepContent}>
                        <Text style={stepTitle}>Add Your Team</Text>
                        <Text style={stepDescription}>
                          Invite team members and assign roles to manage your business together.
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td style={stepNumber}>2</td>
                      <td style={stepContent}>
                        <Text style={stepTitle}>Set Up Services</Text>
                        <Text style={stepDescription}>
                          Configure your services, pricing, and availability to start accepting bookings.
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td style={stepNumber}>3</td>
                      <td style={stepContent}>
                        <Text style={stepTitle}>Share Your Booking Page</Text>
                        <Text style={stepDescription}>
                          Share your custom booking link with customers and watch your calendar fill up!
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            </Section>

            <Hr style={hr} />

            <Section style={helpSection}>
              <Heading style={h3}>Need Help?</Heading>
              <Text style={helpText}>
                Our support team is here for you! Check out our{' '}
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/help`} style={link}>
                  Help Center
                </Link>{' '}
                or reply to this email with any questions.
              </Text>
            </Section>

            <Text style={footer}>
              Happy scheduling!<br />
              The BusinessFlow Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '32px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
};

const header = {
  backgroundColor: '#10b981',
  padding: '32px',
  borderRadius: '8px 8px 0 0',
};

const content = {
  padding: '32px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '600',
  margin: '24px 0 16px',
};

const h3 = {
  color: '#18181b',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const featureList = {
  marginTop: '16px',
  paddingLeft: '0',
  listStyle: 'none',
};

const featureItem = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
  display: 'flex',
  alignItems: 'center',
};

const checkmark = {
  color: '#10b981',
  fontWeight: '700',
  marginRight: '8px',
};

const stepSection = {
  margin: '24px 0',
};

const stepsTable = {
  width: '100%',
};

const stepNumber = {
  backgroundColor: '#dbeafe',
  borderRadius: '50%',
  color: '#1e40af',
  fontSize: '20px',
  fontWeight: '700',
  width: '40px',
  height: '40px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
  paddingTop: '8px',
};

const stepContent = {
  paddingLeft: '16px',
  paddingBottom: '24px',
};

const stepTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const stepDescription = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const helpSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
};

const helpText = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const footer = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};