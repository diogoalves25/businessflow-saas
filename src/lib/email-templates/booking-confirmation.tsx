import {
  Body,
  Button,
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
} from '@react-email/components';

interface BookingConfirmationEmailProps {
  businessName: string;
  customerName: string;
  serviceName: string;
  scheduledDate: Date;
  address?: string;
  technicianName?: string;
  notes?: string;
  price?: number;
}

export const BookingConfirmationEmail = ({
  businessName,
  customerName,
  serviceName,
  scheduledDate,
  address,
  technicianName,
  notes,
  price,
}: BookingConfirmationEmailProps) => {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
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
      <Preview>Your {serviceName} booking is confirmed for {formattedDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>{businessName}</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={h2}>Booking Confirmed! ✅</Heading>
            
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            
            <Text style={paragraph}>
              Great news! Your {serviceName} booking has been confirmed. We'll see you soon!
            </Text>

            <Section style={bookingDetails}>
              <Heading style={h3}>Booking Details</Heading>
              
              <table style={table}>
                <tbody>
                  <tr>
                    <td style={tableLabel}>Service:</td>
                    <td style={tableValue}>{serviceName}</td>
                  </tr>
                  <tr>
                    <td style={tableLabel}>Date:</td>
                    <td style={tableValue}>{formattedDate}</td>
                  </tr>
                  <tr>
                    <td style={tableLabel}>Time:</td>
                    <td style={tableValue}>{formattedTime}</td>
                  </tr>
                  {address && (
                    <tr>
                      <td style={tableLabel}>Location:</td>
                      <td style={tableValue}>{address}</td>
                    </tr>
                  )}
                  {technicianName && (
                    <tr>
                      <td style={tableLabel}>Technician:</td>
                      <td style={tableValue}>{technicianName}</td>
                    </tr>
                  )}
                  {price && (
                    <tr>
                      <td style={tableLabel}>Price:</td>
                      <td style={tableValue}>${price.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {notes && (
                <Section style={notesSection}>
                  <Text style={notesLabel}>Special Instructions:</Text>
                  <Text style={notesText}>{notes}</Text>
                </Section>
              )}
            </Section>

            <Hr style={hr} />

            <Section style={tips}>
              <Heading style={h3}>Before Your Appointment</Heading>
              <Text style={paragraph}>
                • We'll send you a reminder 24 hours before your appointment
              </Text>
              <Text style={paragraph}>
                • Please ensure someone is available at the scheduled time
              </Text>
              <Text style={paragraph}>
                • If you need to reschedule, please let us know as soon as possible
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Need to make changes? Contact us at support@{businessName.toLowerCase().replace(/\s+/g, '')}.com
            </Text>
            
            <Text style={footer}>
              Thank you for choosing {businessName}!
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
  backgroundColor: '#3b82f6',
  padding: '24px',
  borderRadius: '8px 8px 0 0',
};

const content = {
  padding: '32px',
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

const bookingDetails = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const table = {
  width: '100%',
};

const tableLabel = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  padding: '8px 0',
  width: '30%',
};

const tableValue = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '500',
  padding: '8px 0',
};

const notesSection = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #e4e4e7',
};

const notesLabel = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const notesText = {
  color: '#18181b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const tips = {
  margin: '24px 0',
};

const footer = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};