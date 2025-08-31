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

interface BookingReminderEmailProps {
  businessName: string;
  customerName: string;
  serviceName: string;
  scheduledDate: Date;
  address?: string;
  technicianName?: string;
}

export const BookingReminderEmail = ({
  businessName,
  customerName,
  serviceName,
  scheduledDate,
  address,
  technicianName,
}: BookingReminderEmailProps) => {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = new Date(scheduledDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Html>
      <Head />
      <Preview>Reminder: Your {serviceName} is scheduled for tomorrow</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>{businessName}</Heading>
          </Section>
          
          <Section style={content}>
            <Section style={iconSection}>
              <Text style={clockIcon}>⏰</Text>
            </Section>
            
            <Heading style={h2}>Appointment Reminder</Heading>
            
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            
            <Text style={paragraph}>
              This is a friendly reminder that your <strong>{serviceName}</strong> is scheduled for tomorrow.
            </Text>

            <Section style={reminderBox}>
              <table style={table}>
                <tbody>
                  <tr>
                    <td style={iconCell}>📅</td>
                    <td style={detailCell}>
                      <Text style={detailLabel}>Date</Text>
                      <Text style={detailValue}>{formattedDate}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={iconCell}>🕐</td>
                    <td style={detailCell}>
                      <Text style={detailLabel}>Time</Text>
                      <Text style={detailValue}>{formattedTime}</Text>
                    </td>
                  </tr>
                  {address && (
                    <tr>
                      <td style={iconCell}>📍</td>
                      <td style={detailCell}>
                        <Text style={detailLabel}>Location</Text>
                        <Text style={detailValue}>{address}</Text>
                      </td>
                    </tr>
                  )}
                  {technicianName && (
                    <tr>
                      <td style={iconCell}>👤</td>
                      <td style={detailCell}>
                        <Text style={detailLabel}>Your Technician</Text>
                        <Text style={detailValue}>{technicianName}</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            <Hr style={hr} />

            <Section>
              <Heading style={h3}>Please Remember:</Heading>
              <Text style={checklistItem}>✓ Be available at the scheduled time</Text>
              <Text style={checklistItem}>✓ Ensure easy access to the service area</Text>
              <Text style={checklistItem}>✓ Have any relevant information ready</Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Need to reschedule? Please contact us as soon as possible at support@{businessName.toLowerCase().replace(/\s+/g, '')}.com
            </Text>
            
            <Text style={footer}>
              We look forward to serving you tomorrow!
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
  backgroundColor: '#f59e0b',
  padding: '24px',
  borderRadius: '8px 8px 0 0',
};

const content = {
  padding: '32px',
};

const iconSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const clockIcon = {
  fontSize: '48px',
  margin: '0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const h3 = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 16px',
};

const paragraph = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const reminderBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #fde68a',
};

const table = {
  width: '100%',
};

const iconCell = {
  width: '40px',
  fontSize: '24px',
  verticalAlign: 'top' as const,
  paddingTop: '12px',
};

const detailCell = {
  paddingBottom: '16px',
};

const detailLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const detailValue = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const checklistItem = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const footer = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};