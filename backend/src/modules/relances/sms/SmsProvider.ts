import { createHash } from "crypto";
import { env } from "../../../config/env";
import { logger } from "../../../shared/logger";

export interface SmsProvider {
  envoyer(numero: string, message: string): Promise<void>;
}

// Interface à implémenter par un vrai provider SMS (ex. Twilio, OVHcloud SMS, Vonage).
// Implémentation factice : logge l'envoi sans appel réseau, ne lève jamais d'erreur.
export class StubSmsProvider implements SmsProvider {
  async envoyer(numero: string, message: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[SMS STUB] Envoi à ${numero} : "${message}"`);
    return Promise.resolve();
  }
}

interface OvhTimeDelta {
  serveur: number;
  local: number;
}

interface OvhConfig {
  endpoint: string;
  appKey: string;
  appSecret: string;
  consumerKey: string;
  serviceName: string;
  sender?: string;
}

// Provider réel : OVHcloud SMS (API OVH, hébergement UE). L'API OVH utilise un schéma d'authentification
// signé (Application Key/Secret + Consumer Key + horodatage synchronisé sur le temps serveur), documenté sur
// https://api.ovh.com. Ne jette jamais d'exception : en cas d'échec (identifiants invalides, quota épuisé,
// service SMS mal configuré), on retombe sur StubSmsProvider pour ne jamais bloquer le job de relances.
export class OvhSmsProvider implements SmsProvider {
  private readonly stub = new StubSmsProvider();
  private decalageServeur: OvhTimeDelta | null = null;

  constructor(private readonly config: OvhConfig) {}

  async envoyer(numero: string, message: string): Promise<void> {
    try {
      const chemin = `/sms/${this.config.serviceName}/jobs`;
      const corps = JSON.stringify({
        receivers: [numero],
        message,
        sender: this.config.sender,
        noStopClause: true,
      });

      const reponse = await this.appelSigne("POST", chemin, corps);
      if (!reponse.ok) {
        throw new Error(`OVH SMS a répondu ${reponse.status} : ${await reponse.text()}`);
      }
    } catch (error) {
      logger.error(`OvhSmsProvider : échec d'envoi à ${numero}, repli sur le stub`, error);
      await this.stub.envoyer(numero, message);
    }
  }

  // Synchronise l'horloge locale sur le temps serveur OVH (recommandé par leur doc pour éviter les
  // rejets de signature liés à un décalage d'horloge).
  private async recupererDecalageServeur(): Promise<number> {
    if (this.decalageServeur) {
      return this.decalageServeur.serveur - this.decalageServeur.local;
    }
    const avant = Math.floor(Date.now() / 1000);
    const reponse = await fetch(`${this.config.endpoint}/auth/time`);
    const tempsServeur = Number(await reponse.text());
    this.decalageServeur = { serveur: tempsServeur, local: avant };
    return tempsServeur - avant;
  }

  private async appelSigne(methode: string, chemin: string, corps: string): Promise<Response> {
    const decalage = await this.recupererDecalageServeur();
    const timestamp = Math.floor(Date.now() / 1000) + decalage;
    const url = `${this.config.endpoint}${chemin}`;

    const signature =
      "$1$" +
      createHash("sha1")
        .update(
          [this.config.appSecret, this.config.consumerKey, methode, url, corps, timestamp].join("+")
        )
        .digest("hex");

    return fetch(url, {
      method: methode,
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": this.config.appKey,
        "X-Ovh-Consumer": this.config.consumerKey,
        "X-Ovh-Signature": signature,
        "X-Ovh-Timestamp": String(timestamp),
      },
      body: corps,
    });
  }
}

function construireProvider(): SmsProvider {
  const { OVH_APP_KEY, OVH_APP_SECRET, OVH_CONSUMER_KEY, OVH_SMS_SERVICE_NAME } = env;

  if (!OVH_APP_KEY || !OVH_APP_SECRET || !OVH_CONSUMER_KEY || !OVH_SMS_SERVICE_NAME) {
    return new StubSmsProvider();
  }

  return new OvhSmsProvider({
    endpoint: env.OVH_API_ENDPOINT,
    appKey: OVH_APP_KEY,
    appSecret: OVH_APP_SECRET,
    consumerKey: OVH_CONSUMER_KEY,
    serviceName: OVH_SMS_SERVICE_NAME,
    sender: env.OVH_SMS_SENDER,
  });
}

export const smsProvider: SmsProvider = construireProvider();
