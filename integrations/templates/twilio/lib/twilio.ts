import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !phoneNumber) {
  throw new Error('Missing Twilio credentials');
}

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: phoneNumber,
      to,
    });
    
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

export async function sendWhatsApp(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${phoneNumber}`,
      to: `whatsapp:${to}`,
    });
    
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error('Twilio WhatsApp error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send WhatsApp message',
    };
  }
}

export async function makeCall(to: string, url: string) {
  try {
    const call = await client.calls.create({
      url,
      to,
      from: phoneNumber,
    });
    
    return {
      success: true,
      callId: call.sid,
    };
  } catch (error) {
    console.error('Twilio call error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to make call',
    };
  }
}

export async function verifyPhoneNumber(phoneNumber: string, channel: 'sms' | 'call' = 'sms') {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications
      .create({ to: phoneNumber, channel });
      
    return {
      success: true,
      status: verification.status,
    };
  } catch (error) {
    console.error('Twilio verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification',
    };
  }
}

export async function checkVerificationCode(phoneNumber: string, code: string) {
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks
      .create({ to: phoneNumber, code });
      
    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status,
    };
  } catch (error) {
    console.error('Twilio verification check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check verification',
    };
  }
}