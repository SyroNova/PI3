import * as admin from 'firebase-admin';

let initialized = false;

export function initializeFirebase() {
  if (initialized) return;
  
  // Si no hay configuración de Firebase, skip silenciosamente
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('ℹ️ Firebase Admin no configurado (opcional). Push notifications deshabilitado.');
    return;
  }
  
  try {
    // Opción 1: usar JSON directamente desde .env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin inicializado desde JSON en .env');
      initialized = true;
      return;
    }
    
    // Opción 2: usar archivo de credenciales (GOOGLE_APPLICATION_CREDENTIALS)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('✅ Firebase Admin inicializado desde archivo de credenciales');
      initialized = true;
      return;
    }
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error);
    console.warn('⚠️ Push notifications no estarán disponibles');
  }
}

export async function sendPushToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failure: number }> {
  if (!initialized) {
    throw new Error('Firebase Admin no está inicializado');
  }

  if (!tokens || tokens.length === 0) {
    return { success: 0, failure: 0 };
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`📲 Push enviado: ${response.successCount} exitosos, ${response.failureCount} fallidos`);
    
    return {
      success: response.successCount,
      failure: response.failureCount,
    };
  } catch (error) {
    console.error('❌ Error enviando push:', error);
    throw error;
  }
}

export function isFirebaseInitialized(): boolean {
  return initialized;
}
