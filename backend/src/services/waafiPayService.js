const WAAFI_ENDPOINT = process.env.WAAFI_API_URL || "https://api.waafipay.net/asm";
const SUCCESS_CODES = new Set(["2001", "0", "00", "SUCCESS", "RCS_SUCCESS"]);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function normalizePhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("252")) return digits;
  if (digits.startsWith("0")) return `252${digits.slice(1)}`;
  if (digits.length === 9) return `252${digits}`;
  return digits;
}

function isWaafiSuccess(data) {
  const responseCode = String(data?.responseCode ?? data?.statusCode ?? "").toUpperCase();
  const responseMsg = String(data?.responseMsg ?? data?.message ?? data?.status ?? "").toUpperCase();
  const paramsState = String(data?.params?.state ?? data?.params?.status ?? "").toUpperCase();

  return SUCCESS_CODES.has(responseCode) || SUCCESS_CODES.has(responseMsg) || SUCCESS_CODES.has(paramsState);
}

function friendlyWaafiFailureMessage(data) {
  const raw = [
    data?.responseMsg,
    data?.message,
    data?.status,
    data?.params?.state,
    data?.params?.status,
    data?.params?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (raw.includes("cancel")) return "Lacag bixinta waa la kansalay";
  if (raw.includes("reject") || raw.includes("declin") || raw.includes("denied")) {
    return "Lacag bixinta waa la diiday";
  }
  if (raw.includes("insufficient") || raw.includes("balance") || raw.includes("fund")) {
    return "Haraagaagu kuguma filna";
  }
  if (raw.includes("invalid") || raw.includes("account") || raw.includes("phone")) {
    return "Number-ka lacag bixinta sax ma aha";
  }

  return data?.responseMsg || data?.message || "Lacag bixinta ma dhammaystirmin";
}

async function purchaseWithMobileMoney({ phoneNumber, amount, description, referenceId, invoiceId, paymentMethod }) {
  const accountNo = normalizePhoneNumber(phoneNumber);
  if (!accountNo) {
    return {
      ok: false,
      statusCode: 400,
      message: `${paymentMethod || "Mobile money"} phone number is required`,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.WAAFI_TIMEOUT_MS || 30000));

  try {
    const payload = {
      schemaVersion: "1.0",
      requestId: referenceId,
      timestamp: new Date().toISOString(),
      channelName: process.env.WAAFI_CHANNEL_NAME || "WEB",
      serviceName: process.env.WAAFI_SERVICE_NAME || "API_PURCHASE",
      serviceParams: {
        merchantUid: requiredEnv("WAAFI_MERCHANT_UID"),
        apiUserId: requiredEnv("WAAFI_API_USER_ID"),
        apiKey: requiredEnv("WAAFI_API_KEY"),
        paymentMethod: process.env.WAAFI_PAYMENT_METHOD || "mwallet_account",
        payerInfo: {
          accountNo,
        },
        transactionInfo: {
          referenceId,
          invoiceId,
          amount: Number(amount.toFixed(2)),
          currency: process.env.WAAFI_CURRENCY || "USD",
          description: `${description} via ${paymentMethod || "Mobile money"}`,
        },
      },
    };

    const response = await fetch(WAAFI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !isWaafiSuccess(data)) {
      return {
        ok: false,
        statusCode: response.ok ? 402 : response.status,
        message: friendlyWaafiFailureMessage(data),
        data,
      };
    }

    return { ok: true, data, accountNo };
  } catch (error) {
    if (error.message && error.message.includes("WAAFI_")) {
      return {
        ok: false,
        statusCode: 500,
        message: error.message,
      };
    }

    return {
      ok: false,
      statusCode: error.name === "AbortError" ? 504 : 502,
      message: error.name === "AbortError" ? "Payment request timed out" : "Payment provider is unavailable",
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { purchaseWithMobileMoney, normalizePhoneNumber };
